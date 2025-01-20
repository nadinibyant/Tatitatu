import React, { useState, useEffect } from "react";

const InputDropdown = ({ 
  label, 
  options, 
  value, 
  onSelect, 
  width = "w-full", 
  required = true, 
  showRequired = true, 
  disabled,
  error = false,
  errorMessage = "Harap pilih opsi",
  name,
  onBlur,
  onChange
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [selectedOption, setSelectedOption] = useState(
    options.find(option => option.value === value) || null
  );
  const [showError, setShowError] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const matchedOption = options.find(option => 
      String(option.value) === String(value)
    );

    if (matchedOption) {
      setSelectedValue(matchedOption.label);
      setSelectedOption(matchedOption);
      setShowError(false);
    } else {
      setSelectedValue("");
      setSelectedOption(null);
    }
  }, [value, options]);

  const filteredOptions = options.filter((option) =>
    (option.label || option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedOption) => {
    const value = selectedOption.label || selectedOption;
    setSelectedValue(value);
    setSelectedOption(selectedOption);
    setIsOpen(false);
    setShowError(false);
    setTouched(true);
    
    if (onSelect) {
      onSelect(selectedOption);
    }
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: selectedOption.value,
          type: 'select'
        }
      });
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      setTouched(true);
      if (required && !selectedValue) {
        setShowError(true);
      }
    }
  };

  const handleInputBlur = (e) => {
    setTouched(true);
    if (required && !selectedValue) {
      setShowError(true);
    }
    if (onBlur) {
      onBlur({
        target: {
          name,
          value: selectedOption?.value || '',
          type: 'select'
        }
      });
    }
  };

  const shouldShowError = (touched || showError || error) && required && !selectedValue;

  return (
    <div className={`relative ${width}`}>
      <label className={`block font-medium pb-1 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
        {label}
        {showRequired && required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={selectedValue}
          placeholder={`Pilih ${label}`}
          className={`w-full border rounded-md py-1 px-4 focus:outline-none text-ellipsis overflow-hidden whitespace-nowrap
            ${disabled 
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 cursor-pointer hover:border-primary focus:border-primary'
            }
            ${shouldShowError ? 'border-red-500' : ''}
            ${selectedValue ? 'text-gray-900' : 'text-gray-500'}
          `}
          onClick={handleInputClick}
          onBlur={handleInputBlur}
          style={{ textOverflow: "ellipsis" }}
          disabled={disabled}
          name={name}
        />
        <span className={`absolute right-3 top-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}
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
      {shouldShowError && (
        <p className="mt-1 text-sm text-red-500">
          {errorMessage}
        </p>
      )}
      {isOpen && !disabled && (
        <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
          <input
            type="text"
            placeholder="Cari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-b border-gray-300 py-2 px-4 focus:outline-none"
          />
          <ul className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className={`py-2 px-4 hover:bg-gray-100 cursor-pointer transition-colors duration-200
                    ${selectedOption?.value === option.value ? 'bg-gray-50 text-primary' : ''}
                  `}
                  onClick={() => handleSelect(option)}
                >
                  {option.label || option}
                </li>
              ))
            ) : (
              <li className="py-2 px-4 text-gray-500 text-center">Tidak ada data</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InputDropdown;