import { useState } from "react"
import { Logo } from "../../../assets/asset"
import {Link } from "react-router-dom"

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapsed: () => void
}


const Sidebar = ({ isOpen, isCollapsed, onToggleCollapsed }: SidebarProps) => {
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
        } left-0 top-15 md:top-0 transition-[width,transform] duration-300 md:translate-x-0 ${
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
     
        {/**List of oparational functionality of the member Ghub */}
        <div className="flex-1 flex flex-col  justify-between items-stretch w-full py-2 text-sm text-gray-800  px-1.5">
          <div
            onMouseEnter={() => setIsHovered(true)}
            className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <Link title={!isExpanded ? "Dashboard" : undefined} to={`v1/member/dashboard`} className={`flex items-center gap-2 py-2.5 px-1.5 w-full rounded-lg bg-green-50 transition-colors ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              <span className="text-gray-950 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
              </span>
              <span className={isExpanded ? '' : 'hidden'}>Dashboard</span>
            </Link>
          </div>

          {/**profile section */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            className={`flex flex-col w-full rounded-lg ${isExpanded ? 'items-stretch' : 'items-center'}`}
          >
                  <Link title={!isExpanded ? "Profile" : undefined} to={`v1/member/profile`}  className={`flex text-sm items-center gap-2 hover:bg-green-50 p-1 rounded-full cursor-pointer transition-all duration-300 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
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
