import React, { useState, useEffect } from 'react';

const ButtonDropdown = ({ options, selectedIcon, label, selectedStore, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState(selectedStore || label);
  const [selectedIconUrl, setSelectedIconUrl] = useState(selectedIcon);

  useEffect(() => {
    if (options.length > 0 && selectedStore) {
      const selectedOption = options.find(option => option.label === selectedStore);
      if (selectedOption) {
        setSelectedValue(selectedOption.label);
        setSelectedIconUrl(selectedOption.icon);
      } else {
        setSelectedValue(selectedStore || 'Semua');  
        setSelectedIconUrl(selectedIcon);
      }
    }
  }, [options, selectedStore, selectedIcon]);

  const handleSelect = (option) => {
    setSelectedValue(option.label);
    setSelectedIconUrl(option.icon);
    onSelect(option.label);  
    setIsOpen(false);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative inline-block w-full md:w-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none"
      >
        <div className="flex items-center space-x-2">
          {selectedIconUrl && <img src={selectedIconUrl} alt="icon" className="w-5 h-5" />}
          <span>{selectedValue || 'Semua'}</span> 
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          xmlns="http://www.w3.org/2000/svg"
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
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          <input
            type="text"
            className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={option.icon}
                      alt={option.label}
                      className="w-5 h-5"
                    />
                    <span>{option.label}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ButtonDropdown;
