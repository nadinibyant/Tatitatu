import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

const ActionMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleMoreClick = (e) => {
    e.stopPropagation(); 
    setIsOpen(!isOpen);
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); 
    onEdit();
    setIsOpen(false);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); 
    onDelete();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} onClick={e => e.stopPropagation()}>
      <button
        onClick={handleMoreClick}
        className="p-1 rounded-full hover:bg-gray-100"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={handleEditClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 mr-2 text-orange-500" />
              Edit Data
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
              Hapus Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;