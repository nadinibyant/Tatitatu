// src/data/menuData.js
export const menuItems = [
    {
      label: "Menu 1",
      link: "/pembelianStok",
      icon: "📂",
      submenu: [
        { label: "Submenu 1", link: "/submenu1" },
        { label: "Submenu 2", link: "/submenu2" },
      ],
    },
    {
      label: "Menu 2",
      link: "/menu2",
      icon: "⚙️",
      submenu: [
        { label: "Submenu A", link: "/submenuA" },
        { label: "Submenu B", link: "/submenuB" },
      ],
    },
  ];
  
  export const userOptions = [
    { label: "Profile", link: "/profile" },
    { label: "Logout", link: "/logout" },
  ];
  