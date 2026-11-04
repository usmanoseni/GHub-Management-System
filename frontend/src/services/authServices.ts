import api from "./api";

export type UserRole =
  | "owner"
  | "staff"
  | "instructor"
  | "member";

interface LoginData {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

const loginEndpoints: Record<UserRole, string> = {
  owner: "/api/v1/auth/login",
  staff: "/api/v1/gym-employees/auth/login",
  instructor: "/api/v1/instructors/auth/login",
  member: "/api/v1/members/auth/login",
};

const forgetPasswordEndpoints: Record<UserRole, string> = {
  owner: "/api/v1/auth/forgot-password",
  staff: "/api/v1/gym-employees/auth/forgot-password",
  instructor: "/api/v1/instructors/auth/forgot-password",
  member: "/api/v1/members/auth/forgot-password",
};

const validateOtpEndpoints: Record<UserRole, string> = {
  owner: "/api/v1/auth/validate-otp",
  staff: "/api/v1/gym-employees/auth/validate-otp",
  instructor: "/api/v1/instructors/auth/validate-otp",
  member: "/api/v1/members/auth/validate-otp",
};

const resetPasswordEndpoints: Record<UserRole, string> = {
  owner: "/api/v1/auth/reset-password",
  staff: "/api/v1/gym-employees/auth/reset-password",
  instructor: "/api/v1/instructors/auth/reset-password",
  member: "/api/v1/members/auth/reset-password",
};

export const loginUser = async (
  role: UserRole,
  credentials: LoginData
) => {
  const response = await api.post(
    loginEndpoints[role],
    credentials
  );

  return response.data;
};

export const ForgetPassword = async (
  role: UserRole,
  credentials: ForgotPasswordData
) => {
  const response = await api.post(
    forgetPasswordEndpoints[role],
    credentials
  );

  return response.data 
};

export const verifyPasswordResetOtp = async (
  role: UserRole,
  otp: string
) => {
  const credentials = role === "owner" ? { otpCode: otp } : { otp };
  const response = await api.post(
    validateOtpEndpoints[role],
    credentials
  );
  return response.data;
};

export const resetPassword = async (
  role: UserRole,
  credentials: ResetPasswordData,
) => {
  const response = await api.post(
    resetPasswordEndpoints[role],
    credentials
  );

  return response.data;
};