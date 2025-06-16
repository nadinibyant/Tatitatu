import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react"; 

const Input = ({ 
  label, 
  type, 
  type1 = "text", 
  value, 
  onChange, 
  width = "w-full", 
  required = true,  
  onKeyDown,
  placeholder,
  showRequired = true,
  disabled = false,
}) => {
  const [rawValue, setRawValue] = useState(value || "");
  const [isTouched, setIsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData'))
  const role = userData?.role
  const isAdminGudang = role === 'admingudang';
  const isHeadGudang = role === 'headgudang';
  const isKasirToko = role === 'kasirtoko';
  const isManajer = role === 'manajer';
  const isOwner = role === 'owner';
  const isFinance = role === 'finance';
  const isAdmin = role === 'admin';
  const isKaryawanProduksi = role === 'karyawanproduksi';
  const toko_id = userData?.tokoId;

  const themeColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi || toko_id === 1) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : ((isAdmin && userData?.userId !== 1 && userData?.userId !== 2) || 
         (isKasirToko && toko_id !== undefined && toko_id !== null && toko_id !== 1 && toko_id !== 2))
        ? "hitam"
        : "primary";

  const getRingColor = () => {
    return `focus:ring-1 focus:ring-${themeColor} focus:outline-none`;
  };

  const ringColor = getRingColor();

  useEffect(() => {
    setRawValue(value || "");
  }, [value]);

  useEffect(() => {
    if (!value && (type1 === "date" || type1 === "datetime-local")) {
      const now = new Date();

      const localOffset = now.getTimezoneOffset();

      const wibOffset = 7 * 60; 
      const totalOffset = localOffset + wibOffset;

      const wibTime = new Date(now.getTime() + (totalOffset * 60000));
      
      if (type1 === "date") {
        const formattedDate = wibTime.toISOString().split('T')[0];
        setRawValue(formattedDate);
        if (onChange) onChange(formattedDate);
      } else if (type1 === "datetime-local") {
        const year = wibTime.getFullYear();
        const month = String(wibTime.getMonth() + 1).padStart(2, '0');
        const day = String(wibTime.getDate()).padStart(2, '0');
        const hours = String(wibTime.getHours()).padStart(2, '0');
        const minutes = String(wibTime.getMinutes()).padStart(2, '0');
        
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        setRawValue(formattedDateTime);
        if (onChange) onChange(formattedDateTime);
      }
    } else if (value && type1 === "datetime-local") {
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      setRawValue(formattedDateTime);
    } else {
      setRawValue(value || "");
    }
  }, [value, type1, onChange]);

  const formatNumber = (num) => {
    if (num === "" || num === undefined || num === null) return "";
    return num.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleInputChange = (e) => {
    let inputValue = e.target.value;
    if (type === "number") {
      const raw = inputValue.replace(/\./g, "");
      setRawValue(raw);
      onChange(raw === "" ? "" : parseInt(raw));
    } else {
      setRawValue(inputValue);
      onChange(inputValue);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputType = () => {
    if (type1 === "password") {
      return showPassword ? "text" : "password";
    }
    return type1;
  };

  const showError = required && isTouched && !rawValue;

  return (
    <div className={`mb-2 sm:mb-4 ${width}`}>
      <label className="block text-gray-700 font-medium mb-1 sm:text-sm text-base">
        {label}
        {showRequired && required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={getInputType()}
          value={type === "number" ? formatNumber(rawValue) : rawValue}
          onChange={handleInputChange}
          onBlur={() => setIsTouched(true)}
          className={`w-full border rounded-md sm:py-1 sm:px-4 py-2 px-3 ${type1 === "password" ? "pr-10" : ""} focus:outline-none
            ${showError 
              ? 'border-red-500 focus:ring-red-200' 
              : `border-gray-300 ${ringColor}`
            } text-base`}
          placeholder={placeholder || label}
          required={required}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
        {(type1 === "password") && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
            onClick={togglePasswordVisibility}
            tabIndex="-1"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {showError && (
        <p className="text-red-500 text-sm mt-1">
          {label} harus diisi
        </p>
      )}
    </div>
  );
};

export default Input;