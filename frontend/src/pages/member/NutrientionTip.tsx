import { useEffect, useState } from 'react'
import NavBar from "./Component/Navbar"
import Sidebar from './Component/Sidebar'
import QRScanner from "./Component/QRScanner"
import {fruitSalad  } from "../../assets/asset"
import { icons } from "../../assets/asset"
import { gymImg } from '../../assets/asset'
import QuickNutritionTips from "./Component/QuickNutritionTips";
import FitnessTips from './Component/FitnessTips'
import NutritionTips from './Component/NutritionTips'

import { X , Activity, CalendarCheck, Clock, ChevronRight, Bubbles, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import {
  getMemberProfile,
  getMemberProfileImage,
  type MemberProfileResponse,
} from '../../services/memberService'


const NutrientionTip = () => {
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
  
      useEffect(() => {
      const interval = setInterval(() => {
        setSlideImg((prev) => (prev + 1) % fruitSalad.length);
      }, 5000);
  
      return () => clearInterval(interval);
    }, []);
  
    useEffect(() => {
      const mediumScreen = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
      const updateSidebar = () => setSidebarCollapsed(mediumScreen.matches)
  
      mediumScreen.addEventListener('change', updateSidebar)
      return () => mediumScreen.removeEventListener('change', updateSidebar)
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
        {searchbarDropDown &&(
          <div className='fixed inset-0 z-30 bg-gray-800/20 md:hidden'>
          <div className=' bg-white shadow p-2 h-[50vh] w-full '>
          <div className='flex justify-center items-center w-full gap-2 border-b-2 border-gray-400 py-2'>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="search activities, classes..."
              aria-label="Search activities and classes"
              autoFocus
              className='min-w-0 grow px-2 outline-none placeholder:text-gray-400 text-gray-800 text-sm'
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSearchbarDropDown(false)
              }}
              aria-label="Clear search and close search panel"
              className="rounded cursor-pointer p-1 text-gray-700 hover:bg-gray-100"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
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
        {/** welcome board card  */}
        <div className='bg-gradient-to-r from-rose-950 from-20% to-blue-950 to-65% text-white p-5 px-10 rounded-2xl grid md:grid-cols-2 justify-between '>
          <div className='flex flex-col space-y-1.5'>
              <span className='font-montserrat font-semibold text-amber-500'>Nutrient tips</span>
            <div className='text-3xl font-bold font-montserrat'>Fuel Your body for better <br /> performance</div>
            <p className="w-[70%]">get expert nutrituion tips to support your workouts, build your muscle and live a healtly life.</p>
            
            <div className='mt-3'>
              <button className='flex justify-center items-center gap-1 py-2 px-4  bg-white text-rose-950 rounded-xl cursor-pointer hover:transform hover:scale-105 hover:duration-400 hover:ease-in-out'>
                Explore Nutrition Guide
                <span className=''>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path fill-rule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
              </span>
            </button>
            </div>
          </div>
          <div className='hidden md:flex justify-evenly'>
            <img
              key={slideImg}
              src={fruitSalad[slideImg]}
              alt=""
              className="anime-slide-in w-5/6 h-[13rem] object-contain"
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 w-full mt-5 '>
          <div className='col-span-2  space-y-3'>
            <NutritionTips/>
           {/* <div className=' rounded-xl shadow  p-3'>
              <div className='py-2 px-3 text-xl font-montserrat font-semibold flex justify-start gap-2 text-[#082b3c] '>
                <span className='text-green-500 '>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                </span>
                Latest Nurtition Tips 
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              <div className='flex flex-col justify-center items-center'>
                <div className='w-full h-28 rounded-2xl overflow-hidden bg-amber-100'><img src={gymImg[4]} className='' alt="" /></div>
                <div className='p-2 space-y-1'>
                  <div className='font-montserrat font-semibold text-[#082b3c] '>The Power of Protein</div>
                <div className='text-sm line-clamp-2 text-gray-800'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum, doloribus?</div>
                <div className='flex justify-between items-center  w-full'>
                  <div className='flex justify-start items-center'>
                    <div className='flex justify-start items-center gap-0.5 text-[11px] px-1 text-gray-800 line-clamp-1'>
                      <span><Calendar size={12} /></span>
                      <span className='line-clamp-1'>Nov 15, 2025</span>
                    </div>
                   <div className='flex justify-start items-center gap-0.5 text-[11px] text-gray-800 border-l-1 px-1 line-clamp-1 border-gray-400'>
                      <span><Clock size={12} /></span>
                      <span className='line-clamp-1'>5 min read</span>
                    </div>
                  </div>
                  <div>
                    <button className='border-2 px-3 py-1 flex gap-0.5 justify-center items-center border-green-500 text-green-500 cursor-pointer text-xs rounded-md hover:bg-green-500 transition-colors duration-200 ease-in-out hover:text-white  '>
                      Read More
                      <span >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                        <path fill-rule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        </svg>
                        </span>
                    </button>
                    </div>
                </div>
                </div>
              </div>
               <div className='flex flex-col justify-center items-center'>
                <div className='w-full h-28 rounded-2xl overflow-hidden bg-amber-100'><img src={gymImg[4]} className='' alt="" /></div>
                <div className='p-2 space-y-1'>
                  <div className='font-montserrat font-semibold text-[#082b3c]'>The Power of Protein</div>
                <div className='text-sm line-clamp-2 text-gray-800'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum, doloribus?</div>
                <div className='flex justify-between items-center  w-full'>
                  <div className='flex justify-start items-center'>
                    <div className='flex justify-start items-center gap-0.5 text-[11px] px-1 text-gray-800 line-clamp-1'>
                      <span><Calendar size={12} /></span>
                      <span className='line-clamp-1'>Nov 15, 2025</span>
                    </div>
                   <div className='flex justify-start items-center gap-0.5 text-[11px] text-gray-800 border-l-1 px-1 line-clamp-1 border-gray-400'>
                      <span><Clock size={12} /></span>
                      <span className='line-clamp-1'>5 min read</span>
                    </div>
                  </div>
                  <div>
                    <button className='border-2 px-3 py-1 flex gap-0.5 justify-center items-center border-green-500 text-green-500 cursor-pointer text-xs rounded-md hover:bg-green-500 transition-colors duration-200 ease-in-out hover:text-white  '>
                      Read More
                      <span >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                        <path fill-rule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        </svg>
                        </span>
                    </button>
                    </div>
                </div>
                </div>
                </div>
            </div>
            </div> */}
            <FitnessTips/>
           
          </div>
          <QuickNutritionTips/>
        </div>
         
     </section>
    </main>
  )
}

export default NutrientionTip
