import React, { useState, useMemo, useEffect } from 'react';
import { MoreVertical, Search, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';


const Gallery = ({ 
  data = [],
  enableSubMenus = false,
  subMenus = [],
  defaultSubMenu = '',
  onEdit = () => {},
  onDelete = () => {},
  className = '',
  onItemClick = () => {},
  url='',
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubMenu, setActiveSubMenu] = useState('Semua')
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedItem, setSelectedItem] = useState(null);
  const userData = JSON.parse(localStorage.getItem('userData'))
  const isAdminGudang = userData?.role === 'admingudang'
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance'
  const role = userData?.role
  
  // Determine the color theme based on role
  const themeColor = (isAdminGudang || isHeadGudang) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
      ? "hitam"
      : "primary";

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) 
      );
  
      const matchesCategory = enableSubMenus
      ? !searchQuery
          ? (!activeSubMenu || activeSubMenu === 'Semua' || item.category === activeSubMenu)
          : true
      : true; 
  
      return matchesSearch && matchesCategory;
    });
  }, [data, searchQuery, activeSubMenu, enableSubMenus]);
  

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  
  const getVisiblePages = () => {
    let pages = [];
    if (totalPages <= 3) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 2) {
      pages = [1, 2, '...', totalPages];
    } else if (currentPage >= totalPages - 1) {
      pages = [1, '...', totalPages - 1, totalPages];
    } else {
      pages = [1, '...', currentPage, '...', totalPages];
    }
    return pages;
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleItemClick = (e, item) => {
    if (e.target.closest('.more-button')) {
      return;
    }
    onItemClick(item);
  };

  const navigate = useNavigate()

  return (
    <div className="w-full mx-auto p-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari Barang"
            className="w-full p-2 pl-10 border rounded-lg bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-gray-600">Page</span>
          <select 
            className="border rounded-lg p-1.5 bg-white"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Sub Menus */}
      {enableSubMenus && (
        <div className="relative mb-6 border-b">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:gap-6">
            {subMenus.map(menu => (
              <button
                key={menu}
                className={`pb-2 px-1 text-sm ${
                  activeSubMenu === menu 
                    ? `border-b-2 border-${themeColor} text-${themeColor} font-medium`
                    : 'text-gray-500'
                }`}
                onClick={() => {
                  setActiveSubMenu(menu);
                  setCurrentPage(1);
                }}
              >
                {menu}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayedData.map(item => (
          <div key={item.id} className="relative">
            <div className="relative aspect-square">
              <img
                src={item.image}
                onClick={(e) => handleItemClick(e, item)}
                alt={item.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="p-3">
              <p className={`text-${themeColor} text-sm mb-1`}>{item.type}</p>
              <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-sm">{item.price}</p>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MoreHorizontal size={18} color={(role === "admingudang" || role === "headgudang") ? '#5D4037' : '#7B0C42'} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-lg p-4 w-64"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onEdit(selectedItem);
                  // navigate(`${url}/${selectedItem.id}`)
                  setSelectedItem(null);
                }}
                className="w-full border border-oren text-oren font-semibold py-2 text-left px-4 hover:bg-gray-100 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(selectedItem);
                  setSelectedItem(null);
                }}
                className="w-full py-2 border border-merah text-merah font-semibold text-left px-4 hover:bg-gray-100 rounded text-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-end items-center gap-1">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-1">...</span>
              ) : (
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md min-w-[32px] ${
                    currentPage === page
                      ? `bg-${themeColor} text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;