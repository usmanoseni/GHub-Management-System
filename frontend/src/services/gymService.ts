import api from "./api";

export interface GymCenterForm {
  gymName: string;
  gymLogo: File | null;
  gymAddress: string;
  state: string;
  localGovernmentArea: string;
  country: string;
  businessPhone: string;
  businessEmail: string;
  businessRegistrationType: string;
  cacRegistrationNumber: string;
  registrationDocument: File | null;
  description: string;
  socialMediaUrl: {
    facebook: string;
    instagram: string;
    tiktok: string;
    x: string;
  };
}

interface CreateGymCenterResponse {
  success: boolean;
  message: string;
  emailSent: boolean;
}

export const createGymCenter = async (
  gymCenter: GymCenterForm,
): Promise<CreateGymCenterResponse> => {
  const formData = new FormData();

  formData.append("gymName", gymCenter.gymName);
  formData.append("gymAddress", gymCenter.gymAddress);
  formData.append("state", gymCenter.state);
  formData.append("localGovernmentArea", gymCenter.localGovernmentArea);
  formData.append("country", gymCenter.country);
  formData.append("businessPhone", gymCenter.businessPhone);
  formData.append("businessEmail", gymCenter.businessEmail);
  formData.append(
    "businessRegistrationType",
    gymCenter.businessRegistrationType,
  );
  formData.append("cacRegistrationNumber", gymCenter.cacRegistrationNumber);
  formData.append("description", gymCenter.description);

  Object.entries(gymCenter.socialMediaUrl).forEach(([key, value]) => {
    if (value) {
      formData.append(`socialMediaUrl[${key}]`, value);
    }
  });

  if (gymCenter.gymLogo) {
    formData.append("gymLogo", gymCenter.gymLogo);
  }

  if (
    gymCenter.businessRegistrationType === "registered" &&
    gymCenter.registrationDocument
  ) {
    formData.append("registrationDocument", gymCenter.registrationDocument);
  }

  const response = await api.post<CreateGymCenterResponse>(
    "/api/v1/gym-centers/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
