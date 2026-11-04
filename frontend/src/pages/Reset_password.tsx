import React from 'react'
import { Logo } from "../assets/asset"
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom"
import { toast } from "sonner"
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { resetPassword, type UserRole } from "../services/authServices"

const isUserRole = (role: unknown): role is UserRole =>
    role === "owner" || role === "staff" || role === "instructor" || role === "member";

const Reset_password = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [form, setForm] = useState({password: "", confirmPassword: ""})
    const [loading, setLoading] = useState(false)
    const resetStateRole = isUserRole(location.state?.selectedRole)
        ? location.state.selectedRole
        : sessionStorage.getItem("ghub_password_reset_role");
    const selectedRole = isUserRole(resetStateRole)
        ? resetStateRole
        : undefined;
    const resetToken = typeof location.state?.resetToken === "string"
        ? location.state.resetToken
        : sessionStorage.getItem("ghub_password_reset_token");
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    function Update(event: React.ChangeEvent<HTMLInputElement>) {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    }

    const handlingResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setLoading(true)
            setError("")

            if (!form.confirmPassword || !form.password) {
                return setError("Password not match")
            }

            if (form.confirmPassword != form.password) {
              return setError("Password not match")
            }   

            if (!selectedRole || !resetToken) {
                return setError("Your password reset session is missing or expired. Request a new verification code.")
            }

            sessionStorage.setItem("ghub_password_reset_token", resetToken);
            const reset_password = await resetPassword(
                selectedRole,
                { newPassword: form.password, confirmPassword: form.confirmPassword },
            )
            sessionStorage.removeItem("ghub_password_reset_token");
            sessionStorage.removeItem("ghub_password_reset_role");
            toast.success(reset_password.message || "Password reset successfully.");
            setTimeout(
                () =>
                    navigate("/v1/auth/login", {
                        replace: true,
                        state: { resetStateRole: selectedRole },
                    }),
                1200,
            );
        }catch (error: unknown) {
            const message = axios.isAxiosError<{ message?: unknown }>(error) &&
            typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "An unexpected error occurred.";
            setError(message);
        } finally {
            setLoading(false);
        }
       
    }

  return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(187,247,208,0.45),transparent_38%),radial-gradient(ellipse_at_15%_10%,rgba(220,252,231,0.55),transparent_32%)]" />
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
              <h1 className="font-montserrat text-2xl font-bold text-[#082b3c] ">Reset Password</h1>
              <p className="text-gray-700 text-inter text-sm mt-1  w-[80%]">create a new password to your account. </p>
            </div>
              </div>

             {error && (
            <p className="text-red-500 text-sm  flex justify-start items-start w-full">
              {error}
            </p>
          )}
              
              <form onSubmit={handlingResetPassword} className="space-y-5 w-full">
                  <div className="w-full">
                        <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-inter font-medium text-gray-700"
                        >
                        New Password
                        </label>
              
                        {/* Password input and toggle container */}
                        <div className="flex w-full items-center overflow-hidden rounded-lg border border-gray-300 bg-white transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                        {/* Lock icon */}
                        <div className="flex items-center self-stretch bg-gray-100 px-3 text-gray-500">
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
                                d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0 1 19.5 12.75v6A2.25 2.25 0 0 1 17.25 21h-10.5A2.25 2.25 0 0 1 4.5 18.75v-6A2.25 2.25 0 0 1 6.75 10.5Z"
                            />
                            </svg>
                        </div>
        
                        {/* Password input */}
                        <input
                            type={showPassword ? "text" : "password"}
                        id="password"
                        onChange={Update}
                            name="password"
                            value={form.password}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />
        
                        {/* Show / hide password button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                            className="flex items-center cursor-pointer self-stretch px-3 text-gray-500 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                        >
                            {!showPassword ? (
                            /* Eye with slash */
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
        
                            ) : (
                            /* Open eye */
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            )}
                        </button>
                        </div>
                  </div>
                  
                    <div className="w-full">
                        <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-inter font-medium text-gray-700"
                        >
                        Confirm New Password
                        </label>

                        {/* Password input and toggle container */}
                        <div className="flex w-full items-center overflow-hidden rounded-lg border border-gray-300 bg-white transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                        {/* Lock icon */}
                        <div className="flex items-center self-stretch bg-gray-100 px-3 text-gray-500">
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
                                d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0 1 19.5 12.75v6A2.25 2.25 0 0 1 17.25 21h-10.5A2.25 2.25 0 0 1 4.5 18.75v-6A2.25 2.25 0 0 1 6.75 10.5Z"
                            />
                            </svg>
                        </div>

                        {/* Password input */}
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        onChange={Update}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            placeholder="Confirm your password"
                            autoComplete="current-password"
                            required
                            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />

                        {/* Show / hide password button */}
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            aria-label={showConfirmPassword? "Hide password" : "Show password"}
                            aria-pressed={showConfirmPassword}
                            className="flex items-center cursor-pointer self-stretch px-3 text-gray-500 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                        >
                            { !showConfirmPassword ? (
                            /* Eye with slash */
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>

                            ) : (
                            /* Open eye */
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            )}
                        </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex justify-center items-center gap-1.5 w-full  rounded-lg bg-gradient-to-br from-green-700 to-emerald-800  py-3 font-medium text-white transition hover:from-green-800 hover:to-emerald-900 cursor-pointer transition-all ease-in-out duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                    >
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
                            Confirming...
                        </>
                        ) : (
                        <>
                            Reset Password
                        </>
                        )}
                    </button>
              </form>
              <div className='flex justify-center items-center gap-1  mt-2'>
                <p className="text-gray-700 text-sm ">Back to </p>
                <Link to={`/v1/auth/login`} className="text-green-500 cursor-pointer text-sm  hover:text-amber-500">Login</Link>
                </div>
              
          </section>
    </main>
  )
}

export default Reset_password
