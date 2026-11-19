import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import NavBar from "./Component/Navbar"
import Sidebar from './Component/Sidebar'
import QRScanner from "./Component/QRScanner"
import { anime } from "../../assets/asset"
import { X, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../services/api'
import {
  getMemberProfile,
  getMemberProfileImage,
  updateMemberProfile,
  uploadMemberProfileImage,
  type MemberBranchSummary,
  type MemberGymSummary,
  type MemberProfile,
  type MemberProfileUpdate,
} from '../../services/memberService'

interface MemberInfoField {
  label: string
  value: string
}

const formatDate = (date: string) => {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? "Not provided"
    : parsedDate.toLocaleDateString()
}

const getMemberInfo = (member: MemberProfile): MemberInfoField[] => [
  { label: "Gym ID", value: member.gym_id },
  { label: "Branch ID", value: member.branchcode },
  { label: "First Name", value: member.firstName },
  ...(member.middlename?.trim()
    ? [{ label: "Middle Name", value: member.middlename.trim() }]
    : []),
  { label: "Last Name", value: member.lastname },
  { label: "Email Address", value: member.email },
  { label: "Phone Number", value: member.phone_no || "" },
  { label: "Address", value: member.address || "" },
  { label: "State", value: member.state || "" },
  { label: "Country", value: member.country || "" },
  { label: "Date Joined", value: formatDate(member.createdAt) },
]

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}

