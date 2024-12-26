import React from "react";

const TextArea = ({ label, placeholder, required = false, value, onChange }) => {
  return (
    <div className="mb-4 w-full">
      <label className="block text-gray-700 font-medium mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows="10"
      ></textarea>
    </div>
  );
};

export default TextArea;
