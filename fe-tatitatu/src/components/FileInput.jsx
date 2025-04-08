import React, { useState } from "react";

const FileInput = ({ 
  label, 
  onFileChange, 
  width='sm:w-1/6 w-1/3', 
  defaultValue,

}) => {
  const [preview, setPreview] = useState(defaultValue || null);

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

      const svgColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi) 
      ? "#71503D"  
      : (isManajer || isOwner || isFinance) 
        ? "#023F80"  
        : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
          ? "#2D2D2D"
          : "#7B0C42";

      // const svgColor = (isAdminGudang || isHeadGudang) 
      // ? "#71503D" 
      // : (isManajer || isOwner || isFinance) 
      //   ? "#023F80" 
      //   : "#7B0C42";

  // const svgColor = (role === "admingudang" || role === "headgudang") ? "#5D4037" : "#7B0C42";

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center border-2 border-dashed border-${themeColor} rounded-lg p-6 text-${themeColor} cursor-pointer hover:bg-${themeColor === "primary" ? "purple" : "amber"}-50 ${width}`}>
      <label className="flex flex-col items-center justify-center cursor-pointer">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 object-cover mb-2 rounded-md"
          />
        ) : (
          <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M36.8346 19C36.8346 18.5138 36.6415 18.0474 36.2977 17.7036C35.9538 17.3598 35.4875 17.1667 35.0013 17.1667C34.5151 17.1667 34.0488 17.3598 33.7049 17.7036C33.3611 18.0474 33.168 18.5138 33.168 19H36.8346ZM18.5013 4.33332C18.9875 4.33332 19.4538 4.14017 19.7977 3.79635C20.1415 3.45254 20.3346 2.98622 20.3346 2.49999C20.3346 2.01376 20.1415 1.54744 19.7977 1.20363C19.4538 0.859811 18.9875 0.666656 18.5013 0.666656V4.33332ZM32.2513 33.6667H4.7513V37.3333H32.2513V33.6667ZM3.83464 32.75V5.24999H0.167969V32.75H3.83464ZM33.168 19V32.75H36.8346V19H33.168ZM4.7513 4.33332H18.5013V0.666656H4.7513V4.33332ZM4.7513 33.6667C4.50819 33.6667 4.27503 33.5701 4.10312 33.3982C3.93121 33.2263 3.83464 32.9931 3.83464 32.75H0.167969C0.167969 33.9656 0.650854 35.1314 1.5104 35.9909C2.36994 36.8504 3.53573 37.3333 4.7513 37.3333V33.6667ZM32.2513 37.3333C33.4669 37.3333 34.6327 36.8504 35.4922 35.9909C36.3517 35.1314 36.8346 33.9656 36.8346 32.75H33.168C33.168 32.9931 33.0714 33.2263 32.8995 33.3982C32.7276 33.5701 32.4944 33.6667 32.2513 33.6667V37.3333ZM3.83464 5.24999C3.83464 5.00687 3.93121 4.77372 4.10312 4.60181C4.27503 4.4299 4.50819 4.33332 4.7513 4.33332V0.666656C3.53573 0.666656 2.36994 1.14954 1.5104 2.00908C0.650854 2.86863 0.167969 4.03441 0.167969 5.24999H3.83464Z" fill={svgColor}/>
          <path d="M2 29.0833L11.8019 20.0982C12.1323 19.7954 12.5621 19.6241 13.0102 19.6166C13.4583 19.6092 13.8936 19.7662 14.2338 20.0578L25.8333 30M22.1667 25.4167L26.5419 21.0414C26.854 20.7291 27.2683 20.54 27.7086 20.5086C28.149 20.4773 28.5859 20.606 28.939 20.8709L35 25.4167M24 8H35M29.5 2.5V13.5" stroke={svgColor} stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        )}
        <span className="text-center text-sm font-medium pt-5">{label}</span>
      </label>
    </div>
  );
};

export default FileInput;