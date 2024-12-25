import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation

const Navbar = ({ menuItems, userOptions, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [submenuOpen, setSubmenuOpen] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const location = useLocation(); // Get the current URL

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
      setSidebarOpen(desktop); // Keep sidebar open on desktop
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
            <img src="logo.png" alt="" />
          </a>
        </div>

        {/* Menu Items */}
        <ul className="mt-4 text-black">
          {menuItems.map((menu) => (
            <li key={menu.label} className="group">
              <div
                className={`flex items-center justify-between px-4 py-2 hover:bg-[#7B0C42] cursor-pointer ${
                  location.pathname === menu.link || menu.submenu?.some(sub => location.pathname === sub.link) 
                    ? "text-[#7B0C42] font-bold border-l-4 border-[#7B0C42]"
                    : ""
                }`}
              >
                <Link to={menu.link} className="flex items-center">
                  <span className="mr-2">{menu.icon}</span> {menu.label}
                </Link>
                {menu.submenu && (
                  <button
                    onClick={() => toggleSubmenu(menu.label)}
                    className="text-sm text-white focus:outline-none"
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
                      className={`px-4 py-2 hover:bg-gray-700 ${
                        location.pathname === sub.link
                          ? "text-[#7B0C42] font-bold border-l-4 border-[#7B0C42]"
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
        <div className="bg-white text-black h-16 flex items-center px-4 justify-between z-10">
          <button className="text-white mr-4" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center focus:outline-none"
            >
              <span>SuperAdmin</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${
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
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
                <ul>
                  {userOptions.map((option) => (
                    <li
                      key={option.label}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                      <Link to={option.link}>{option.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
