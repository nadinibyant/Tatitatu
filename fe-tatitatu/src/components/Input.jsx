import React, { useState } from "react";

const Input = ({ 
  label, 
  type, 
  type1 = "text", 
  value, 
  onChange, 
  width = "w-full", 
  required = true,  // Default true untuk konsistensi dengan versi sebelumnya
  onKeyDown,
  showRequired = true // Prop baru untuk mengontrol tampilan tanda *
}) => {
  const [rawValue, setRawValue] = useState(value || "");

  const formatNumber = (num) => {
    if (num === "" || num === undefined || num === null) return "";
    return num.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (type === "number") {
      const raw = inputValue.replace(/\./g, "");
      setRawValue(raw);
      onChange(raw === "" ? "" : parseInt(raw));
    } else {
      setRawValue(inputValue);
      onChange(inputValue);
    }
  };

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
        className="w-full border border-gray-300 rounded-md sm:py-1 sm:px-4 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        placeholder={label}
        required={required}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default Input;
