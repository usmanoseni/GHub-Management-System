import { useEffect, useState } from 'react'
import NavBar from "./Component/Navbar"
import Sidebar from './Component/Sidebar'
import QRScanner from "./Component/QRScanner"
import { anime } from "../../assets/asset"
import { icons } from "../../assets/asset"
import { gymImg } from '../../assets/asset'
import SubscriptionStatus from './Component/Suscription'
import { X , Activity, CalendarCheck, Clock, ChevronRight, Bubbles } from 'lucide-react'



const Dashboard = () => {
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
          
      {/** Dashboard content */}
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
        {/** welcome board card  */}
        <div className='bg-gradient-to-r from-rose-950 from-20% to-blue-950 to-65% text-white p-5 px-10 rounded-2xl grid md:grid-cols-2 justify-between '>
          <div className='flex flex-col space-y-1.5'>
            <div className='flex justify-start items-center gap-2'>
              <span className='font-montserrat font-semibold text-xl'>Welcome Back</span>
              <img src={icons.hurray} alt="" className='size-7 ' />
            </div>
            <div className='text-2xl font-bold font-montserrat'>John Doe</div>
            <p className="w-[70%]">Keep pushing your Limit. A healther stronger you is just a workout away</p>
            
            <div className='mt-3'>
              <button className='flex justify-center py-2 px-4  bg-white text-rose-950 rounded-xl cursor-pointer hover:transform hover:scale-105 hover:duration-400 hover:ease-in-out'>
              <span className=''>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
              </svg>
              </span>
              Book a class
            </button>
            </div>
          </div>
          <div className='hidden md:flex justify-evenly'>
            <img
              key={slideImg}
              src={anime[slideImg]}
              alt=""
              className="anime-slide-in w-5/6 h-[13rem] object-contain"
            />
          </div>
        </div>

        <SubscriptionStatus />

        {/**shedule program */}
        <div className='mt-5 space-y-3'>
          <div className='flex justify-between px-2'>
          <div className='font-bold tex-xl '>Incoming Class Activities</div>
            <button className='flex justify-center items-center gap-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer'>
              view all
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              </span>
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='bg-green-50/20 p-2 shadow rounded-xl flex gap-2 justify-start items-center'>
              <div className='h-28 w-40 overflow-hidden rounded-lg'><img src={gymImg[0]} alt="" className='' /></div>
              <div className='flex flex-1 flex-col w-full space-y-1'>
                <div className='flex justify-between items-center'>
                  <div className='flex flex-col justify-start items-start'>
                    <span className='text-sm font-montserrat font-semibold'>Yoga Session</span>
                    <div className='flex justify-start items-center text-xs gap-0.5 text-gray-400'>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </span>
                      <span>6:00pm - 7:30pm</span>
                    </div>
                  </div>
                  <span className='bg-green-100 text-green-500 py-1 px-3 text-xs'>today</span>
                </div>
                <div className='text-xs text-gray-700 line-clamp-2 leading-4'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Neque dolor debitisfugiat, dignissimos recusandae minus doloremque voluptatibus.</div>
                <div className='flex justify-end mt-0.5'>
                  <button className='bg-amber-600 text-white py-1 rounded-md px-3 text-sm hover:bg-amber-500 cursor-pointer duration-200 easy-in-out '>book now</button>
                </div>
              </div>
            </div>
            <div className='bg-green-50/20 p-2 shadow rounded-xl flex gap-2 justify-start items-center'>
              <div className='h-28 w-40 overflow-hidden rounded-lg'><img src={gymImg[4]} alt="" className='' /></div>
              <div className='flex flex-1 flex-col w-full space-y-1'>
                <div className='flex justify-between items-center'>
                  <div className='flex flex-col justify-start items-start'>
                    <span className='text-sm font-montserrat font-semibold'>Strength Training</span>
                    <div className='flex justify-start items-center text-xs gap-0.5 text-gray-400'>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </span>
                      <span>6:00pm - 7:30pm</span>
                    </div>
                  </div>
                  <span className='bg-green-100 text-green-500 py-1 px-3 text-xs'>today</span>
                </div>
                <div className='text-xs text-gray-700 line-clamp-2 leading-4'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Neque dolor debitisfugiat, dignissimos recusandae minus doloremque voluptatibus.</div>
                <div className='flex justify-end mt-0.5'>
                  <button className='bg-amber-600 text-white py-1 rounded-md px-3 text-sm hover:bg-amber-500 cursor-pointer duration-200 easy-in-out '>book now</button>
                </div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 mt-7 gap-3'>
            <div className="bg-white p-4 w-full shadow-sm rounded-xl border border-gray-100 flex flex-col gap-4">

              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-[#10b981]" />
                  <h2 className="font-semibold text-[#082b3c]">
                    Recent Activities
                  </h2>
                </div>

                <button className="text-xs text-[#10b981] hover:underline">
                  View all
                </button>
              </div>

              {/* Activities */}
              <div className="flex flex-col divide-y divide-gray-100">

                {/* Activity 1 */}
                <div className="flex items-center gap-3 py-3">

                  <div className="bg-emerald-50 p-2.5 rounded-full">
                    <CalendarCheck size={19} className="text-emerald-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      Booked: Togo session
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock size={12} />
                      Today, 09:00 PM
                    </div>
                  </div>

                  <ChevronRight size={17} className="text-gray-400" />

                </div>

                {/* Activity 2 */}
                <div className="flex items-center gap-3 py-3">

                  <div className="bg-blue-50 p-2.5 rounded-full">
                    <CalendarCheck size={19} className="text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      Completed workout session
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock size={12} />
                      Yesterday, 06:30 PM
                    </div>
                  </div>

                  <ChevronRight size={17} className="text-gray-400" />

                </div>

                {/* Activity 3 */}
                <div className="flex items-center gap-3 py-3">

                  <div className="bg-purple-50 p-2.5 rounded-full">
                    <CalendarCheck size={19} className="text-purple-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      Membership payment successful
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock size={12} />
                      Nov 10, 02:15 PM
                    </div>
                  </div>

                  <ChevronRight size={17} className="text-gray-400" />

                </div>

                {/* Activity 4 */}
                <div className="flex items-center gap-3 py-3">

                  <div className="bg-orange-50 p-2.5 rounded-full">
                    <CalendarCheck size={19} className="text-orange-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      Updated personal information
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock size={12} />
                      Nov 09, 11:20 AM
                    </div>
                  </div>

                  <ChevronRight size={17} className="text-gray-400" />

                </div>

              </div>
            </div>

            <div className='bg-white p-4 w-full shadow-sm rounded-xl border border-gray-100 flex flex-col gap-4'>
               {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bubbles size={20} className="text-[#10b981]" />
                  <h2 className="font-semibold text-[#082b3c]">
                    Fitness Tips
                  </h2>
                </div>

                <button className="text-xs text-[#10b981] hover:underline">
                  View all
                </button>
              </div>

              <div className='h-full flex flex-col justify-start items-center ]'>
                <div className=' p-2 flex gap-2 justify-start items-center'>
                  <div className='h-22 w-40 overflow-hidden rounded-lg'><img src={gymImg[0]} alt="" className='' /></div>
                  <div className='flex flex-1 flex-col w-full space-y-1'>
                      <span className='text-sm font-montserrat font-semibold'>Stay Consistent!</span>
                    <div className='text-xs text-gray-700 line-clamp-2 leading-4'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Neque dolor debitisfugiat, dignissimos recusandae minus doloremque voluptatibus.</div>
                    <div className='bg-green-500 h-[3px] mt-1 w-16 rounded-2xl'></div>
                  </div>
                </div>
                <div className=' p-2 flex gap-2 justify-start items-center'>
                  <div className='h-22 w-40 overflow-hidden rounded-lg'><img src={gymImg[5]} alt="" className='' /></div>
                  <div className='flex flex-1 flex-col w-full space-y-1'>
                      <span className='text-sm font-montserrat font-semibold'>Stay Consistent!</span>
                    <div className='text-xs text-gray-700 line-clamp-2 leading-4'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Neque dolor debitisfugiat, dignissimos recusandae minus doloremque voluptatibus.</div>
                    <div className='bg-amber-500 h-[3px] mt-1 w-16 rounded-2xl'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}

export default Dashboard
