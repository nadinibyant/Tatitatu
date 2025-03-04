import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import Modal from "../pages/Manajer/Catatan/Modal";
import api from "../utils/api";

const Navbar = ({ menuItems, userOptions, children, label, showAddNoteButton = false}) => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isManajer = userData?.role === 'manajer';
  const isKasirToko = userData?.role === 'kasirtoko';
  const isAdminGudang = userData?.role === 'admingudang'
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance'
  const isAdminOrKasirToko = ['admin', 'kasirtoko'].includes(userData?.role);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [logoSrc, setLogoSrc] = useState('');
  const navigate = useNavigate();

      const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";

  // Function to determine the appropriate logo based on user role
  useEffect(() => {
    const fetchLogoBasedOnRole = async () => {
      // For roles that directly use a specific logo file
      if (['headgudang', 'admingudang', 'karyawanproduksi'].includes(userData?.role)) {
        setLogoSrc('/logoDansa.svg');
        return;
      }
      
      if (['owner', 'manajer', 'finance'].includes(userData?.role)) {
        setLogoSrc('/logoDBI.svg');
        return;
      }
      
      // For roles that need to fetch toko data
      if (['admin', 'kasirtoko', 'karyawanumum', 'karyawantransportasi'].includes(userData?.role)) {
        try {
          const tokoId = userData?.role === 'admin' 
            ? userData?.userId 
            : userData?.tokoId;
            
          if (!tokoId) {
            console.error('No toko ID available');
            setLogoSrc('/logo.png'); // Fallback logo
            return;
          }
          
          const response = await api.get(`/toko/${tokoId}`);
          
          if (response.data.success) {
            const { image } = response.data.data;
            if (image) {
              setLogoSrc(`${import.meta.env.VITE_API_URL || ''}/images-toko/${image}`);
            } else {
              // Fallback if toko has no logo
              setLogoSrc('/logo.png');
            }
          } else {
            console.error('Failed to fetch toko data');
            setLogoSrc('/logo.png'); // Fallback logo
          }
        } catch (error) {
          console.error('Error fetching toko data:', error);
          setLogoSrc('/logo.png'); // Fallback logo
        }
      } else {
        // Default fallback
        setLogoSrc('/logo.png');
      }
    };
    
    fetchLogoBasedOnRole();
  }, [userData?.role, userData?.userId, userData?.tokoId]);

  useEffect(() => {
    const fetchBranchName = async () => {
      if (isKasirToko && userData?.userId) {
        try {
          const response = await api.get(`/cabang/${userData.userId}`);
          if (response.data.success) {
            setBranchName(response.data.data.nama_cabang);
          }
        } catch (error) {
          console.error('Error fetching branch name:', error);
        }
      }
    };

    fetchBranchName();
  }, [isKasirToko, userData?.userId]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const modifiedUserOptions = userOptions.map(option => 
    option.label === 'Logout' 
      ? { ...option, onClick: handleLogout } 
      : option
  );

  async function handleLogout() {
    try {
      const response = await api.get('/logout');
      
      if (response.data.success) {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');

        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

 const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
 const [submenuOpen, setSubmenuOpen] = useState({});
 const [dropdownOpen, setDropdownOpen] = useState(false);
 const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

 const location = useLocation();

 const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
 const closeSidebar = () => setSidebarOpen(false);
 const toggleSubmenu = (menu) => {
   setSubmenuOpen((prevState) => ({
     ...prevState,
     [menu]: !prevState[menu],
   }));
 };
 const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

 useEffect(() => {
   const handleResize = () => {
     const desktop = window.innerWidth >= 1024;
     setIsDesktop(desktop);
     setSidebarOpen(desktop);
   };

   window.addEventListener("resize", handleResize);
   return () => window.removeEventListener("resize", handleResize);
 }, []);

 return (
   <div className="flex h-screen">
     {/* Sidebar */}
     <div
       className={`fixed top-0 left-0 h-full bg-white text-white transition-all duration-300 ease-in-out w-64 z-20 ${
         sidebarOpen ? "translate-x-0" : "-translate-x-full"
       }`}
     >
       {/* Logo */}
       <div className="flex items-center justify-center h-20">
         <a href="">
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="h-16 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/logo.png"; // Fallback if logo fails to load
              }}
            />
         </a>
       </div>

       {/* Rest of the component remains unchanged */}
       {/* Menu Items */}
       <ul className="mt-4 text-black overflow-y-auto h-[calc(100%-80px)] pr-2 pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
         {menuItems.map((menu) => (
           <li key={menu.label} className="group">
             <div
               className={`flex text-sm items-center justify-between px-4 py-2 hover:bg-${themeColor} hover:text-white cursor-pointer ${
                 location.pathname === menu.link || menu.submenu?.some(sub => location.pathname === sub.link) 
                   ? `text-${themeColor} font-bold border-l-4 border-${themeColor}`
                   : ""
               }`}
             >
               <Link to={menu.link} className="flex items-center">
                 <img 
                   src={
                    location.pathname === menu.link || 
                    menu.submenu?.some(sub => location.pathname === sub.link)
                      ? menu.iconWarna 
                      : menu.icon    
                    } 
                   alt={`${menu.label} icon`}
                   className="w-5 h-8 mr-4"
                   onError={(e) => {
                     e.target.onerror = null;
                     e.target.src = "/Menu/default-icon.svg";
                   }}
                 />
                 {menu.label}
               </Link>

               {menu.submenu && (
                 <button
                   onClick={() => toggleSubmenu(menu.label)}
                   className="text-sm text-dark focus:outline-none"
                 >
                   <svg
                     className={`w-4 h-4 transition-transform ${
                       submenuOpen[menu.label] ? "rotate-180" : "rotate-0"
                     }`}
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth="2"
                       d="M19 9l-7 7-7-7"
                     />
                   </svg>
                 </button>
               )}
             </div>
             {menu.submenu && submenuOpen[menu.label] && (
               <ul className="pl-8">
                 {menu.submenu.map((sub) => (
                   <li
                     key={sub.label}
                     className={`px-4 py-2 hover:bg-${themeColor} hover:text-white ${
                       location.pathname === sub.link
                         ? `text-${themeColor} font-bold border-l-4 border-${themeColor}`
                         : ""
                     }`}
                   >
                     <Link to={sub.link}>{sub.label}</Link>
                   </li>
                 ))}
               </ul>
             )}
           </li>
         ))}
       </ul>
     </div>

     {/* Main Content */}
     <div
       className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
         isDesktop && sidebarOpen ? "ml-64" : "ml-0"
       }`}
     >
       {/* Top Navbar */}
       <div className="bg-white text-black h-16 flex items-center px-4 justify-between z-10 flex-shrink-0">
         <div className="flex">
           <button className="text-black mr-4" onClick={toggleSidebar}>
             ☰
           </button>
           {isKasirToko && branchName && (
            <div className="flex items-center mr-4">
              <img 
                src="/Icon Warna/toko.svg" 
                alt="Toko Icon" 
                className="w-6 h-6 mr-2"
              />
              <p className="text-sm font-medium">{branchName}</p>
            </div>
          )}
          
          <div className="flex flex-col">
            <p className="text-primary font-bold">{label}</p>
          </div>
         </div>

         <div className="flex items-center gap-4">
         {isManajer && (
              <Button
                type="button"
                label="Kirim Catatan"
                icon={
                  <svg width="20" height="20" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.06 14L13.3 11.76V13.6H14.1V10.4H10.9V11.2H12.74L10.5 13.44L11.06 14ZM12.5 16C11.3933 16 10.4501 15.6099 9.6704 14.8296C8.89067 14.0493 8.50053 13.1061 8.5 12C8.49947 10.8939 8.8896 9.95067 9.6704 9.1704C10.4512 8.39013 11.3944 8 12.5 8C13.6056 8 14.5491 8.39013 15.3304 9.1704C16.1117 9.95067 16.5016 10.8939 16.5 12C16.4984 13.1061 16.1083 14.0496 15.3296 14.8304C14.5509 15.6112 13.6077 16.0011 12.5 16ZM3.7 4.8H11.7V3.2H3.7V4.8ZM7.44 14.4H2.1C1.66 14.4 1.28347 14.2435 0.9704 13.9304C0.657333 13.6173 0.500533 13.2405 0.5 12.8V1.6C0.5 1.16 0.6568 0.783467 0.9704 0.4704C1.284 0.157333 1.66053 0.000533333 2.1 0H13.3C13.74 0 14.1168 0.1568 14.4304 0.4704C14.744 0.784 14.9005 1.16053 14.9 1.6V6.96C14.5133 6.77333 14.1232 6.63333 13.7296 6.54C13.336 6.44667 12.9261 6.4 12.5 6.4C12.3533 6.4 12.2165 6.4032 12.0896 6.4096C11.9627 6.416 11.8328 6.4328 11.7 6.46V6.4H3.7V8H8.6C8.36 8.22667 8.14347 8.47333 7.9504 8.74C7.75733 9.00667 7.5872 9.29333 7.44 9.6H3.7V11.2H6.96C6.93333 11.3333 6.9168 11.4635 6.9104 11.5904C6.904 11.7173 6.90053 11.8539 6.9 12C6.9 12.44 6.94 12.8501 7.02 13.2304C7.1 13.6107 7.24 14.0005 7.44 14.4Z" fill="#7B0C42"/>
                  </svg>
                }
                bgColor="border border-secondary"
                textColor="text-primary"
                hoverColor="hover:bg-gray-100"
                onClick={toggleModal}
              />
            )}
            {!isManajer && (
              <Button
                bgColor="bg-none border-secondary border"
                hoverColor="hover:bg-gray-100"
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.4141 3.29268C11.4141 2.41941 11.761 1.5819 12.3785 0.964405C12.996 0.346907 13.8335 0 14.7067 0C15.58 0 16.4175 0.346907 17.035 0.964405C17.6525 1.5819 17.9994 2.41941 17.9994 3.29268C17.9994 4.16596 17.6525 5.00346 17.035 5.62096C16.4175 6.23846 15.58 6.58537 14.7067 6.58537C13.8335 6.58537 12.996 6.23846 12.3785 5.62096C11.761 5.00346 11.4141 4.16596 11.4141 3.29268Z"
                      fill="#FF0000"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.7798 0.878052C10.2361 1.76118 10.0062 2.80182 10.127 3.83181C10.2478 4.86179 10.7125 5.82094 11.4458 6.55425C12.1791 7.28755 13.1382 7.75217 14.1682 7.87301C15.1982 7.99385 16.2388 7.76386 17.122 7.2202V12.0732C17.122 13.6451 16.4975 15.1526 15.386 16.2641C14.2745 17.3756 12.767 18 11.1951 18H5.92683C4.35494 18 2.84742 17.3756 1.73593 16.2641C0.624432 15.1526 0 13.6451 0 12.0732V6.80488C0 5.23299 0.624432 3.72548 1.73593 2.61398C2.84742 1.50248 4.35494 0.878052 5.92683 0.878052H10.7798Z"
                      fill="#7B0C42"
                    />
                  </svg>
                }
              />
            )}
             <Modal
              isOpen={isModalOpen}
              onClose={toggleModal}
              title="Kirim Catatan"
              content={
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                      Nama
                    </label>
                    <input
                      className="border rounded py-2 px-3 w-full"
                      type="text"
                      id="name"
                      placeholder="Masukan Nama"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="date">
                      Tanggal dan Waktu
                    </label>
                    <input
                      className="border rounded py-2 px-3 w-full"
                      type="text"
                      id="date"
                      placeholder="Masukan Nama Barang"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                      Jenis
                    </label>
                    <input
                      className="border rounded py-2 px-3 w-full"
                      type="text"
                      id="category"
                      placeholder="Penjualan Meningkat"
                    />
                  </div>
                </div>
              }
            />
             <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img src="https://via.placeholder.com/50" alt="Profile" className="w-8 h-8 rounded-full" />
                <svg
                  className={`w-4 h-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  <ul>
                    {userOptions.map((option) => (
                      <li
                        key={option.label}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setDropdownOpen(false);
                          
                          if (option.label === 'Logout') {
                            handleLogout();
                          } 
                          else if (option.link) {
                            navigate(option.link);
                          }
                        }}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            </div>
       </div>

       {/* Backdrop */}
       {!isDesktop && sidebarOpen && (
         <div
           className="fixed inset-0 bg-black opacity-50 z-10"
           onClick={closeSidebar}
         ></div>
       )}

       {/* Content */}
       <div
         className={`flex-1 bg-gray-100 p-4 ${
           !isDesktop && sidebarOpen ? "opacity-50 pointer-events-none" : ""
         }`}
       >
         {children}
       </div>
     </div>
   </div>
 );
};

export default Navbar;