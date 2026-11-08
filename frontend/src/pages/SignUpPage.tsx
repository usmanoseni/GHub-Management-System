import React from 'react'
import { gymImg, icons, Logo } from "../assets/asset"
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { register } from '../services/authServices'
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import axios from 'axios'
import {useLocation } from "react-router-dom";


const SignUpPage = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const [rotateImg, setRotateImg] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    middlename: "",
    email: "",
    password: "",
    phone_no: "",
    address: "",
    state: "",
    country: ""
  })
  
  function update(event: React.ChangeEvent<HTMLInputElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }
    
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const requiredFields = [
      form.firstname,
      form.lastname,
      form.address,
      form.country,
      form.email,
      form.password,
      form.state,
      form.phone_no,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      const message = "Please fill in all required fields.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      const message = "Please enter a valid email address.";
      setError(message);
      toast.error(message);
      return;
    }

    if (form.password.length < 6 || form.password.length > 128) {
      const message = "Password must be between 6 and 128 characters.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!agreeTerms) {
      const message = "Please agree to the Terms of Service and Privacy Policy.";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        ...form,
        firstname: form.firstname.trim(),
        middlename: form.middlename.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        phone_no: form.phone_no.trim(),
        address: form.address.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
      });

      if (!res.success || !res.token) {
        const message = res.message || "Unable to create account. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      localStorage.setItem("ghub_token", res.token);
      toast.success("Account created successfully!");
      setSuccess(true);
      setTimeout(() => navigate("/v1/gym-center", { replace: true }), 2000);
    } catch (submitError: unknown) {
      const message = !navigator.onLine
        ? "You are offline. Please connect to the internet and try again."
        : axios.isAxiosError<{ message?: string }>(submitError) &&
            typeof submitError.response?.data?.message === "string"
          ? submitError.response.data.message
          : "Unable to create account. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setRotateImg((prev) => (prev + 1) % gymImg.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  
   const inputClass =
    " w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-700  after:text-red-400 after:ml-0.5 after:content-['*']";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(187,247,208,0.35),transparent_18%),radial-gradient(ellipse_at_15%_10%,rgba(220,252,231,0.40),transparent_12%)]" />
        {!success ?(<div className="flex relative w-full ">
        <section className="hidden  md:block md:fixed  md:w-[40%] md:top-0 md:left-0 h-[100vh]">
          <img src={gymImg[rotateImg]} alt="Sign Up" className='absolute z-10 w-full h-full object-cover transition-opacity duration-1000 ease-in-out' />
          <div className="absolute z-20 w-full h-full bg-gray-800/50" />
            {/* logo decorattion */}
            <div className="flex justify-center md:justify-start items-center gap-1 mb-5 relative z-20 top-5 left-5">
              <img src={Logo.ghub1} className="size-9" alt="" />
              <div className="flex flex-col justify-center items-start ">
                <div className="font-montserrat text-2xl font-bold text-white">
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-900 bg-clip-text text-transparent">G</span>
                  <span >Hub</span>
                </div>
                <div className="text-xs font-medium text-white">Gym Management Platform</div>
              </div>
            </div>
          
            <div className="relative z-20 pl-5 mt-24  ">
              <div className="flex justify-start items-center gap-1">
                <div className="mb-6 h-1 w-14 rounded-full bg-amber-400" />
                <div className="mb-6 h-1 w-14 rounded-full bg-blue-400" />
                <div className="mb-6 h-1 w-14 rounded-full bg-rose-400" />
              </div>
            
              <h1 className="text-3xl font-bold leading-tight lg:text-4xl font-montserrat text-white">
                Simplify gym management.<br />
                <span className='text-green-500'>Grow your business.</span>
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-relaxed text-green-50 lg:text-base">
             Create your account and bring your gym operations, members, staff, and branches together in one place.
              </p>

              <div className="mt-9 space-y-5">
                  {[
                      "Manage your gym members and memberships",
                      "Organize your staff and instructors",
                    "Monitor your gym's performance",
                      "Manage multiple gym branches"
                  ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-200/50 text-sm">
                          ✓
                      </span>
                      <span className="text-sm text-green-50">{item}</span>
                      </div>
                  ))}
              </div>
            </div>
         
            <p className="relative z-20 text-center -bottom-[10%] text-xs text-gray-400">
              © 2026 <span className="font-semibold text-gray-400">GHub Management Platform</span>.
              All rights reserved.
            </p>
            
          </section>
        <section className="w-[100%] md:w-[60%] relative md:left-[40%] lg:px-12 px-6 flex flex-col  ">
          
           {/* logo decorattion */}
          <div className="md:hidden flex justify-start items-center gap-1 mb-6">
            <img src={Logo.ghub2} className="size-9" alt="" />
            <div className="flex flex-col justify-center items-start ">
              <div className="font-montserrat text-2xl font-bold text-[#082b3c] ">
                <span className="bg-gradient-to-r from-emerald-600 to-blue-900 bg-clip-text text-transparent">G</span>
                <span>Hub</span>
              </div>
              <div className="text-xs font-medium text-gray-800">Gym Management Platform</div>
            </div>
          </div>
          <div className="w-[100%]  lg:w-[80%] lg:mx-auto">
           <div className="text-sm font-bold font-inter text-blue-700  ">GET STARTED</div>
            {/* Heading */}
            <div className="mb-5 text-start">
              <h1 className="text-2xl lg:text-3xl font-bold font-montserrat text-[#082b3c]">
                Create Your Account
              </h1>
              <p className="mt-1 text-sm text-inter text-gray-500 w-full">
                Get started with GHub and take your gym management to the next level. Fill in your details below to create your account.
              </p>
            </div>
         </div>

            <form onSubmit={handleSubmit} className="space-y-5 w-[100%] lg:w-[80%] lg:mx-auto ">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstname" className={labelClass}>
                      First name 
                    </label>
                    <input
                      id="firstname"
                      type="text"
                      name="firstname"
                      onChange={update}
                  value={form.firstname}
                      placeholder="First name"
                      autoComplete="given-name"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="middlename" className="mb-2 block text-sm font-medium text-gray-700">
                        Middle name
                    </label>
                    <input
                      id="middlename"
                      type="text"
                  name="middlename"
                  onChange={update}
                  value={form.middlename}
                  placeholder="Middle name"
                  autoComplete="additional-name"
                  className={inputClass}
                    />
              </div>
              
               <div className="sm:col-span-2">
                    <label htmlFor="lastname" className={labelClass}>
                      Last name 
                    </label>
                    <input
                      id="lastname"
                      type="text"
                  name="lastname"
                  onChange={update}
                  value={form.lastname}
                      placeholder="Last name"
                      autoComplete="family-name"
                      required
                      className={inputClass}
                    />
                </div>

              <div className="sm:col-span-2">
                    <label htmlFor="email" className={labelClass}>
                      Email address 
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
                      <input
                        id="email"
                        type="email"
                    name="email"
                    onChange={update}
                  value={form.email}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className={`${inputClass} border-none rounded-none focus:ring-0 focus:border-none`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="password" className={labelClass}>
                      Password 
                    </label>
                    <div className="flex w-full items-center overflow-hidden rounded-lg border border-gray-200 bg-white transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
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
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={update}
                  value={form.password}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        minLength={6}
                        maxLength={128}
                        required
                        className={`${inputClass} border-none rounded-none focus:ring-0 focus:border-none`}
                      />
                      {/* Show / hide password button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="flex items-center cursor-pointer self-stretch px-3 text-gray-500 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                  >
                    {showPassword ? (
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
                    <p className="mt-2 text-xs text-gray-400">
                      Use 6 to 128 characters.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone_no" className={labelClass}>
                      Phone number 
                </label>
                <div className="flex w-full items-center overflow-hidden rounded-lg border border-gray-300 bg-white transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                    
                      <div className="flex items-center justify-center self-stretch bg-gray-100 px-3 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                        </svg>
                      </div>
                  
                    <input
                      id="phone_no"
                      type="tel"
                    name="phone_no"
                    onChange={update}
                  value={form.phone_no}
                      placeholder="+234 703 450 0042"
                      autoComplete="tel"
                      required
                      className={`${inputClass} border-none rounded-none focus:ring-0 focus:border-none`}
                  />
                  </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className={labelClass}>
                      Address 
                    </label>
                    <input
                      id="address"
                      type="text"
                  name="address"
                   onChange={update}
                  value={form.address}
                      placeholder="Enter your address"
                      autoComplete="street-address"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className={labelClass}>
                      State 
                    </label>
                    <input
                      id="state"
                      type="text"
                  name="state"
                       onChange={update}
                  value={form.state}
                      placeholder="State"
                      autoComplete="address-level1"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className={labelClass}>
                      Country 
                    </label>
                    <input
                      id="country"
                      type="text"
                  name="country"
                   onChange={update}
                  value={form.country}
                      placeholder="Country"
                      autoComplete="country-name"
                      required
                      className={inputClass}
                    />
                  </div>
            </div>
            <div className="text-xs flex justify-start items-start gap-2 text-gray-500 mt-12">
  <input
    required
    type="checkbox"
    checked={agreeTerms}
    onChange={(e) => setAgreeTerms(e.target.checked)}
    className="mt-0.5 cursor-pointer accent-emerald-500"
  />

  <p>
    I agree to the{" "}
    <a
      href="/terms"
      target="_blank"
      rel="noopener noreferrer"
      className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="/privacy-policy"
      target="_blank"
      rel="noopener noreferrer"
      className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
    >
      Privacy Policy
    </a>.
  </p>
</div>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <button
                  type="submit"
                  disabled={loading || !agreeTerms}
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
                    Registing...
                  </>
                ) : (
                  <>
                    Create Account
                  </>
                )}
              </button>
          </form>
          
            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to={`/v1/auth/login`}
                className="font-semibold text-emerald-600 hover:text-amber-500 transition-all ease-in-out duration-300"
              >
                Sign in
              </Link>
            </p>
        </section>
      </div>):(
      <div className='flex flex-col justify-center items-center gap-1  sm:w-4/6 md:w-3/6  lg:w-2/5 xl:w-2/6 bg-white relative z-20 h-[40vh] rounded-2xl shadow'>
        <div role="status" className="w-full rounded-lg  p-4 text-center text-sm font-medium text-emerald-800">
        Account created successfully.
        </div>
        <div className='flex justify-center items-center gap-1 font-bold text-xl mb-2 bg-emerald-50 size-24 rounded-full  mt-2'>
            <img src={icons.mark} alt="Verified" className='size-16' />
          </div>
          <p>Redirecting ...</p>
      </div>)}
    </main>
  )
}

export default SignUpPage
