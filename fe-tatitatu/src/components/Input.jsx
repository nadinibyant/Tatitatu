import React, { useState } from "react";

const Input = ({ label, type, type1 = "text", value, onChange, width = "w-full", required = true, onKeyDown }) => {
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
      onChange(raw === "" ? "" : parseInt(raw)); // Hanya kirim nilai yang diformat
    } else {
      setRawValue(inputValue);
      onChange(inputValue);
    }
  };

  return (
    <div className={`mb-2 sm:mb-4 ${width}`}>
      <label className="block text-gray-700 font-medium mb-1 sm:text-sm text-base">
        {label}
      </label>
      <input
        type={type1} // Tetap gunakan type "text" agar bisa diformat
        value={type === "number" ? formatNumber(rawValue) : rawValue} // Tampilkan nilai terformat untuk angka
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
