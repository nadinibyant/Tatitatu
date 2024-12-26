import React, { useState } from "react";

const Input = ({ label,type,type1 ="text", value, onChange, width = "w-full", required = true }) => {
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
    <div className={`mb-4 ${width}`}>
      <label className="block text-gray-700 font-medium mb-2 sm:text-sm text-sm">
        {label}
      </label>
      <input
        type={type1} // Tetap gunakan type "text" agar bisa diformat
        value={type === "number" ? formatNumber(rawValue) : rawValue} // Tampilkan nilai terformat untuk angka
        onChange={handleInputChange}
        className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base text-sm"
        placeholder={label}
        required={required}
      />
    </div>
  );
};

export default Input;
