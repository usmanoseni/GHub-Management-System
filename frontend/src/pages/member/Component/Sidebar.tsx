import { useState } from "react"
import { Logo } from "../../../assets/asset"
import { Link } from "react-router-dom"
import { X } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapsed: () => void
  onClose: () => void
}


const Sidebar = ({ isOpen, isCollapsed, onToggleCollapsed, onClose }: SidebarProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = !isCollapsed || isHovered

  return (
      <aside
        id="member-sidebar"
        onMouseEnter={(event) => {
          if (
            !(event.target instanceof Element) ||
            !event.target.closest("[data-sidebar-toggle]")
          ) {
            setIsHovered(true)
          } else {
            setIsHovered(false)
          }
        }}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed z-10 overflow-hidden min-h-screen border-r-1 bg-white border-gray-300 w-[50%] sm:w-[35%] md:w-[10%] ${
          isExpanded ? 'md:w-[30%] lg:w-[18%]' : 'lg:w-[10%] xl:w-[5%]'
        } left-0 top-0 md:top-0 transition-[width,transform] duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/** Component in the sidebar */}
      <div className="w-full min-h-screen flex flex-col py-2 px-2">
        <div className={`flex items-center gap-2 mb-2 ${isExpanded ? 'justify-start lg:pl-2' : 'justify-center'}`}>
             <button
               type="button"
               onClick={onToggleCollapsed}
               onMouseEnter={() => setIsHovered(false)}
               aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
               aria-expanded={isExpanded}
               aria-controls="member-sidebar"
               data-sidebar-toggle
               className="hidden md:flex shrink-0 items-center justify-center rounded-full p-2 text-gray-950 transition-colors hover:bg-green-50"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
        {/* logo decorattion */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          className={`hidden ${isExpanded ? 'md:flex' : ''} items-center gap-1 shrink-0`}
        >
            <img src={Logo.ghub2} className="size-9" alt="" />
            <div className={`${isExpanded ? 'hidden md:flex' : 'hidden'} flex-col justify-center items-start`}>
              <div className="font-montserrat text-2xl font-bold text-[#082b3c] ">
                <span className="bg-gradient-to-r from-emerald-600 to-blue-900 bg-clip-text text-transparent">G</span>
                <span>Hub</span>
              </div>
              <div className=" text-[10px]   font-medium text-gray-800">Gym Management Platform</div>
            </div>
        </div>
        
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="mb-3 flex justify-end text-gray-700 cursor-pointer md:hidden"
        >
          <X size={20} aria-hidden="true" />
        </button>
        
     
        {/**List of oparational functionality of the member Ghub */}
        <div className="flex-1 flex flex-col  justify-between items-stretch w-full py-2 mt-4 text-sm text-gray-800  px-1.5">
          
          <div className="flex flex-col gap-1.5">
            <div
            onMouseEnter={() => setIsHovered(true)}
            className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <Link title={!isExpanded ? "Dashboard" : undefined} to={`/v1/member/dashboard`} className={`flex items-center gap-2 py-2.5 px-1.5 w-full rounded-lg bg-green-50 transition-colors ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              <span className="text-gray-950 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
              </span>
              <span className={isExpanded ? '' : 'hidden'}>Dashboard</span>
            </Link>
          </div>

          <div
            onMouseEnter={() => setIsHovered(true)}
            className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <Link title={!isExpanded ? "Dashboard" : undefined} to={`/v1/member/dashboard`} className={`flex items-center gap-2 py-2.5 px-1.5 w-full rounded-lg hover:bg-green-50 transition-colors ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              <span className="text-gray-950 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
              </svg>

              </span>
              <span className={isExpanded ? '' : 'hidden'}>My Membership</span>
            </Link>
            </div>
            
            <div
            onMouseEnter={() => setIsHovered(true)}
            className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <Link title={!isExpanded ? "Dashboard" : undefined} to={`/v1/member/dashboard`} className={`flex items-center gap-2 py-2.5 px-1.5 w-full rounded-lg hover:bg-green-50 transition-colors ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              <span className="text-gray-950 ">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                </svg>
              </span>
              <span className={isExpanded ? '' : 'hidden'}>Book Classes</span>
            </Link>
            </div>
            
            <div
            onMouseEnter={() => setIsHovered(true)}
            className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <Link title={!isExpanded ? "Dashboard" : undefined} to={`/v1/member/dashboard`} className={`flex items-center gap-2 py-2.5 px-1.5 w-full rounded-lg hover:bg-green-50 transition-colors ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              <span className="text-gray-950 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>

              </span>
              <span className={isExpanded ? '' : 'hidden'}>Nutrient Tips</span>
            </Link>
            </div>
            
            <div
            onMouseEnter={() => setIsHovered(true)}
            className={`flex w-full items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <Link title={!isExpanded ? "Dashboard" : undefined} to={`/v1/member/dashboard`} className={`flex justify-between items-center gap-2 py-2.5 px-1.5 w-full rounded-lg hover:bg-green-50 transition-colors ${isExpanded ? 'justify-start' : 'justify-center'}`}>
                <div className="flex justify-center items-center gap-2">
                  <span className="text-gray-950 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
                </svg>
              </span>
              <span className={isExpanded ? '' : 'hidden'}>Notification</span>
                </div>
                <div className={isExpanded ? ' bg-red-500 relative -right-18 justify-center items-center size-5 text-center text-white rounded-full text-sm ' : 'hidden' }>3</div>
            </Link>
            </div>
            
            <div
            onMouseEnter={() => setIsHovered(true)}
            className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <Link title={!isExpanded ? "Dashboard" : undefined} to={`/v1/member/dashboard`} className={`flex items-center gap-2 py-2.5 px-1.5 w-full rounded-lg hover:bg-green-50 transition-colors ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              <span className="text-gray-950 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
              </svg>
              </span>
              <span className={isExpanded ? '' : 'hidden'}>My Payment </span>
            </Link>
          </div>
          </div>

          {/**profile section */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            className={`flex flex-col w-full rounded-lg ${isExpanded ? 'items-stretch' : 'items-center'}`}
          >
                  <Link title={!isExpanded ? "Profile" : undefined} to={`/v1/member/profile`}  className={`flex text-sm items-center gap-2 hover:bg-green-50 p-1 rounded-full cursor-pointer transition-all duration-300 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
                      <div className='bg-green-50 size-9 font-medium text-green-600 rounded-full flex justify-center items-center'>
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </div>
                    <span className={`font-normal text-sm ${isExpanded ? '' : 'hidden'}`}>Profile</span>
                  </Link>
                  <button aria-label={!isExpanded ? "Logout" : undefined} className={`mt-2 flex justify-center items-center gap-1 text-xs font-medium cursor-pointer rounded-lg bg-red-50 text-red-600 py-2.5 px-4 hover:text-red-700 transition-all ease-in-out duration-300 ${isExpanded ? 'w-full' : 'w-10 self-center'}`}>
                      <span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>
                      </span>
                      <span className={isExpanded ? '' : 'hidden'}>Logout</span>
                      
                </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
