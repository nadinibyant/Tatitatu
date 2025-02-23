import React, { useState, useRef, useEffect } from 'react';

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  const safeOptions = Array.isArray(options) ? options : [];
  
  const selectedOption = safeOptions.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = safeOptions.filter(option => 
    option.label && typeof option.label === 'string' && 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex justify-between items-center w-full p-1 border ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer bg-white'
        } border-gray-300 rounded-md focus:outline-none focus:border-primary`}
      >
        <span className={!displayValue ? 'text-gray-400' : ''}>
          {displayValue || placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-300">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari..."
              className="w-full p-2 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={`${option.value || 'null'}`}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                  option.value === value ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 text-center">Tidak ada hasil</div>
          )}
        </div>
      )}
    
      {required && (
        <input
          type="hidden"
          value={value || ''}
          required={required}
        />
      )}
    </div>
  );
};

export default SearchableDropdown;