import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import NavBar from "./Component/Navbar"
import Sidebar from './Component/Sidebar'
import QRScanner from "./Component/QRScanner"
import { anime } from "../../assets/asset"
import { X, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import {
  getMemberProfile,
  getMemberProfileImage,
  type MemberProfileResponse,
} from '../../services/memberService' 

const Notification = () => {
   const [showQRScanner, setShowQRScanner] = useState(false);
    const [memberProfile, setMemberProfile] = useState<MemberProfileResponse | null>(null)
      const [memberImage, setMemberImage] = useState<string | null>(null)
      const [isMemberLoading, setIsMemberLoading] = useState(true)
      const [searchbarDropDown, setSearchbarDropDown] = useState(false)
      const [searchQuery, setSearchQuery] = useState("")
      const [sidebarOpen, setSidebarOpen] = useState(false)
      const [slideImg,setSlideImg] = useState(0)
      const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
        window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches
    )
    const activities = ["Yoga Session", "Strength Training"]
      const filteredActivities = activities.filter((activity) =>
        activity.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
      const memberName = memberProfile
        ? `${memberProfile.member.firstName} ${memberProfile.member.lastname}`.trim()
        : isMemberLoading
          ? 'Loading...'
          : 'Member'
    
      useEffect(() => {
        let isActive = true
        let imageUrl: string | null = null
    
        const loadMemberProfile = async () => {
          try {
            const response = await getMemberProfile()
            if (!isActive) return
            setMemberProfile(response)
    
            if (response.member.profile) {
              try {
                const image = await getMemberProfileImage()
                const nextImageUrl = URL.createObjectURL(image)
                if (!isActive) {
                  URL.revokeObjectURL(nextImageUrl)
                  return
                }
                imageUrl = nextImageUrl
                setMemberImage(nextImageUrl)
              } catch {
                if (isActive) toast.error('Could not load your profile image.')
              }
            }
          } catch {
            if (isActive) toast.error('Could not load your member profile.')
          } finally {
            if (isActive) setIsMemberLoading(false)
          }
        }
    
        void loadMemberProfile()
        return () => {
          isActive = false
          if (imageUrl) URL.revokeObjectURL(imageUrl)
        }
      }, [])
  return (
       <main className={`bg-green-50/30 min-h-screen relative w-full md:w-[90%] top-15 p-2 left-0 md:left-[10%] ${
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
              memberImage={memberImage}
              gymName={memberProfile?.gym?.gymName || memberProfile?.member.gym_id || 'Gym membership'}
              branchName={memberProfile?.branch?.branchName || memberProfile?.member.branchcode || 'Branch'}
              branchLocation={
                memberProfile?.branch
                  ? [memberProfile.branch.address.city, memberProfile.branch.address.state]
                      .filter(Boolean)
                      .join(', ')
                  : ''
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
        <div className='flex justify-between items-center w-full my-3'>
            <div className='flex flex-col justify-start w-'>
              <h1 className='font-montserrat font-bold text-xl'>Notifications</h1>
              <span className='text-sm text-gray-700 ]'>Stay updated with the latest news, events and updated</span>
            </div>
            <button
              type="button"
              
              className='text-sm flex justify-center items-center gap-1 border bg-green-50 text-green-600 hover:text-green-700 duration-300 transition-all ease-in-out border-green-500 py-1 px-3 rounded-md cursor-pointer'
            >
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" />
                </svg>
              </span>
              Mark All as Read
            </button>
        </div>
        
        <div>
          
        </div>
      </section>
  
    </main>
  )
}

export default Notification
