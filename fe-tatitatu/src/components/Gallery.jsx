import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import PropTypes from 'prop-types';

const Gallery = ({ 
  data = [],
  enableSubMenus = false,
  subMenus = [],
  onEdit = () => {},
  onDelete = () => {},
  onItemClick = () => {},
  page,
  itemsPerPage,
  searchQuery,
  activeSubMenu,
  setPage,
  setItemsPerPage,
  setSearchQuery,
  setActiveSubMenu,
  totalPages: propTotalPages,
}) => {
  // Semua state dikontrol parent
  const [selectedItem, setSelectedItem] = useState(null);
  
  let userData;
  try {
    userData = JSON.parse(localStorage.getItem('userData') || '{}');
  } catch (error) {
    console.error('Error parsing userData:', error);
    userData = {};
  }
  
  const isAdminGudang = userData?.role === 'admingudang';
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance';
  const role = userData?.role;
  
  const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

  // Semua state dikontrol parent
  const currentPage = page;
  const perPage = itemsPerPage;
  const search = searchQuery;
  const activeMenu = activeSubMenu;

  // Debug logs
  console.log('Gallery received props:', { page, itemsPerPage, searchQuery, activeSubMenu });
  console.log('Gallery using values:', { currentPage, perPage, search, activeMenu });

  // Handler setter with proper function references
  const handleSetPage = (newPage) => setPage && setPage(newPage);
  const handleSetItemsPerPage = (newPerPage) => setItemsPerPage && setItemsPerPage(newPerPage);
  const handleSetSearchQuery = (newQuery) => setSearchQuery && setSearchQuery(newQuery);
  const handleSetActiveSubMenu = (newMenu) => setActiveSubMenu && setActiveSubMenu(newMenu);

  // State lokal untuk input search
  const [localSearch, setLocalSearch] = useState(search);

  // Sync localSearch jika searchQuery dari parent berubah (misal reset filter)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = (
        item.title?.toLowerCase().includes(search?.toLowerCase() || '') ||
        item.type?.toLowerCase().includes(search?.toLowerCase() || '') 
      );
      const matchesCategory = enableSubMenus
        ? !search
          ? (!activeMenu || activeMenu === 'Semua' || item.category === activeMenu)
          : true
        : true; 
      return matchesSearch && matchesCategory;
    });
  }, [data, search, activeMenu, enableSubMenus]);

  let displayedData = data;
  let totalPages = propTotalPages;
  if (propTotalPages === undefined) {
    totalPages = Math.ceil(filteredData.length / perPage);
    const startIndex = (currentPage - 1) * perPage;
    displayedData = filteredData.slice(startIndex, startIndex + perPage);
  }

  // Jika currentPage lebih besar dari totalPages (misal setelah filter/data berubah), auto-fix ke page terakhir yang valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      handleSetPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) handleSetPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) handleSetPage(currentPage + 1);
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

  const handleItemClick = (e, item) => {
    if (e.target.closest('.more-button')) {
      return;
    }
    onItemClick(item);
  };

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    console.log('handleItemsPerPageChange called with:', newValue);
    handleSetItemsPerPage(newValue);
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari Barang"
            className="w-full p-2 pl-10 border rounded-lg bg-white"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSetSearchQuery(localSearch);
              }
            }}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-gray-600">Page</span>
          <select 
            className="border rounded-lg p-1.5 bg-white"
            value={perPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={3}>3</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {enableSubMenus && (
        <div className="relative mb-6 border-b">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:gap-6">
            {subMenus.map(menu => (
              <button
                key={menu}
                className={`pb-2 px-1 text-sm ${
                  activeMenu === menu 
                    ? `border-b-2 border-${themeColor} text-${themeColor} font-medium`
                    : 'text-gray-500'
                }`}
                onClick={() => {
                  handleSetActiveSubMenu(menu);
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
                className="w-full h-full object-cover rounded-lg cursor-pointer"
              />
            </div>
            <div className="p-3">
              <p className={`text-${themeColor} text-sm mb-1`}>{item.type}</p>
              <h3 
                className="text-base font-bold text-gray-900 mb-1 cursor-pointer"
                onClick={(e) => handleItemClick(e, item)}
              >
                {item.title}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-sm">{item.price}</p>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="text-gray-400 hover:text-gray-600 more-button"
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
                  onClick={() => handleSetPage(page)}
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

Gallery.propTypes = {
  data: PropTypes.array,
  enableSubMenus: PropTypes.bool,
  subMenus: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onItemClick: PropTypes.func,
  page: PropTypes.number,
  itemsPerPage: PropTypes.number,
  searchQuery: PropTypes.string,
  activeSubMenu: PropTypes.string,
  setPage: PropTypes.func,
  setItemsPerPage: PropTypes.func,
  setSearchQuery: PropTypes.func,
  setActiveSubMenu: PropTypes.func,
  totalPages: PropTypes.number,
};

export default Gallery;