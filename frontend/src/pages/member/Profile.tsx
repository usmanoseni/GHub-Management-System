import { useEffect, useState } from 'react'
import NavBar from "./Component/Navbar"
import Sidebar from './Component/Sidebar'
import QRScanner from "./Component/QRScanner"
import { anime } from "../../assets/asset"
import { icons } from "../../assets/asset"
import { gymImg } from '../../assets/asset'
import SubscriptionStatus from './Component/Suscription'
import { X , Activity, CalendarCheck, Clock, ChevronRight, Bubbles } from 'lucide-react'

const Profile = () => {
    const [showQRScanner, setShowQRScanner] = useState(false);
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

        {/**SEARCH BAR */}
        <div className="md:hidden w-full flex items-center border border-gray-400 rounded-md py-2 my-3">
          <span className="px-1 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchbarDropDown(true)}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="search activities, classes..."
            aria-label="Search activities and classes"
            className="min-w-0 grow outline-none text-gray-800 text-sm px-1 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="mr-2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

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
              <h1>profile page</h1>
      </section>
    </main >
  )
}

export default Profile
