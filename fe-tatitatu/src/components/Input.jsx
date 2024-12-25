import React, { useState } from "react";

const Input = ({ label, type, value, onChange, width = "w-full" }) => {
  const formatNumber = (num) => {
    return num.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleInputChange = (e) => {
    if (type === "number") {
      const rawValue = e.target.value.replace(/\./g, "");
      onChange(rawValue);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`mb-4 ${width}`}>
      <label className="block text-gray-700 font-medium mb-2 sm:text-base text-sm">
        {label}
      </label>
      <input
        type={type === "number" ? "text" : type}
        value={type === "number" ? formatNumber(value) : value}
        onChange={handleInputChange}
        className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base text-sm"
        placeholder={label}
      />
    </div>
  );
};

export default Input;