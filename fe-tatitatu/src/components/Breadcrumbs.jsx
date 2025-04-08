import React from "react";

const Breadcrumbs = ({ items}) => {
  const userData = JSON.parse(localStorage.getItem('userData'))
  const isAdminGudang = userData?.role === 'admingudang'
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance'
  const isKaryawanProduksi = userData?.role === 'karyawanproduksi'

  const themeColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
      ? "hitam"
      : "primary";


  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index !== items.length - 1 ? (
            <a
              href={item.href}
              className="text-gray-500 hover:text-gray-700"
            >
              {item.label}
            </a>
          ) : (
            <span className={`text-${themeColor} font-bold`}>{item.label}</span>
          )}
          {index !== items.length - 1 && <span className="text-gray-400">&gt;</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;