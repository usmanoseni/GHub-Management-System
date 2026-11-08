import { useEffect, useState } from 'react'
import NavBar from "./Component/Navbar"
import Sidebar from './Component/Sidebar'
import { anime } from "../../assets/asset"


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [slideImg,setSlideImg] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches
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
          />
          <Sidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
      {/** Dashboard content */}
      <section>
        <div className='bg-gradient-to-r from-rose-950 from-20% to-blue-950 to-65% text-white p-5 px-10 rounded-2xl grid md:grid-cols-2 justify-between '>
          <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut quasi odit repellat. Voluptatem sit debitis iure fuga! Temporibus labore porro, pariatur fugiat veniam mollitia ratione, quasi odio, sint praesentium rerum.</div>
          <div className='hidden md:flex justify-evenly'>
            <img src={anime[slideImg]} alt="" className='w-3/6 h-fulljustify-items-end '/>
          </div>
        </div>
      </section>

    </main>
  )
}

export default Dashboard
