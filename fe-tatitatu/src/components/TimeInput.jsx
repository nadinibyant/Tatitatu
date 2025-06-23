import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TimeInput = ({ 
  label, 
  value = { amount: '', unit: 'Menit' },
  onChange,
  required = true,
  width = "w-full"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value.amount || '');
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  
  const timeOptions = [
    { label: 'APM', value: 'Menit' },
    { label: 'API', value: 'Antar' },
    { label: 'APH', value: 'Antar' }  
  ];

  // Mendapatkan data pengguna untuk theming
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isAdminGudang = userData?.role === "admingudang";
  const isHeadGudang = userData?.role === "headgudang";
  const isOwner = userData?.role === "owner";
  const isManajer = userData?.role === "manajer";
  const isAdmin = userData?.role === "admin";
  const isFinance = userData?.role === "finance";
  const isKaryawanProduksi = userData?.role === "karyawanproduksi";
  
  // Check if current route is an absensi route
  const isAbsensiRoute = 
    location.pathname === '/absensi-karyawan' || 
    location.pathname === '/absensi-karyawan-transport' || 
    location.pathname === '/absensi-karyawan-produksi' ||
    location.pathname === '/izin-cuti-karyawan' ||
    location.pathname === '/profile' ||
    location.pathname.startsWith('/absensi-karyawan-produksi/tambah');
    
  // Get toko_id from userData
  const toko_id = userData?.tokoId;
  
  // Theme color logic based on route and toko_id
  const themeColor = isAbsensiRoute
    ? (!toko_id 
        ? "biruTua" 
        : toko_id === 1 
          ? "coklatTua" 
          : toko_id === 2 
            ? "primary" 
            : "hitam")
    : (isAdminGudang || isHeadGudang || isKaryawanProduksi) 
      ? 'coklatTua' 
      : (isManajer || isOwner || isFinance) 
        ? "biruTua" 
        : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
          ? "hitam"
          : "primary";
  
  // Find the matching option based on value.unit
  useEffect(() => {
    const initialOption = timeOptions.find(option => 
      option.value === value.unit && 
      // If we have a label stored, match that too
      (value.label ? option.label === value.label : true)
    ) || timeOptions[0];
    
    setSelectedOption(initialOption);
    setInputValue(value.amount || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newAmount = e.target.value;
    setInputValue(newAmount);
    onChange && onChange({
      amount: newAmount,
      unit: selectedOption.value,
      label: selectedOption.label
    });
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange && onChange({
      amount: inputValue,
      unit: option.value,
      label: option.label
    });
  };

  return (
    <div className={width}>
      <label className="block font-medium text-gray-700 pb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative flex">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          className={`w-full rounded-l-md border border-r-0 border-gray-300 px-5 py-1 focus:outline-none focus:ring-1 focus:ring-${themeColor}`}
          placeholder="Masukkan Jumlah"
          required={required}
        />
        
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center justify-between min-w-[100px] h-full px-3 border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-${themeColor}`}
          >
            <span className="text-gray-700">{selectedOption?.label}</span>
            <svg
              className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {timeOptions.map((option, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 cursor-pointer hover:bg-${themeColor === 'primary' ? 'purple' : themeColor === 'biruTua' ? 'blue' : themeColor === 'hitam' ? 'gray' : 'amber'}-50`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeInput;