import React from "react";
import { Link } from 'react-router-dom';
import { Logo } from "../assets/asset"
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { loginUser, type UserRole } from "../services/authServices";
import { toast } from "sonner"
import axios from "axios";
import{useLocation} from "react-router-dom"


const loginFeatures: Record<
  UserRole,
  {
    title1: string;
    title2: string;
    description: string;
    listTitle1: string;
    listDes1: string;
    listTitle2: string;
    listDes2: string;
    listTitle3: string;
    listDes3: string;
  }
> = {
  owner: {
    title1: "Better Gym",
    title2: "Stronger Communities",
    description:
      "Take control of your gym business, manage multiple branches, and build a fitness community that keeps growing.",

    listTitle1: "Manage branches and staff",
    listDes1: "Keep your gym locations and team organized.",

    listTitle2: "Grow your membership",
    listDes2: "Manage memberships and strengthen member relationships.",

    listTitle3: "Track business performance",
    listDes3: "Monitor gym operations and make informed decisions.",
  },

  staff: {
    title1: "Work Smarter",
    title2: "Serve Better",
    description:
      "Stay organized, support your team, and help deliver an excellent experience for every gym member.",

    listTitle1: "Manage daily tasks",
    listDes1: "Keep your assigned duties and gym activities organized.",

    listTitle2: "Support gym members",
    listDes2: "Help members and keep their information up to date.",

    listTitle3: "Work as a team",
    listDes3: "Collaborate with colleagues to keep gym operations running smoothly.",
  },

  instructor: {
    title1: "Inspire Progress",
    title2: "Build Strength",
    description:
      "Guide members on their fitness journeys, keep them motivated, and help them work toward their goals.",
    listTitle1: "Organize training sessions",
    listDes1: "Keep track of your scheduled classes and training sessions.",

    listTitle2: "Guide member progress",
    listDes2: "Help members stay focused on their fitness goals.",

    listTitle3: "Motivate and inspire",
    listDes3: "Encourage consistency and build a positive training environment.",
  },

  member: {
    title1: "Train with Purpose",
    title2: "Grow with Confidence",
    description:
      "Make every workout count, stay connected to your gym, and work toward becoming a stronger, healthier you.",

    listTitle1: "Stay on track",
    listDes1: "Keep up with your workout schedule and fitness routine.",

    listTitle2: "Follow your progress",
    listDes2: "Stay focused on your personal fitness goals.",

    listTitle3: "Join the community",
    listDes3: "Stay connected with your gym and enjoy your fitness journey.",
  },
};

const isUserRole = (role: unknown): role is UserRole =>
  role === "owner" || role === "staff" || role === "instructor" || role === "member";

const LoginPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetStateRole = location.state?.resetStateRole;
  const [selectedRole, setSelectedRole] = useState<UserRole | "">(
    isUserRole(resetStateRole) ? resetStateRole : "",
  );
  const [nextPage, setNextPage] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const content = loginFeatures[selectedRole || "owner"];
  const [error, setError] = useState("");
  const LoginSelectedRole = isUserRole(resetStateRole) ? resetStateRole : "";
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function update (event: React.ChangeEvent<HTMLInputElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");

      if (!selectedRole) {
        setError("Please select a role.");
        return;
      }
      if (!form.email || !form.password) {
        setError("Please fill in all fields");
        return;
      }

      const response = await loginUser(selectedRole, {
        email: form.email,
        password: form.password,
      });

      if (response.success && response.token) {
          localStorage.setItem("ghub_token", response.token);
          toast.success("Login successful!");
          if(selectedRole === "owner") {
            const destination =
              response.onboardingStatus === "completed"
                ? "/owner/dashboard"
                : "/v1/gym-center";
            setTimeout(() => navigate(destination, { replace: true }), 1200);
          }else if(selectedRole === "staff") {
            setTimeout(() => navigate("/gym-employees/dashboard", { replace: true }), 1200);
          }else if(selectedRole === "instructor") {
            setTimeout(() => navigate("/instructor/dashboard", { replace: true }), 1200);
          }else if(selectedRole === "member") {
            setTimeout(() => navigate("/member/dashboard", { replace: true }), 1200);
          }
      } else {
          const message = response.message || "Invalid email or password";
          setError(message);
          toast.error(message);
          setForm((current) => ({ ...current, password: "" }));
        }
    } catch (error: unknown) {
        const message = !navigator.onLine
          ? "You are offline. Please connect to the internet and try again."
          : axios.isAxiosError<{ message?: string }>(error) &&
              typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "Unable to sign in. Please try again.";
        setError(message);
        setForm((current) => ({ ...current, password: "" }));
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(187,247,208,0.45),transparent_38%),radial-gradient(ellipse_at_15%_10%,rgba(220,252,231,0.55),transparent_32%)]" />
      {!nextPage && !LoginSelectedRole ? (<section className="flex flex-col lg:flex-row gap-3 justify-center items-center relative z-20 mx-8 md:mx-0  md:w-4/6 bg-white p-6 rounded-2xl shadow-2xl  shadow-gray-200/80">
        <div className="flex flex-col w-full">
          {/* logo decorattion */}
          <div className="flex justify-center md:justify-start items-center gap-1 mb-5">
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
            <h1 className="font-montserrat text-xl font-bold text-[#082b3c] ">Get To Know You</h1>
            <p className="text-gray-700 text-inter text-sm mt-1">Lorem ipsum dolor sit amet consectetur adipisicing elit. In consequuntur quibusdam dolores quas quaerat quo ipsa eaque fugiat tempore veritatis dolor mollitia explicabo nemo,.</p>
          </div>
        </div>
        <div className="w-full">
          <div className="flex gap-1 justify-end items-center" >
            <span className="p-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-700 size-8 text-white flex justify-center items-center  ">1</span>
            <span className="p-2 rounded-full bg-gray-100 size-8 text-white flex justify-center items-center  ">2</span>
          </div>
          <div className="w-full mt-2.5">
            <label htmlFor="userRole" className="mb-2 block text-sm font-medium text-[#082b3c]">
              Select your account type
            </label>

            <select
              id="userRole"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-inter text-sm"
              required
            >
              <option className="::placeholder:text-gray-300" value="" disabled>
                --none
              </option>
              <option value="owner">Owner</option>
              <option value="staff">Staff</option>
              <option value="instructor">Instructor</option>
              <option value="member">Member</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="button" disabled={!selectedRole} onClick={() => setNextPage(!nextPage)}
              className="flex justify-center items-center gap-2 py-1.5 cursor-pointer cur px-6 text-sm text-inter text-white mt-5 rounded-sm transition-all duration-200 bg-gradient-to-bl from-green-600 to-green-800  hover:scale-105  disabled:bg-none disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100">
              Next
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>) : (
        <section className="flex flex-col lg:flex-row gap-3 justify-center items-center relative z-20 mx-8 md:mx-0 w-full   md:w-4/6 bg-white p-6 rounded-2xl shadow-2xl  shadow-gray-200/80">
          <div className="flex flex-col w-full space-y-12">
            {/* logo decorattion */}
            <div className="flex justify-center md:justify-start items-center gap-1">
              <img src={Logo.ghub2} className="size-9" alt="" />
              <div className="flex flex-col justify-center items-start ">
                <div className="font-montserrat text-2xl font-bold text-[#082b3c] ">
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-900 bg-clip-text text-transparent">G</span>
                  <span>Hub</span>
                </div>
                <div className="text-xs font-medium text-gray-800">Gym Management Platform</div>
              </div>
            </div>
            <div className="hidden lg:block" >
              <h1 className="font-montserrat text-2xl font-bold text-[#082b3c]">{content.title1}<br /><span className="text-green-700">{content.title2}</span> </h1>
              <p className="text-gray-700 text-inter text-sm mt-2 mr-2">{content.description}</p>

              <ul className="space-y-3 mt-5">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-800">{content.listTitle1}</h3>
                    <p className="mt-1 text-xs leading-6 text-gray-400">
                      {content.listDes1}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </span>
                  <div>

                    <h3 className="font-semibold text-gray-800 text-sm">{content.listTitle2}</h3>
                    <p className="mt-1 text-xs leading-6 text-gray-400">
                      {content.listDes2}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{content.listTitle3}</h3>
                    <p className="mt-1 text-xs leading-6 text-gray-400">
                      {content.listDes3}
                    </p>
                  </div>
                </li>
              </ul>

            </div>
            <div className=" hidden lg:block relative bottom-0 mx-auto text-xs ">
              <p className="text-xs text-gray-400">
                © 2026 <span className="font-semibold text-gray-400">GHub Management Platform</span>.
                All rights reserved.
              </p>
            </div>
          </div>

          <div className="w-full ">
            <div className="hidden md:flex gap-1 justify-end items-center" >
              <span className="p-2 rounded-full bg-gray-100 size-8 text-white flex justify-center items-center  ">1</span>
              <span className="p-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-700 size-8 text-white flex justify-center items-center  ">2</span>

            </div>
            <div className="text-sm font-bold font-inter text-blue-700">Welcome Back</div>
            {/* Heading */}
            <div className="mb-5 text-start">
              <h1 className="text-xl font-bold font-montserrat text-[#082b3c]">
                <span>{selectedRole === "owner"
                  ? "Gym Owner"
                  : selectedRole === "staff"
                    ? "Employee"
                    : selectedRole === "instructor"
                      ? "Instructor"
                      : selectedRole === "member"
                        ? "Member"
                        : "User"}</span>
              </h1>
              <p className="mt-1 text-sm text-inter text-gray-500">
                Sign in to your GHub account
              </p>
              </div>
              
              {error && (
                <p className="text-red-500 text-sm my-2 ">
                  {error}
                </p>
              )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
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
                      name="email"
                      value={form.email}
                      onChange={update}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="w-full">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-inter font-medium text-gray-700"
                >
                  Password
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
                      name="password"
                      value={form.password}
                      onChange={update}
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
              </div>

              <div className="flex justify-end">
                <Link
                    to={`/v1/auth/forget-password`}
                    state={{ selectedRole }}
                  className="text-sm font-medium text-green-600 hover:text-emerald-700"
                >
                  Forgot password?
                </Link>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                  </>
                )}
              </button>
            </form>

            {/* Registration Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to={`/v1/auth/register`}
                className="font-semibold text-emerald-600 hover:text-amber-500 transition-all ease-in-out duration-300"
              >
                Create Account
              </Link>
            </p>

            <button onClick={() => setNextPage(!nextPage)} className="flex  justify-end w-full text-sm items-center mt-5 md:mt-2  gap-0.5 text-gray-600 hover:text-amber-600 transition-all ease-in-out duration-300 cursor-pointer ">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              back
            </button>
          </div>

        </section>
      )}
    </main>
  );
};

export default LoginPage;
