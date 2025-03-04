import React, { useEffect, useState } from "react";

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
  const userData = JSON.parse(localStorage.getItem('userData'))
  const role = userData?.role

  const getRingColor = () => {
    if (role === "admingudang" || role === "headgudang") {
      return "focus:ring-2 focus:ring-coklatTua focus:outline-none";
    } else if (role === "manajer" || role === "finance" || role === "owner") {
      return "focus:ring-2 focus:ring-biruTua focus:outline-none";
    } else {
      return "focus:ring-2 focus:ring-primary focus:outline-none";
    }
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

  const showError = required && isTouched && !rawValue;

  return (
    <div className={`mb-2 sm:mb-4 ${width}`}>
      <label className="block text-gray-700 font-medium mb-1 sm:text-sm text-base">
        {label}
        {showRequired && required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type1}
        value={type === "number" ? formatNumber(rawValue) : rawValue}
        onChange={handleInputChange}
        onBlur={() => setIsTouched(true)}
        className={`w-full border rounded-md sm:py-1 sm:px-4 py-2 px-3 focus:outline-none
          ${showError 
            ? 'border-red-500 focus:ring-red-200' 
            : `border-gray-300 ${ringColor}`
          } text-base`}
        placeholder={placeholder || label}
        required={required}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      {showError && (
        <p className="text-red-500 text-sm mt-1">
          {label} harus diisi
        </p>
      )}
    </div>
  );
};

export default Input;