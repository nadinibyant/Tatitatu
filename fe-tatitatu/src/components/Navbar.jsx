import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import Button from "./Button";

const Navbar = ({ menuItems, userOptions, children, label, showAddNoteButton = false}) => {
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

  // const handleAddNoteClick = () => {
  //   if (isAddNoteEnabled) {
  //     alert("Note added successfully!");
  //     // Add your note logic here
  //   } else {
  //     const confirmEnable = window.confirm("Do you want to enable 'Add Note'?");
  //     if (confirmEnable) {
  //       setIsAddNoteEnabled(true);
  //     }
  //   }
  // };

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
            <img src="/logo.png" alt="" />
          </a>
        </div>

        {/* Menu Items */}
        <ul className="mt-4 text-black overflow-y-auto h-[calc(100%-80px)] pr-2 pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {menuItems.map((menu) => (
            <li key={menu.label} className="group">
              <div
                className={`flex text-sm items-center justify-between px-4 py-2 hover:bg-[#7B0C42] hover:text-white cursor-pointer ${
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
                      className={`px-4 py-2 hover:bg-[#7B0C42] hover:text-white ${
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
        <div className="bg-white text-black h-16 flex items-center px-4 justify-between z-10 flex-shrink-0">
          <div className="flex">
            <button className="text-black mr-4" onClick={toggleSidebar}>
              ☰
            </button>
            <p className="text-primary font-bold">{label}</p>
          </div>

          <div className="relative flex items-center">
            <div className="mr-4">
              {showAddNoteButton && (
                <Button
                  label={"Tambah Catatan"}
                  bgColor="bg-none border-primary border"
                  hoverColor="hover:bg-gray-100"
                  textColor="text-primary"
                  icon={<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.06 14L13.3 11.76V13.6H14.1V10.4H10.9V11.2H12.74L10.5 13.44L11.06 14ZM12.5 16C11.3933 16 10.4501 15.6099 9.6704 14.8296C8.89067 14.0493 8.50053 13.1061 8.5 12C8.49947 10.8939 8.8896 9.95067 9.6704 9.1704C10.4512 8.39013 11.3944 8 12.5 8C13.6056 8 14.5491 8.39013 15.3304 9.1704C16.1117 9.95067 16.5016 10.8939 16.5 12C16.4984 13.1061 16.1083 14.0496 15.3296 14.8304C14.5509 15.6112 13.6077 16.0011 12.5 16ZM3.7 4.8H11.7V3.2H3.7V4.8ZM7.44 14.4H2.1C1.66 14.4 1.28347 14.2435 0.9704 13.9304C0.657333 13.6173 0.500533 13.2405 0.5 12.8V1.6C0.5 1.16 0.6568 0.783467 0.9704 0.4704C1.284 0.157333 1.66053 0.000533333 2.1 0H13.3C13.74 0 14.1168 0.1568 14.4304 0.4704C14.744 0.784 14.9005 1.16053 14.9 1.6V6.96C14.5133 6.77333 14.1232 6.63333 13.7296 6.54C13.336 6.44667 12.9261 6.4 12.5 6.4C12.3533 6.4 12.2165 6.4032 12.0896 6.4096C11.9627 6.416 11.8328 6.4328 11.7 6.46V6.4H3.7V8H8.6C8.36 8.22667 8.14347 8.47333 7.9504 8.74C7.75733 9.00667 7.5872 9.29333 7.44 9.6H3.7V11.2H6.96C6.93333 11.3333 6.9168 11.4635 6.9104 11.5904C6.904 11.7173 6.90053 11.8539 6.9 12C6.9 12.44 6.94 12.8501 7.02 13.2304C7.1 13.6107 7.24 14.0005 7.44 14.4Z" fill="#7B0C42"/>
                    </svg>
                    }
                  // onClick={} 
                />
              )}
            </div>
            <button
              onClick={toggleDropdown}
              className="flex items-center focus:outline-none"
            >
              <span>SuperAdmin</span>
              <svg
                className={`w-4 h-4 ml-2transition-transform ${
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
              <div className="absolute right-0 top-0 mt-10 w-48 bg-white text-black rounded shadow-lg">
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
