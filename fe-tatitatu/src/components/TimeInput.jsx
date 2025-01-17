import React, { useState, useRef, useEffect } from 'react';

const TimeInput = ({ 
  label, 
  value = { amount: '', unit: 'Menit' },
  onChange,
  options = ['Menit', 'Antar'], // Default options jika tidak ada yang diberikan
  defaultUnit = 'Menit', // Default unit yang dipilih
  required = true,
  width = "w-full"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value.amount || '');
  const [timeUnit, setTimeUnit] = useState(value.unit || defaultUnit);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newAmount = e.target.value;
    setInputValue(newAmount);
    onChange && onChange({
      amount: newAmount,
      unit: timeUnit
    });
  };

  const handleUnitClick = (unit) => {
    setTimeUnit(unit);
    setIsOpen(false);
    onChange && onChange({
      amount: inputValue,
      unit: unit
    });
  };

  return (
    <div className={width}>
      <label className="block font-medium text-gray-700 pb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative flex">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full rounded-l-md border border-r-0 border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="Masukkan Jumlah"
          required={required}
        />
        
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between min-w-[100px] h-full px-3 border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 focus:outline-none"
          >
            <span className="text-gray-700">{timeUnit}</span>
            <svg
              className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {options.map((unit) => (
                <div
                  key={unit}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleUnitClick(unit)}
                >
                  {unit}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeInput;