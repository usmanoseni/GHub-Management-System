import api from "./api"

export interface MemberProfile {
  _id: string
  gym_id: string
  branchcode: string
  firstName: string
  middlename?: string
  lastname: string
  email: string
  phone_no?: string
  address?: string
  state?: string
  country?: string
  profile?: string
  accountStatus: string
  createdAt: string
}

export interface MemberGymSummary {
  gymName: string
}

export interface MemberBranchSummary {
  branchName: string
  address: {
    city: string
    state: string
    country: string
  }
}

export interface MemberProfileResponse {
  member: MemberProfile
  gym: MemberGymSummary | null
  branch: MemberBranchSummary | null
}

export interface MemberProfileUpdate {
  firstName: string
  lastname: string
  middlename:string
  email: string
  phone_no: string
  address: string
  state: string
  country: string
}

export const getMemberProfile = async () => {
  const response = await api.get<MemberProfileResponse>("/api/v1/members/me")
  return response.data
}

export const updateMemberProfile = async (updates: MemberProfileUpdate) => {
  const response = await api.patch<{ message: string; member: MemberProfile }>(
    "/api/v1/members/me",
    updates,
  )
  return response.data
}

export const uploadMemberProfileImage = async (image: File) => {
  const formData = new FormData()
  formData.append("image", image)
  const response = await api.post<{ message: string; profile: string }>(
    "/api/v1/members/me/profile-image",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  )
  return response.data
}

export const getMemberProfileImage = async () => {
  const response = await api.get<Blob>("/api/v1/members/me/profile-image", {
    responseType: "blob",
  })
  return response.data
}

export const logoutMember = async () => {
  const response = await api.post<{ success: boolean; message: string }>(
    "/api/v1/members/auth/logout",
  )
  return response.data
}