const Profile = () => {
    const [showQRScanner, setShowQRScanner] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [member, setMember] = useState<MemberProfile | null>(null)
  const [gym, setGym] = useState<MemberGymSummary | null>(null)
  const [branch, setBranch] = useState<MemberBranchSummary | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [profileActionError, setProfileActionError] = useState('')
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [draftMemberInfo, setDraftMemberInfo] = useState<MemberInfoField[]>([])
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [profileImageError, setProfileImageError] = useState<string | null>(null)
  const [isProfileImageUploading, setIsProfileImageUploading] = useState(false)
    const profileImageInputRef = useRef<HTMLInputElement>(null)
  const [passwordModalStep, setPasswordModalStep] = useState<'validate' | 'change' | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [searchbarDropDown, setSearchbarDropDown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [slideImg, setSlideImg] = useState(0)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches
  )
  const activities = ["Yoga Session", "Strength Training"]
  const filteredActivities = activities.filter((activity) =>
    activity.toLowerCase().includes(searchQuery.trim().toLowerCase())
  )
  const memberInfo = member ? getMemberInfo(member) : []
  const memberName = member
    ? [member.firstName, member.middlename?.trim(), member.lastname].filter(Boolean).join(" ")
    : "Member"

  useEffect(() => {
    let isActive = true

    const loadMemberProfile = async () => {
      try {
        const response = await getMemberProfile()
        if (!isActive) return

        setMember(response.member)
        setGym(response.gym)
        setBranch(response.branch)

        if (response.member.profile) {
          try {
            const image = await getMemberProfileImage()
            if (isActive) setProfileImage(URL.createObjectURL(image))
          } catch (error) {
            if (isActive) {
              setProfileImageError(
                getRequestErrorMessage(error, 'Could not load your profile image.')
              )
            }
          }
        }
      } catch (error) {
        if (isActive) {
          setProfileError(getRequestErrorMessage(error, 'Could not load your profile.'))
        }
      } finally {
        if (isActive) setIsProfileLoading(false)
      }
    }

    void loadMemberProfile()
    return () => {
      isActive = false
    }
  }, [])

    useEffect(() => {
    const interval = setInterval(() => {
      setSlideImg((prev) => (prev + 1) % anime.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mediumScreen = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
    const updateSidebar = () => setSidebarCollapsed(mediumScreen.matches)

    mediumScreen.addEventListener('change', updateSidebar)
    return () => mediumScreen.removeEventListener('change', updateSidebar)
  }, [])

  useEffect(() => {
    if (!profileImage) return
    return () => URL.revokeObjectURL(profileImage)
  }, [profileImage])

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setProfileImageError('Choose a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileImageError('The profile image must be 5 MB or smaller.')
      return
    }

    setProfileImageError(null)
    setIsProfileImageUploading(true)
    try {
      const response = await uploadMemberProfileImage(file)
      setMember((currentMember) =>
        currentMember ? { ...currentMember, profile: response.profile } : currentMember
      )
      setProfileImage(URL.createObjectURL(file))
      toast.success(response.message || 'Profile image updated successfully.')
    } catch (error) {
      const message = getRequestErrorMessage(error, 'Could not update your profile image.')
      setProfileImageError(message)
      toast.error(message)
    } finally {
      setIsProfileImageUploading(false)
    }
  }

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileActionError('')

    const getDraftValue = (label: string) =>
      draftMemberInfo.find((field) => field.label === label)?.value.trim() || ''
    const updates: MemberProfileUpdate = {
      firstName: getDraftValue("First Name"),
      lastname: getDraftValue("Last Name"),
      middlename: getDraftValue("Middle Name"),
      email: getDraftValue("Email Address"),
      phone_no: getDraftValue("Phone Number"),
      address: getDraftValue("Address"),
      state: getDraftValue("State"),
      country: getDraftValue("Country"),
    }

    setIsProfileSaving(true)
    try {
      const response = await updateMemberProfile(updates)
      setMember(response.member)
      setIsEditModalOpen(false)
      toast.success(response.message || 'Profile updated successfully.')
    } catch (error) {
      const message = getRequestErrorMessage(error, 'Could not update your profile.')
      setProfileActionError(message)
      toast.error(message)
    } finally {
      setIsProfileSaving(false)
    }
  }

  const closePasswordModal = () => {
    setPasswordModalStep(null)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setPasswordError('')
  }

  const handleCurrentPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError('')
    setIsPasswordSubmitting(true)
    try {
      await api.post('/api/v1/members/me/validate-password', { password: currentPassword })
      setCurrentPassword('')
      setShowCurrentPassword(false)
      setPasswordModalStep('change')
    } catch (error) {
      setPasswordError(getRequestErrorMessage(error, 'Could not validate your password. Please try again.'))
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  const handleNewPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('Your new password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new password and confirmation do not match.')
      return
    }

    setIsPasswordSubmitting(true)
    try {
      const response = await api.patch('/api/v1/members/me/password', {
        newPassword,
        confirmPassword,
      })
      toast.success(response.data.message || 'Password changed successfully.')
      closePasswordModal()
    } catch (error) {
      setPasswordError(getRequestErrorMessage(error, 'Could not change your password. Please try again.'))
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  return (
      <main  className={`bg-green-50/30 min-h-screen relative w-full md:w-[90%] top-15 p-2 left-0 md:left-[10%] ${
        sidebarCollapsed
          ? 'lg:w-[90%] lg:left-[10%] xl:w-[95%] xl:left-[5%]'
          : 'lg:w-[82%] lg:left-[18%]'
          }`}>

          <NavBar
            sidebarOpen={sidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onQRScan={() => setShowQRScanner(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        memberName={memberName}
        memberImage={profileImage}
        gymName={gym?.gymName || member?.gym_id || "Gym membership"}
        branchName={branch?.branchName || member?.branchcode || "Branch"}
        branchLocation={
          branch
            ? [branch.address.city, branch.address.state].filter(Boolean).join(", ")
            : ""
        }
          />
          <Sidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
            onClose={() => setSidebarOpen(false)}
          />
          {showQRScanner && (
            <QRScanner onClose={() => setShowQRScanner(false)} />
          )}

          <section>
              {searchQuery.trim() && (
          <div className='hidden md:block absolute top-0 z-30 left-0 pl-[15%] xl:pl-[20%] w-full h-full bg-gray-800/20'>
            <div className='bg-white shadow p-2 h-[50vh] lg:w-4/5'>
              <div className='mt-2'>
                {filteredActivities.length ? filteredActivities.map((activity) => (
                  <button
                    key={activity}
                    type="button"
                    className='py-2 px-2 font-medium flex justify-between w-full items-center cursor-pointer text-gray-800 hover:text-gray-600'
                  >
                    <span>{activity}</span>
                    <span className='bg-green-100 text-green-500 py-1 px-3 text-xs rounded-md'>today</span>
                  </button>
                )) : (
                  <p className="px-2 py-3 text-sm text-gray-500">No matching activities or classes.</p>
                )}
              </div>
            </div>
          </div>
        )}


        {/**PROFILE CONTENT */}

        <div className='flex  flex-col justify-start items-start gap-4 w-full'>
          {profileError && (
            <p role="alert" className="w-full rounded-md bg-red-50 p-3 text-sm text-red-700">
              {profileError}
            </p>
          )}
          <div className='flex justify-between items-center w-full my-3'>
            <div className='flex flex-col justify-start w-'>
              <h1 className='font-montserrat font-bold text-xl'>My Profile</h1>
              <span className='text-sm text-gray-700 ]'>View and manage your personal.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setProfileActionError('')
                setDraftMemberInfo(memberInfo)
                setIsEditModalOpen(true)
              }}
              disabled={!member || isProfileLoading}
              className='text-sm flex justify-center items-center gap-1 border bg-green-50 text-green-600 hover:text-green-700 duration-300 transition-all ease-in-out border-green-500 py-1 px-3 rounded-md cursor-pointer'
            >
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
              </span>

              Edit profile
            </button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 w-full '>
            <div className=' rounded-xl shadow py-12 flex flex-col max-h-[24rem] justify-center items-center '>
              <div className='bg-green-50 size-42 relative flex justify-center items-center rounded-full ring-2 ring-offset-8 ring-green-500 border-green-500 text-green-500'>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="absolute inset-0 size-full rounded-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                )}

                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  aria-label="Select profile image"
                />
                <button
                  type="button"
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={!member || isProfileImageUploading}
                  className='absolute bottom-3 -right-4 bg-gray-50 z-10 text-gray-700 text-sm flex gap-0.5 border border-gray-500 py-0.5 px-2 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
                >
                  <span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                  </span>
                  {isProfileImageUploading ? 'Saving...' : 'Edit'}
                </button>
              </div>
              {profileImageError && (
                <p role="alert" className="mt-4 text-sm text-red-600">{profileImageError}</p>
              )}

              <div className='mt-5'>
                <div className='flex flex-col justify-center items-center gap-2 text-gray-700'>
                  <span className='font-bold text-xl font-montserrat'>
                    {member ? memberName : isProfileLoading ? 'Loading...' : 'Member'}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {member?.email || ''}
                  </span>
                </div>
              </div>

              <div className='bg-green-700 text-xs py-1 px-6 text-white rounded-md mt-2'>
                {member?.accountStatus === 'active'
                  ? 'Active Member'
                  : member
                    ? 'Suspended Member'
                    : isProfileLoading
                      ? 'Loading...'
                      : 'Member'}
              </div>
            </div>
            <div className=' rounded-xl shadow col-span-2  p-3'>
              <div className='py-2 px-3 text-xl font-montserrat font-semibold flex justify-start gap-2 border-b-2 border-gray-200'>
                <span className='text-green-500 '>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
                      <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clip-rule="evenodd" />
                    </svg>
                </span>
                Personal Info
              </div>

                {/* Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 p-4 border-b-2 border-gray-200">
                  {isProfileLoading ? (
                    <p className="text-sm text-gray-500">Loading member profile...</p>
                  ) : memberInfo.length ? memberInfo.map((item) => (
                    <div key={item.label} className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500 font-medium">
                        {item.label}
                      </span>

                      <span className="text-gray-800 font-semibold text-sm break-words">
                        {item.value || "Not provided"}
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500">Member profile information is unavailable.</p>
                  )}
              </div>

              <div className='mt-4 mb-2 flex justify-end'>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordError('')
                    setPasswordModalStep('validate')
                  }}
                  className='bg-gradient-to-l from-green-500 rounded-md to-green-700 hover:transform hover:scale-105 duration-300 ease-in-out cursor-pointer text-sm text-white py-1.5 px-5'
                >
                  Change password
                </button>
              </div>
            </div>
         </div>
        </div>

      </section>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="edit-profile-title" className="text-xl font-semibold text-gray-800">Edit profile</h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isProfileSaving}
                aria-label="Close edit profile"
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleProfileUpdate}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {draftMemberInfo.map((item) => {
                  const isReadOnly = item.label === "Gym ID" || item.label === "Branch ID" || item.label === "Date Joined"
                  const inputId = `profile-${item.label.toLowerCase().replaceAll(" ", "-")}`

                  return (
                    <div key={item.label} className="flex flex-col gap-1">
                      <label htmlFor={inputId} className="text-sm font-medium text-gray-600">
                        {item.label}{isReadOnly && " (not editable)"}
                      </label>
                      <input
                        id={inputId}
                        type={item.label === "Email Address" ? "email" : "text"}
                        value={item.value}
                        disabled={isReadOnly}
                          required={["First Name", "Last Name", "Email Address"].includes(item.label)}
                        onChange={(event) => {
                          const value = event.target.value
                          setDraftMemberInfo((currentInfo) =>
                            currentInfo.map((field) =>
                              field.label === item.label ? { ...field, value } : field
                            )
                          )
                        }}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  )
                })}
              </div>
              {profileActionError && (
                <p role="alert" className="mt-4 text-sm text-red-600">{profileActionError}</p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isProfileSaving}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProfileSaving}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProfileSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {passwordModalStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="change-password-title" className="text-xl font-montserrat font-semibold text-gray-800">
                {passwordModalStep === 'validate' ? 'Verify your password' : 'Set a new password'}
              </h2>
              <button
                type="button"
                onClick={closePasswordModal}
                disabled={isPasswordSubmitting}
                aria-label="Close change password"
                className="rounded-md p-1 cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            {passwordModalStep === 'validate' ? (
              <form onSubmit={handleCurrentPasswordSubmit}>
                <p className="mb-4 text-sm text-gray-600">Enter your current password to continue.</p>
                <label htmlFor="current-password" className="mb-1 block text-sm font-medium text-gray-700">
                  Current password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    disabled={isPasswordSubmitting}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-11 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((visible) => !visible)}
                    aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                    aria-pressed={showCurrentPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && <p role="alert" className="mt-3 text-sm text-red-600">{passwordError}</p>}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    disabled={isPasswordSubmitting}
                    className="rounded-md border cursor-pointer border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPasswordSubmitting}
                    className="rounded-md bg-green-600 cursor-pointer px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPasswordSubmitting ? 'Validating...' : 'Continue'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleNewPasswordSubmit}>
                <p className="mb-4 text-sm text-gray-600">Choose a new password with at least 8 characters.</p>
                <div className="mb-4">
                  <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      disabled={isPasswordSubmitting}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pr-11 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((visible) => !visible)}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      aria-pressed={showNewPassword}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-new-password" className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={isPasswordSubmitting}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pr-11 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                      aria-pressed={showConfirmPassword}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {passwordError && <p role="alert" className="mt-3 text-sm text-red-600">{passwordError}</p>}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordError('')
                      setPasswordModalStep('validate')
                    }}
                    disabled={isPasswordSubmitting}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isPasswordSubmitting}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPasswordSubmitting ? 'Updating...' : 'Change password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main >
  )
}

export default Profile
