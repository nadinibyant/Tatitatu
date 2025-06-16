import React from "react";

const Spinner = () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdminGudang = userData?.role === 'admingudang'
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance'
  const isKaryawanProduksi = userData?.role === 'karyawanproduksi'
  const isKasirToko = userData?.role === 'kasirtoko';
  const toko_id = userData?.tokoId;

  const themeColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi || toko_id === 1) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : ((isAdmin && userData?.userId !== 1 && userData?.userId !== 2) || 
         (isKasirToko && toko_id !== undefined && toko_id !== null && toko_id !== 1 && toko_id !== 2))
        ? "hitam"
        : "primary";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="relative">
        <div className={`w-16 h-16 border-4 border-${themeColor}/20 border-solid rounded-full`}></div>
        <div className={`absolute top-0 left-0 w-16 h-16 border-4 border-t-4 border-${themeColor} border-solid rounded-full animate-[spin_0.6s_linear_infinite]`}></div>
      </div>
    </div>
  );
};

export default Spinner;