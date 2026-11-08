import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Logo } from "../assets/asset";
import { createGymCenter } from "../services/gymService";
import type { GymCenterForm } from "../services/gymService";


const steps = [
  {
    title: "Gym Information",
    description: "Tell us about your fitness center.",
  },
  {
    title: "Location Details",
    description: "Where can your gym be found?",
  },
  {
    title: "Business Information",
    description: "Provide your business contact details.",
  },
  {
    title: "Online Presence",
    description: "Add your social links and review your details.",
  },
];

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50";

const labelClass =
  "mb-2 block text-sm font-medium text-gray-700 after:text-red-400 after:ml-0.5 after:content-['*'] ";
const optionalLabelClass = "mb-2 block text-sm font-medium text-gray-700";


interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}

interface FileUploadProps {
  label: string;
  name: "gymLogo" | "registrationDocument";
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  hint: string;
  required?: boolean;
}

interface ReviewItemProps {
  label: string;
  value?: string;
}

const initialForm: GymCenterForm = {
  gymName: "",
  gymLogo: null,
  gymAddress: "",
  state: "",
  localGovernmentArea: "",
  country: "",
  businessPhone: "",
  businessEmail: "",
  businessRegistrationType: "",
  cacRegistrationNumber: "",
  registrationDocument: null,
  description: "",
  socialMediaUrl: {
    facebook: "",
    instagram: "",
    tiktok: "",
    x: "",
  },
};


function FormField({
  label,
  children,
  className = "",
  optional = false,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className={optional ? optionalLabelClass : labelClass}>{label}</label>
      {children}
    </div>
  );
}

