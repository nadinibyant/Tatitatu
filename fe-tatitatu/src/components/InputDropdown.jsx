import React, { useState, useEffect } from "react";

const InputDropdown = ({ label, options, value, onSelect, width = "w-full" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || ""); // Gunakan value jika tersedia

  useEffect(() => {
    setSelectedValue(value || ""); // Update selectedValue jika value berubah
  }, [value]);

  // Pastikan option memiliki struktur yang sesuai
  const filteredOptions = options.filter((option) =>
    (option.label || option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedOption) => {
    const value = selectedOption.label || selectedOption; // Jika objek, ambil label
    setSelectedValue(value);
    setIsOpen(false);
    if (onSelect) {
      onSelect(selectedOption); // Panggil callback onSelect
    }
  };

  return (
    <div className={`relative ${width}`}>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={selectedValue}
          placeholder={`Masukkan ${label}`}
          className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{ textOverflow: "ellipsis" }} // Tambahkan gaya untuk memotong teks
        />
        <span className="absolute right-3 top-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>
      {isOpen && (
        <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
          <input
            type="text"
            placeholder="Cari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-b border-gray-300 py-2 px-4 focus:outline-none"
          />
          <ul>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className="py-2 px-4 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  onClick={() => handleSelect(option)}
                >
                  {option.label || option} {/* Tampilkan label jika ada */}
                </li>
              ))
            ) : (
              <li className="py-2 px-4 text-gray-500">Tidak ada data</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InputDropdown;
