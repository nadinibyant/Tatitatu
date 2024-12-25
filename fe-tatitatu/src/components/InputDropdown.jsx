import React, { useState } from "react";

const InputDropdown = ({ label, options, onSelect, width = "w-full" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    setSelectedValue(value);
    setIsOpen(false);
    onSelect(value);
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
          className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none cursor-pointer"
          onClick={() => setIsOpen((prev) => !prev)}
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
                  className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(option)}
                >
                  {option}
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

// const InputDropdown = () => {
//   const [selectedOption, setSelectedOption] = useState("");

//   const handleSelect = (value) => {
//     setSelectedOption(value);
//     console.log("Selected: ", value);
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-lg font-bold mb-4">Dropdown Dengan Pencarian</h1>
//       <DropdownWithSearch
//         label="Divisi"
//         options={["Marketing", "HRD", "Finance", "IT Support", "Logistik"]}
//         onSelect={handleSelect}
//       />
//       <p className="mt-4">Data Terpilih: {selectedOption}</p>
//     </div>
//   );
// };

export default InputDropdown;
