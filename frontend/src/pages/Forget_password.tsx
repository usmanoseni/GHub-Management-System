import React from 'react'
import { Logo, icons } from "../assets/asset"
import { useEffect, useRef, useState } from "react";
import {Link} from "react-router-dom"
import { useLocation } from "react-router-dom";
import { toast } from "sonner"
import axios from "axios";
import { ForgetPassword, verifyPasswordResetOtp } from '../services/authServices';
import { useNavigate } from "react-router-dom";



const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

const Forget_password = ({ }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.selectedRole;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
  });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(0);
  const email = formData.email;
  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  const hiddenEmail = `${email.slice(0, 2)}**${email.slice(8, -10)}@${email.split('@')[1]}`;

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setSecondsLeft((remaining) => Math.max(remaining - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const resendOtp = async () => {
    if (loading || secondsLeft > 0) return;

    if (!selectedRole || !validateEmail(email)) {
      const message = "Please no valid email address found and try again.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await ForgetPassword(selectedRole, { email: email.trim()});
      if (!res.success) {
        throw new Error(res.message || "Could not resend the verification code.");
      }

      setOtp(Array(OTP_LENGTH).fill(''));
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      setOtpVerified(false);
      setSuccess("A new verification code has been sent to your email.");
      toast.success("Verification code resent.");
      inputRefs.current[0]?.focus();

      
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: unknown }>(error) &&
        typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : error instanceof Error
          ? error.message
          : !navigator.onLine
            ? "You are offline. Check your connection and try again."
            : "Could not resend the verification code. Check the server and email configuration.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    const otpCode = otp.join("");
    if (!/^\d{6}$/.test(otpCode)) {
      const message = "Enter the complete 6-digit verification code.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      const res = await verifyPasswordResetOtp(selectedRole, otpCode);
      if (!res.success || typeof res.token !== "string") {
        throw new Error(res.message || "The verification code could not be confirmed.");
      }

      setOtpVerified(true);
      setSecondsLeft(0);
      setSuccess("Your verification code was confirmed.");
      toast.success(res.message || "Email verified successfully.");
      sessionStorage.setItem("ghub_password_reset_token", res.token);
      sessionStorage.setItem("ghub_password_reset_role", selectedRole);
      setTimeout(
        () =>
          navigate("/v1/auth/reset-password", {
            replace: true,
            state: { selectedRole, resetToken: res.token },
          }),
        2000,
      );
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: unknown }>(error) &&
        typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : error instanceof Error
          ? error.message
          : !navigator.onLine
            ? "You are offline. Check your connection and try again."
            : "Could not verify the code. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  const updateOtp = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    setOtp((current) => current.map((digit, digitIndex) => digitIndex === index ? value : digit));
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const pasteOtp = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedOtp = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedOtp) return;
    event.preventDefault();
    setOtp(Array.from({ length: OTP_LENGTH }, (_, index) => pastedOtp[index] || ''));
    inputRefs.current[Math.min(pastedOtp.length, OTP_LENGTH - 1)]?.focus();
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    try {
      setLoading(true);
      setError("");
      setSuccess("")
      setVerified(false)
       if (!selectedRole) {
        setError("Please select a role.");
        return;
      }
      if (!validateEmail(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const res = await ForgetPassword(selectedRole, {
        email: formData.email.trim().toLowerCase()
      });
      if (res.success) {
        setSuccess("A verification code has been sent to your email.");
        setVerified(true);
        setOtpVerified(false);
        setOtp(Array(OTP_LENGTH).fill(''));
        setSecondsLeft(RESEND_COOLDOWN_SECONDS);
        toast.success("Verification email sent.");
      } else {
        const message = res.message || "Could not send the verification email.";
        setError(message);
        toast.error(message || "Could not send the verification email.");
      }
    }
    catch (error: unknown) {
      console.error("Error during email verification:", error);
      const message = axios.isAxiosError<{ message?: unknown }>(error) &&
        typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : !navigator.onLine
          ? "You are offline. Check your connection and try again."
          : "Could not send the verification email. Check the server and email configuration.";
      setError(message);
      toast.error(message);
    }
    finally {
      setLoading(false);
    }
    
  }


  function update(event: React.ChangeEvent<HTMLInputElement>) { 
    setFormData((prev) => ({...prev, [event.target.name]: event.target.value }));
  }
 
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-10">
        {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(187,247,208,0.45),transparent_38%),radial-gradient(ellipse_at_15%_10%,rgba(220,252,231,0.55),transparent_32%)]" />
      {!verified ? (
        <section className="flex flex-col gap-3  justify-center items-center relative z-20 mx-8 md:mx-0   sm:w-4/6 md:w-3/6  lg:w-2/5 xl:w-2/6  bg-white p-6 rounded-2xl shadow-2xl  shadow-gray-200/80">
          <div className="flex flex-col w-full">
            {/* logo decorattion */}
            <div className="flex justify-center items-center gap-1 mb-6">
              <img src={Logo.ghub2} className="size-9" alt="" />
              <div className="flex flex-col justify-center items-start ">
                <div className="font-montserrat text-2xl font-bold text-[#082b3c] ">
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-900 bg-clip-text text-transparent">G</span>
                  <span>Hub</span>
                </div>
                <div className="text-xs font-medium text-gray-800">Gym Management Platform</div>
              </div>
            </div>
            <div>
              <h1 className="font-montserrat text-2xl font-bold text-[#082b3c] ">Can't Sign In?</h1>
              <p className="text-gray-700 text-inter text-sm mt-1  w-[80%]">Type your email so we can send you a password recovery email.</p>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm  flex justify-start items-start w-full">
              {error}
            </p>
          )}
        
          <form onSubmit={handleSubmit} className=" w-full mt-3 space-y-6">
            <div className="w-full">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-inter font-medium text-gray-700"
              >
                Email Address
              </label>

              {/* Input and icon container */}
              <div className="flex w-full items-center overflow-hidden rounded-lg border border-gray-300 bg-white transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                {/* Email icon */}
                <div className="flex items-center justify-center self-stretch bg-gray-100 px-3 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </div>

                {/* Email input */}
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={update}
                  name="email"
                  placeholder="myEmail@example.com"
                  autoComplete="email"
                  required
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="flex justify-center items-center gap-1.5 w-full  rounded-lg bg-gradient-to-br from-green-700 to-emerald-800  py-3 font-medium text-white transition hover:from-green-800 hover:to-emerald-900 cursor-pointer transition-all ease-in-out duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none">
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity=".25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Verifying ...
                </>
              ) : (
                <>
                  Verify Email
                </>
              )}
            </button>
          </form>
          <div className='flex justify-center items-center gap-1  mt-2'>
            <p className="text-gray-700 text-sm ">Back to </p>
            <Link to={`/v1/auth/login`} className="text-green-500 cursor-pointer text-sm  hover:text-amber-500">Login</Link>
          </div>
        </section>) : (
          <section className="flex flex-col gap-3  justify-center items-center relative z-20 mx-8 md:mx-0   sm:w-4/6 md:w-3/6 lg:w-2/5 xl:w-2/6  bg-white p-6 rounded-2xl shadow-2xl  shadow-gray-200/80">
            <div className="flex flex-col w-full">
            {/* logo decorattion */}
            <div className="flex justify-center items-center gap-1 mb-6">
              <img src={Logo.ghub2} className="size-9" alt="" />
              <div className="flex flex-col justify-center items-start ">
                <div className="font-montserrat text-2xl font-bold text-[#082b3c] ">
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-900 bg-clip-text text-transparent">G</span>
                  <span>Hub</span>
                </div>
                <div className="text-xs font-medium text-gray-800">Gym Management Platform</div>
              </div>
            </div>

            {!otpVerified&&(<p className="text-gray-700 text-inter text-sm mt-1 w-[80%]">Enter the otp code sent to your email <span className='text-amber-500'> {hiddenEmail}</span></p>)}
          </div>
            {otpVerified ? (
              <div className='flex flex-col justify-center items-center gap-1'>
                <div role="status" className="w-full rounded-lg  p-4 text-center text-sm font-medium text-emerald-800">
                Your OTP has been verified successfully.
                </div>
                <div className='flex justify-center items-center gap-1 font-bold text-xl bg-emerald-50 size-24 rounded-full  mt-2'>
                <img src={icons.mark} alt="Verified" className='size-16' />
                </div>
              </div>
             
            ) : (
              <form onSubmit={handleVerifyOtp} className="w-full">
                {error && <p role="alert" className="mb-3 w-full text-sm text-red-500">{error}</p>}
                {/* {success && <p role="status" className="mb-3 w-full text-sm text-emerald-700">{success}</p>} */}
                <div className="flex justify-center gap-3 xl:gap-5 mt-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(input) => { inputRefs.current[index] = input; }}
                      value={digit}
                      maxLength={1}
                      inputMode="numeric"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      onPaste={pasteOtp}
                      onChange={(event) => updateOtp(event.target.value, index)}
                      onKeyDown={(event) => {
                        if (event.key === 'Backspace' && !digit && index > 0) inputRefs.current[index - 1]?.focus();
                      }}
                      className="size-12 rounded-lg border border-gray-300 text-center font-semibold text-slate-800 outline-none focus:border-green-500"
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between gap-1 text-sm">
                  <div className="text-slate-700 dark:text-slate-300">Check your email?</div>
                  <div>
                    {secondsLeft > 0 ? (
                      <span className="text-gray-500 font-medium dark:text-gray-300">{formattedTime}</span>
                    ) : (
                      <button type="button" onClick={resendOtp} disabled={loading} className="font-medium text-green-500 hover:text-amber-500 disabled:opacity-60 cursor-pointer transition-all duration-200">
                        Resend code
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== OTP_LENGTH}
                  className="mt-10 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br from-green-700 to-emerald-800 py-3 font-medium text-white transition duration-200 hover:from-green-800 hover:to-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}
            {!otpVerified && (<div className='flex justify-center items-center gap-1  mt-2'>
              <p className="text-gray-700 text-sm ">Back to </p>
              <Link to={`/v1/auth/login`} className="text-green-500 cursor-pointer text-sm  hover:text-amber-500">Login</Link>
            </div>)}
        </section>)}
    </main>
  )
}

export default Forget_password
