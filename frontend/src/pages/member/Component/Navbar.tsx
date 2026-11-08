import {Logo} from "../../../assets/asset"

interface NavbarProps {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

const Navbar = ({ sidebarOpen, sidebarCollapsed, onToggleSidebar }: NavbarProps) => {
  return (
    <nav className={`fixed top-0 z-10 h-15 w-full overflow-hidden  shadow-sm shadow-gray-200 md:w-[90%] ${
      sidebarCollapsed ? 'lg:w-[90%] xl:w-[95%]' : 'lg:w-[82%]'
    } right-0 px-6 py-2 md:px-2 md:pr-8 lg:pr-10 bg-white shadow-b-sm`}>
      <div className='flex justify-between items-center'>
        
        <div className='flex justify-center items-center gap-2'>
           
           <div className="md:hidden flex  justify-start items-center gap-1">
              <img src={Logo.ghub2} className="size-9" alt="" />
              <div className="flex flex-col justify-center items-start ">
                <div className="font-montserrat text-2xl font-bold text-[#082b3c] ">
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-900 bg-clip-text text-transparent">G</span>
                  <span>Hub</span>
                </div>
                <div className="text-xs font-medium text-gray-800">Gym Management Platform</div>
              </div>
            </div>
            {/**the Gym Logo */}
            <div className='hidden md:flex justify-center items-center'>
                <img src={Logo.ghub2} alt="" className='size-9' />
            </div>
       </div>

            <div className='flex justify-start items-center gap-4'>
                <div className='text-gray-700 cursor-pointer'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                    </svg>
                  </div>
                  {/**dropdown Icon */}
                  <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                    aria-expanded={sidebarOpen}
                    aria-controls="member-sidebar"
                    className='text-gray-700 cursor-pointer md:hidden p-2 hover:bg-green-50 transition-all ease-in-out duration-300 '
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                        </svg>
                  </button>
                <div className='hidden md:flex justify-center items-center gap-1.5'>
                <div className='bg-green-50 size-10 font-medium text-green-600 rounded-full flex justify-center items-center'>J</div>
                <div className='text-xs flex flex-col justify-center items-start gap-0.5'>
                    <span className='text-gray-500 text-[10px]'>Member</span>
                    <span className='font-medium'>John Doe</span>
                </div>
                  </div>
                  <div className='hidden md:flex justify-center items-center gap-1 text-xs font-medium cursor-pointer rounded-md bg-red-50 text-red-600 py-2 px-4 hover:text-red-700 transition-all ease-in-out duration-300  '>
                      <span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>
                      </span>
                      Logout
                      
                </div>
              </div>

          
         </div> 
    </nav>
  )
}

export default Navbar
