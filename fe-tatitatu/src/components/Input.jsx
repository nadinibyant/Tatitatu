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

  useEffect(() => {
    setRawValue(value || "");
  }, [value]);

  useEffect(() => {
    if (!value && (type1 === "date" || type1 === "datetime-local")) {
      const today = new Date();
      
      if (type1 === "date" || type1 === 'date') {
        const formattedDate = today.toISOString().split('T')[0];
        setRawValue(formattedDate);
        if (onChange) onChange(formattedDate);
      } else if (type1 === "datetime-local" || type1 === 'datetime-local') {
        const formattedDateTime = today.toISOString().slice(0, 16);
        setRawValue(formattedDateTime);
        if (onChange) onChange(formattedDateTime);
      }
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
        className={`w-full border rounded-md sm:py-1 sm:px-4 py-2 px-3 focus:outline-none focus:ring-2 
          ${showError 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:ring-blue-500'
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