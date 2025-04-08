import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import Modal from "../pages/Manajer/Catatan/Modal";
import api from "../utils/api";

const Navbar = ({ menuItems, userOptions, children, label, showAddNoteButton = false}) => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isManajer = userData?.role === 'manajer';
  const isKasirToko = userData?.role === 'kasirtoko';
  const isAdminGudang = userData?.role === 'admingudang';
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance';
  const isKaryawanProduksi = userData?.role === 'karyawanproduksi'
  const isAdminOrKasirToko = ['admin', 'kasirtoko'].includes(userData?.role);
  
  // Menentukan role yang hanya mendapatkan menu logout
  const isLogoutOnly = ['admingudang', 'headgudang', 'manajer', 'finance', 'admin', 'owner'].includes(userData?.role);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [logoSrc, setLogoSrc] = useState('');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/50');
  const navigate = useNavigate();
  
  const themeColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
      ? "hitam"
      : "primary";
    
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const notifButtonRef = useRef(null);
  const [notifModalPosition, setNotifModalPosition] = useState({ top: 0, left: 0 });
  
  const getCurrentMonthYear = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return { month, year };
  };

  const fetchManagerMessages = async () => {
    try {
      const { month, year } = getCurrentMonthYear();
      const response = await api.get(`/catatan?bulan=${month}&tahun=${year}`);
      
      if (response.data.success) {
        const formattedMessages = response.data.data.map(item => {
          let truncatedText = item.isi;
          if (item.isi.length > 30) {
            const lastSpaceIndex = item.isi.substring(0, 30).lastIndexOf(' ');
            if (lastSpaceIndex > 0) {
              truncatedText = item.isi.substring(0, lastSpaceIndex) + '...';
            } else {
              truncatedText = item.isi.substring(0, 30) + '...';
            }
          }
            
          return {
            id: item.catatan_id,
            name: 'Pesan dari manajer',
            pesan_teks: truncatedText,
            tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
            judul: item.judul
          };
        });
        
        setManagerMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching manager messages:', error);
    }
  };
  
  const [notifications, setNotifications] = useState([]);
  const [managerMessages, setManagerMessages] = useState([]);
  const [combinedStockNotifications, setCombinedStockNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      if (isOwner) {
        const { month, year } = getCurrentMonthYear();
        const response = await api.get(`/catatan?bulan=${month}&tahun=${year}`);
        
        if (response.data.success) {
          const formattedMessages = response.data.data.map(item => {
            let truncatedText = item.isi;
            if (item.isi.length > 30) {
              const lastSpaceIndex = item.isi.substring(0, 30).lastIndexOf(' ');
              if (lastSpaceIndex > 0) {
                truncatedText = item.isi.substring(0, lastSpaceIndex) + '...';
              } else {
                truncatedText = item.isi.substring(0, 30) + '...';
              }
            }
              
            return {
              id: item.catatan_id,
              name: 'Pesan dari manajer',
              pesan_teks: truncatedText,
              tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
              judul: item.judul
            };
          });
          
          setManagerMessages(formattedMessages);
        }
      }
      else if (isManajer) {
        try {
          const tokoResponse = await api.get('/notification-stok');
          const tokoNotifications = tokoResponse.data.success && tokoResponse.data.data 
            ? tokoResponse.data.data.map(item => ({
                type: 'stok',
                name: 'Stok Toko Menipis',
                isi: item.message
              }))
            : [];
          const gudangResponse = await api.get('/notification-stok-gudang');
          const gudangNotifications = gudangResponse.data.success && gudangResponse.data.data 
            ? gudangResponse.data.data.map(item => ({
                type: 'stok',
                name: 'Stok Menipis',
                isi: item.message
              }))
            : [];

          const combined = [...tokoNotifications, ...gudangNotifications];
          setCombinedStockNotifications(combined);
        } catch (error) {
          console.error('Error fetching stock notifications for manager:', error);
          setCombinedStockNotifications([]);
        }
      }
      else if (isAdminGudang || isHeadGudang || isAdmin || isKasirToko) {
        let endpoint;
        
        if (isAdminGudang || isHeadGudang) {
          endpoint = '/notification-stok-gudang';
        } else if (isAdmin) {
          const tokoId = userData?.userId;
          endpoint = `/notification-stok?toko_id=${tokoId}`;
        } else if (isKasirToko) {
          const cabangId = userData?.userId;
          endpoint = `/notification-stok?cabang=${cabangId}`;
        }
        
        if (endpoint) {
          const response = await api.get(endpoint);
          
          if (response.data.success && response.data.data) {
            const stockNotifications = response.data.data.map(item => {
              const message = item.message;
            
              return {
                type: 'stok',
                name: 'Stok Menipis',
                isi: message
              };
            });
            
            setNotifications(stockNotifications);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

    useEffect(() => {
      fetchNotifications();
    }, [isOwner, isAdminGudang, isHeadGudang, isAdmin, isKasirToko, userData?.userId, userData?.tokoId]);


const getNotificationIcon = () => {
  if (isAdminGudang || isHeadGudang) {
    return "/Icon Warna/dataBarang_gudang.svg";
  }
  else if (isOwner) {
    return "/Icon Warna/email_non.svg";
  }
  else if (isManajer) {
    return "/Icon Warna/dataBarang_non.svg";
  } else if(isAdmin && (userData?.userId !== 1 && userData?.userId !== 2)){
    return "/Icon Warna/dataBarang_toko2.svg";
  } else {
    return "/Icon Warna/dataBarang.svg";
  }
};

  const toggleNotifModal = () => {
    setNotifModalPosition({
      top: 60, 
      right: 0 
    });
    setIsNotifModalOpen(!isNotifModalOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNotifModalOpen && 
          notifButtonRef.current && 
          !notifButtonRef.current.contains(event.target) &&
          !event.target.closest('.notification-modal')) {
        setIsNotifModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifModalOpen]);

  useEffect(() => {
    const fetchLogoBasedOnRole = async () => {
      if (['headgudang', 'admingudang', 'karyawanproduksi'].includes(userData?.role)) {
        setLogoSrc('/logoDansa.svg');
        return;
      }
      
      if (['owner', 'manajer', 'finance'].includes(userData?.role)) {
        setLogoSrc('/logoDBI.svg');
        return;
      }
      
      if (['admin', 'kasirtoko', 'karyawanumum', 'karyawantransportasi'].includes(userData?.role)) {
        try {
          const tokoId = userData?.role === 'admin' 
            ? userData?.userId 
            : userData?.tokoId;
            
          if (!tokoId) {
            console.error('No toko ID available');
            setLogoSrc('/logo.png');
            return;
          }
          
          const response = await api.get(`/toko/${tokoId}`);
          
          if (response.data.success) {
            const { image } = response.data.data;
            if (image) {
              setLogoSrc(`${import.meta.env.VITE_API_URL || ''}/images-toko/${image}`);
            } else {
              setLogoSrc('/logo.png');
            }
          } else {
            console.error('Failed to fetch toko data');
            setLogoSrc('/logo.png'); 
          }
        } catch (error) {
          console.error('Error fetching toko data:', error);
          setLogoSrc('/logo.png')
        }
      } else {

        setLogoSrc('/logo.png');
      }
    };
    
    fetchLogoBasedOnRole();
  }, [userData?.role, userData?.userId, userData?.tokoId]);

  useEffect(() => {
    if (!userData?.image) {
      setProfileImage('https://via.placeholder.com/50');
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    

    if (['admin', 'admingudang', 'headgudang', 'kasirtoko'].includes(userData?.role)) {
      setProfileImage(`${apiBaseUrl}/images-toko/${userData.image}`);
    } else if (['owner', 'manajer', 'finance'].includes(userData?.role)) {
      setProfileImage(`${apiBaseUrl}/images-authentication/${userData.image}`);
    } else if (['karyawanumum', 'karyawanproduksi', 'karyawantransportasi'].includes(userData?.role)) {
      setProfileImage(`${apiBaseUrl}/images-karyawan/${userData.image}`);
    } else {
      setProfileImage('https://via.placeholder.com/50');
    }
  }, [userData?.role, userData?.image]);

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

  // Filter menu options berdasarkan role
  const filteredUserOptions = isLogoutOnly 
    ? userOptions.filter(option => option.label === 'Logout') 
    : userOptions;

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

 const NotificationModal = () => {
  return (
    <div 
      className="notification-modal fixed bg-white shadow-lg z-50 w-[320px] right-0 top-16 border-l rounded-bl-lg"
      style={{ 
        maxHeight: '400px',
        overflow: 'auto',
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none' 
      }}
    >
      <style jsx global>{`
        .notification-modal::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div className="p-4">
        <h3 className={`font-bold text-lg text-${themeColor} mb-6`}>Notifikasi</h3>
        
        {isOwner ? (
          <div className="divide-y divide-gray-200">
            {managerMessages.map((notif, index) => (
              <div key={index} className="py-4 first:pt-0">
                <div className="flex items-center gap-3">
                  <img src="/Icon Warna/email_non.svg" alt="Message" className="w-6 h-6" />
                  <div>
                    <p className="font-semibold text-sm">{notif.name}</p>
                    <p className="text-sm text-gray-600">{notif.pesan_teks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isManajer ? (
          // Tampilan khusus untuk manager
          <div className="divide-y divide-gray-200">
            {combinedStockNotifications.map((notif, index) => (
              <div key={index} className="py-4 first:pt-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-biruTua bg-opacity-10 w-6 h-6 rounded-full flex items-center justify-center">
                      <img 
                        src="/Icon Warna/dataBarang_non.svg" 
                        alt="Stock Alert" 
                        className="w-4 h-4" 
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{notif.name}</p>
                    <p className="text-sm text-gray-600">{notif.isi}</p>
                  </div>
                </div>
              </div>
            ))}
            {combinedStockNotifications.length === 0 && (
              <div className="py-4 text-center text-gray-500">
                Tidak ada notifikasi
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notif, index) => (
              <div key={index} className="py-4 first:pt-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`bg-${themeColor} bg-opacity-10 w-6 h-6 rounded-full flex items-center justify-center`}>
                      <img 
                        src={(isAdminGudang || isHeadGudang) 
                          ? "/Icon Warna/dataBarang_gudang.svg" 
                          : (isAdmin && (userData?.userId !== 1 || userData?.userId !== 2))
                            ? "/Icon Warna/dataBarang_toko2.svg" 
                            : "/Icon Warna/dataBarang.svg"} 
                        alt="Stock Alert" 
                        className="w-4 h-4" 
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{notif.name}</p>
                    <p className="text-sm text-gray-600">{notif.isi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
                e.target.src = null; 
              }}
            />
         </a>
       </div>

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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10.56 14L12.8 11.76V13.6H13.6V10.4H10.4V11.2H12.24L10 13.44L10.56 14ZM12 16C10.8933 16 9.95013 15.6099 9.1704 14.8296C8.39067 14.0493 8.00053 13.1061 8 12C7.99947 10.8939 8.3896 9.95067 9.1704 9.1704C9.9512 8.39013 10.8944 8 12 8C13.1056 8 14.0491 8.39013 14.8304 9.1704C15.6117 9.95067 16.0016 10.8939 16 12C15.9984 13.1061 15.6083 14.0496 14.8296 14.8304C14.0509 15.6112 13.1077 16.0011 12 16ZM3.2 4.8H11.2V3.2H3.2V4.8ZM6.94 14.4H1.6C1.16 14.4 0.783467 14.2435 0.4704 13.9304C0.157333 13.6173 0.000533333 13.2405 0 12.8V1.6C0 1.16 0.1568 0.783467 0.4704 0.4704C0.784 0.157333 1.16053 0.000533333 1.6 0H12.8C13.24 0 13.6168 0.1568 13.9304 0.4704C14.244 0.784 14.4005 1.16053 14.4 1.6V6.96C14.0133 6.77333 13.6232 6.63333 13.2296 6.54C12.836 6.44667 12.4261 6.4 12 6.4C11.8533 6.4 11.7165 6.4032 11.5896 6.4096C11.4627 6.416 11.3328 6.4328 11.2 6.46V6.4H3.2V8H8.1C7.86 8.22667 7.64347 8.47333 7.4504 8.74C7.25733 9.00667 7.0872 9.29333 6.94 9.6H3.2V11.2H6.46C6.43333 11.3333 6.4168 11.4635 6.4104 11.5904C6.404 11.7173 6.40053 11.8539 6.4 12C6.4 12.44 6.44 12.8501 6.52 13.2304C6.6 13.6107 6.74 14.0005 6.94 14.4Z" fill="#023F80"/>
                </svg>
              }
              bgColor="border border-secondary"
              textColor="text-biruTua"
              hoverColor="hover:bg-gray-100"
              onClick={toggleModal}
            />
          )}
          
          {(isOwner || isAdmin || isKasirToko || isHeadGudang || isAdminGudang || isManajer) && (
            <div className="relative">
              <button
                ref={notifButtonRef}
                onClick={toggleNotifModal}
                className="flex items-center justify-center w-10 h-10 border border-secondary rounded-md hover:bg-gray-100 focus:outline-none"
              >
                <img 
                  src={getNotificationIcon()} 
                  alt="Notifications" 
                  className="w-5 h-5"
                />
                {((isOwner && managerMessages.length > 0) || 
                  ((isAdmin || isKasirToko || isHeadGudang || isAdminGudang) && notifications.length > 0) ||
                  (isManajer && combinedStockNotifications.length > 0)) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {isNotifModalOpen && <NotificationModal />}
            </div>
          )}
          
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 focus:outline-none"
            >
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                }}
              />
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
                  {filteredUserOptions.map((option) => (
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
     
     {/* Kirim Catatan Modal */}
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
   </div>
 );
};

export default Navbar;