function FileUpload({
  label,
  name,
  file,
  onChange,
  accept,
  hint,
  required = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className={labelClass}>{label}</label>

      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-2 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
      >
        <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="size-4.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16V4m0 0L7 9m5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
            />
          </svg>
        </div>

        <p className="text-xs font-semibold text-gray-700">
          {file ? file.name : "Click to upload a file"}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          {hint}
        </p>

        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          className="hidden"
          aria-required={required}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.currentTarget.files?.[0] ?? null)
          }
        />
      </div>

      {file && (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
          <span className="max-w-[80%] truncate text-xs text-emerald-700">
            {file.name}
          </span>

          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-xs font-semibold text-red-500 hover:text-red-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewItem({ label, value }: ReviewItemProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="break-all text-sm font-semibold text-[#082b3c] sm:max-w-[60%] sm:text-right">
        {value || "Not provided"}
      </span>
    </div>
  );
}


export default function CreateGymCenter() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [gymForm, setGymForm] = useState<GymCenterForm>(initialForm);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const updateGymForm = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("socialMediaUrl.")) {
      const socialField = name.split(".")[1];

      setGymForm((prev) => ({
        ...prev,
        socialMediaUrl: {
          ...prev.socialMediaUrl,
          [socialField]: value,
        },
      }));
    } else {
      setGymForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setError("");
  };

  const updateFile = (
    name: "gymLogo" | "registrationDocument",
    file: File | null,
  ) => {
    setGymForm((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const validateStep = () => {
    if (!formRef.current) return false;

    if (currentStep === 1 && !gymForm.gymLogo) {
      setError("Please upload a gym logo.");
      return false;
    }

    if (
      currentStep === 3 &&
      gymForm.businessRegistrationType === "registered" &&
      !gymForm.registrationDocument
    ) {
      setError("Please upload the business registration document.");
      return false;
    }

    const isValid = formRef.current.reportValidity();

    if (!isValid) return false;

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, 4));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep()) return;

    if (!agreeTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("ghub_token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const result = await createGymCenter(gymForm);

      if (result.emailSent) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      navigate("/owner/dashboard");

    } catch (err: unknown) {
      const responseData: unknown = isAxiosError(err)
        ? err.response?.data
        : undefined;
      const responseMessage =
        typeof responseData === "object" &&
        responseData !== null &&
        "message" in responseData &&
        typeof responseData.message === "string"
          ? responseData.message
          : undefined;
      const message =
        responseMessage ??
        (err instanceof Error ? err.message : "Something went wrong.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f8faf9] px-4 py-10">

      {/* Background decoration */}

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(16,185,129,0.10),transparent_38%),radial-gradient(ellipse_at_10%_80%,rgba(220,252,231,0.45),transparent_35%)]" />

      {/* GHUB LOGO */}

      <div className="relative z-10 mb-7 flex items-center gap-2">
        <img
          src={Logo.ghub2}
          alt="GHub logo"
          className="size-10 object-contain"
        />

        <div>
          <h1 className="font-montserrat text-2xl font-bold leading-tight text-[#082b3c]">
            <span className="bg-linear-to-r from-emerald-600 to-blue-900 bg-clip-text text-transparent">
              G
            </span>
            Hub
          </h1>

          <p className="text-[10px] font-medium text-gray-500">
            Gym Management Platform
          </p>
        </div>
      </div>

      {/* REGISTRATION CARD */}

      <section className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/70">

        <div className="p-5 sm:p-8 md:p-10">

          {/* HEADER */}

          <div className="mb-7">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Gym Owner Onboarding
              </span>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                Step {currentStep} of 4
              </span>
            </div>

            <h2 className="font-montserrat text-2xl font-bold text-[#082b3c] sm:text-3xl">
              Create Your Gym Center
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Complete the information below to set up your gym
              and start managing your fitness business with GHub.
            </p>
          </div>

          {/* PROGRESS BAR */}

          <div className="mb-7">
            <div className="mb-3 flex justify-between text-xs font-medium">
              <span className="text-gray-500">
                Registration progress
              </span>

              <span className="font-bold text-emerald-600">
                {Math.round((currentStep / 4) * 100)}%
              </span>
            </div>

            <div className="flex gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    currentStep >= index + 1
                      ? "bg-emerald-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-4 gap-1">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                      currentStep === index + 1
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                        : currentStep > index + 1
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {currentStep > index + 1 ? "✓" : index + 1}
                  </div>

                  <span
                    className={`hidden text-[10px] font-medium sm:block sm:text-xs ${
                      currentStep === index + 1
                        ? "text-emerald-700"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CURRENT STEP TITLE */}

          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#082b3c]">
              {steps[currentStep - 1].title}
            </h3>

            <p className="mt-1 text-sm font-medium text-gray-500">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* FORM */}

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate={false}
          >

            {currentStep === 1 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out] space-y-5">

                <FormField label="Gym Name">
                  <input
                    type="text"
                    name="gymName"
                    value={gymForm.gymName}
                    onChange={updateGymForm}
                    placeholder="e.g. GHub Fitness Center"
                    minLength={2}
                    maxLength={100}
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Gym Description">
                  <textarea
                    name="description"
                    value={gymForm.description}
                    onChange={updateGymForm}
                    placeholder="Tell us about your gym, the services you offer and what makes your fitness center unique..."
                    maxLength={500}
                    rows={5}
                    required
                    className={`${inputClass}  resize-none h-22`}
                  />

                  <div className="mt-1 text-right text-xs text-gray-400">
                    {gymForm.description.length}/500 characters
                  </div>
                </FormField>

                <FileUpload
                  label="Gym Logo "
                  name="gymLogo"
                  file={gymForm.gymLogo}
                  onChange={(file) => updateFile("gymLogo", file)}
                  accept="image/png,image/jpeg,image/webp"
                  hint="PNG, JPG or WEBP"
                  required
                />

              </div>
            )}



            {currentStep === 2 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out] grid grid-cols-1 gap-5 sm:grid-cols-2">

                <FormField
                  label="Gym Address "
                  className="sm:col-span-2 "
                >
                  <input
                    type="text"
                    name="gymAddress"
                    value={gymForm.gymAddress}
                    onChange={updateGymForm}
                    placeholder="Enter your complete gym address"
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField label="State ">
                  <input
                    type="text"
                    name="state"
                    value={gymForm.state}
                    onChange={updateGymForm}
                    placeholder="Enter state"
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Local Government Area ">
                  <input
                    type="text"
                    name="localGovernmentArea"
                    value={gymForm.localGovernmentArea}
                    onChange={updateGymForm}
                    placeholder="Enter LGA"
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Country "
                  className="sm:col-span-2"
                >
                  <input
                    type="text"
                    name="country"
                    value={gymForm.country}
                    onChange={updateGymForm}
                    placeholder="Enter country"
                    required
                    className={inputClass}
                  />
                </FormField>

              </div>
            )}

            {/* =====================================
                STEP 3: BUSINESS INFORMATION
            ====================================== */}

            {currentStep === 3 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out] space-y-5">

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <FormField label="Business Phone ">
                    <input
                      type="tel"
                      name="businessPhone"
                      value={gymForm.businessPhone}
                      onChange={updateGymForm}
                      placeholder="+234 703 450 0042"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Business Email ">
                    <input
                      type="email"
                      name="businessEmail"
                      value={gymForm.businessEmail}
                      onChange={updateGymForm}
                      placeholder="gym@example.com"
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Business Registration Type "
                    className="sm:col-span-2"
                  >
                    <select
                      name="businessRegistrationType"
                      value={gymForm.businessRegistrationType}
                      onChange={updateGymForm}
                      required
                      className={inputClass}
                    >
                      <option value="">Select registration type</option>
                      <option value="registered">
                        Registered Business
                      </option>
                      <option value="unregistered">
                        Unregistered Business
                      </option>
                    </select>
                  </FormField>

                </div>

                {/* CONDITIONAL CAC DETAILS */}

                {gymForm.businessRegistrationType === "registered" && (
                  <div className="space-y-5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">

                    <div>
                      <h4 className="text-sm font-bold text-[#082b3c]">
                        Business Registration Details
                      </h4>

                      <p className="mt-1 text-xs text-gray-500">
                        Provide your registered business information.
                      </p>
                    </div>

                    <FormField label="CAC Registration Number ">
                      <input
                        type="text"
                        name="cacRegistrationNumber"
                        value={gymForm.cacRegistrationNumber}
                        onChange={updateGymForm}
                        placeholder="e.g. RC123456"
                        required
                        className={inputClass}
                      />
                    </FormField>

                    <FileUpload
                      label="Registration Document "
                      name="registrationDocument"
                      file={gymForm.registrationDocument}
                      onChange={(file) =>
                        updateFile("registrationDocument", file)
                      }
                      accept="application/pdf"
                      hint="PDF"
                      required
                    />

                  </div>
                )}

              </div>
            )}

            {/* =====================================
                STEP 4: ONLINE PRESENCE & REVIEW
            ====================================== */}

            {currentStep === 4 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out] space-y-6">

                <div className="space-y-5">

                  <FormField label="Facebook URL (Optional)" optional>
                    <input
                      type="url"
                      name="socialMediaUrl.facebook"
                      value={gymForm.socialMediaUrl.facebook}
                      onChange={updateGymForm}
                      placeholder="https://facebook.com/yourgym"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Instagram URL (Optional)" optional>
                    <input
                      type="url"
                      name="socialMediaUrl.instagram"
                      value={gymForm.socialMediaUrl.instagram}
                      onChange={updateGymForm}
                      placeholder="https://instagram.com/yourgym"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="TikTok URL (Optional)" optional>
                    <input
                      type="url"
                      name="socialMediaUrl.tiktok"
                      value={gymForm.socialMediaUrl.tiktok}
                      onChange={updateGymForm}
                      placeholder="https://tiktok.com/@yourgym"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="X URL (Optional)" optional>
                    <input
                      type="url"
                      name="socialMediaUrl.x"
                      value={gymForm.socialMediaUrl.x}
                      onChange={updateGymForm}
                      placeholder="https://x.com/yourgym"
                      className={inputClass}
                    />
                  </FormField>

                </div>

                {/* REVIEW DETAILS */}

                <div className="rounded-xl border border-gray-200 p-4">

                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-bold text-[#082b3c]">
                      Registration Summary
                    </h4>

                    <span className="text-xs font-medium text-emerald-600">
                      Review details
                    </span>
                  </div>

                  <ReviewItem
                    label="Gym Name"
                    value={gymForm.gymName}
                  />

                  <ReviewItem
                    label="Gym Address"
                    value={gymForm.gymAddress}
                  />

                  <ReviewItem
                    label="Location"
                    value={`${gymForm.localGovernmentArea}, ${gymForm.state}, ${gymForm.country}`}
                  />

                  <ReviewItem
                    label="Business Phone"
                    value={gymForm.businessPhone}
                  />

                  <ReviewItem
                    label="Business Email"
                    value={gymForm.businessEmail}
                  />

                  <ReviewItem
                    label="Registration Type"
                    value={gymForm.businessRegistrationType}
                  />

                  <ReviewItem
                    label="CAC Number"
                    value={gymForm.cacRegistrationNumber}
                  />

                  <ReviewItem
                    label="Gym Logo"
                    value={gymForm.gymLogo?.name}
                  />

                </div>

                {/* TERMS AND CONDITIONS */}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">

                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      setError("");
                    }}
                    required
                    className="mt-0.5 size-4 shrink-0 cursor-pointer accent-emerald-500"
                  />

                  <span className="text-xs leading-6 text-gray-600">
                    I confirm that the information provided is
                    accurate and I agree to the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Terms of Service
                    </a>
                    {" "}and{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Privacy Policy
                    </a>.
                  </span>

                </label>

              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* NAVIGATION BUTTONS */}

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-gray-100 pt-6">

              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 cursor-pointer px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span>←</span>
                  Previous
                </button>
              ) : (
                <div>
                  <p className="text-xs text-gray-400">
                    Step 1 of 4
                  </p>
                </div>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-emerald-700 cursor-pointer px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition hover:from-emerald-700 hover:to-emerald-800"
                >
                  Continue
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !agreeTerms}
                  className="flex min-w-40 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-emerald-700 cursor-pointer px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition hover:from-emerald-700 hover:to-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Gym Center
                    </>
                  )}
                </button>
              )}

            </div>

          </form>
        </div>

        {/* CARD FOOTER */}

        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 text-center">
          <p className="text-xs text-gray-500">
            Powered by{" "}
            <span className="font-bold text-[#082b3c]">GHub</span>
            {" "}· Simplifying Gym Management
          </p>
        </div>

      </section>

      <p className="relative z-10 mt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} GHub. All rights reserved.
      </p>

    </main>
  );
}
