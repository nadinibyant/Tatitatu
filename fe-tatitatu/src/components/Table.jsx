import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

const Table = ({
  bg_header,
  text_header,
  data,
  headers,
  onRowClick,
  hasFilter = false,
  filterFields = [],
  onFilterClick,
  hasSearch = true,
  hasPagination = true,
  hasSubmenu = false,
  submenuItems = [],
  defaultSubmenu = 'semua',
  additionalButton,
  // Controlled props for pagination state
  page,
  itemsPerPage,
  searchQuery,
  activeSubMenu,
  setPage,
  setItemsPerPage,
  setSearchQuery,
  setActiveSubMenu,
  // New prop to control URL syncing
  syncWithUrl = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State dari URL query param
  const urlPage = Number(searchParams.get('page')) || 1;
  const urlItemsPerPage = Number(searchParams.get('perPage')) || 10;
  const urlSearchQuery = searchParams.get('search') || '';
  const urlActiveSubMenu = searchParams.get('category') || defaultSubmenu;
  
  // Internal state untuk uncontrolled mode
  const [internalSearchTerm, setInternalSearchTerm] = useState(urlSearchQuery);
  const [internalPageSize, setInternalPageSize] = useState(urlItemsPerPage);
  const [internalCurrentPage, setInternalCurrentPage] = useState(urlPage);
  const [internalActiveSubmenu, setInternalActiveSubmenu] = useState(urlActiveSubMenu);
  
  // Determine which values to use based on controlled props and syncWithUrl
  const currentPage = page !== undefined ? page : syncWithUrl ? urlPage : internalCurrentPage;
  const pageSize = itemsPerPage !== undefined ? itemsPerPage : syncWithUrl ? urlItemsPerPage : internalPageSize;
  const searchTerm = searchQuery !== undefined ? searchQuery : syncWithUrl ? urlSearchQuery : internalSearchTerm;
  const activeSubmenu = activeSubMenu !== undefined ? activeSubMenu : syncWithUrl ? urlActiveSubMenu : internalActiveSubmenu;
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userRole = userData?.role;
  const isAdminGudang = userData?.role === 'admingudang'
  const isHeadGudang = userData?.role === 'headgudang'
  const isManajer = userData?.role === 'manajer'
  const isOwner = userData?.role === 'owner'
  const isFinance = userData?.role === 'finance'
  const isAdmin = userData?.role === 'admin'
  const isKaryawanProduksi = userData?.role === 'karyawanproduksi'
  const location = useLocation();
  
  const isAbsensiRoute = 
    location.pathname === '/absensi-karyawan' || 
    location.pathname === '/absensi-karyawan-transport' || 
    location.pathname === '/absensi-karyawan-produksi' ||
    location.pathname === '/izin-cuti-karyawan' ||
    location.pathname === '/profile' ||
    location.pathname.startsWith('/absensi-karyawan-produksi/tambah');
    
    const toko_id = userData?.tokoId;
      
    const themeColor = isAbsensiRoute
      ? (!toko_id 
          ? "biruTua" 
          : toko_id === 1 
            ? "coklatTua" 
            : toko_id === 2 
              ? "primary" 
              : "hitam")
      : (isAdminGudang || isHeadGudang || isKaryawanProduksi || toko_id === 1) 
        ? 'coklatTua' 
        : (isManajer || isOwner || isFinance) 
          ? "biruTua" 
          : ((isAdmin && userData?.userId !== 1 && userData?.userId !== 2) || (toko_id !== undefined && toko_id !== null && toko_id !== 1 && toko_id !== 2))
            ? "hitam"
            : "primary";
  
  const headerBgColorMap = {
    'biruTua': 'bg-biruTua',
    'coklatTua': 'bg-coklatMuda',
    'hitam': 'bg-hitam',
    'primary': 'bg-pink'
  };
  
  const headerTextColorMap = {
    'biruTua': 'text-biruMuda',
    'coklatTua': 'text-coklatTua',
    'hitam': 'text-white',
    'primary': 'text-primary'
  };
  
  const headerBgColor = bg_header || headerBgColorMap[themeColor];
  
  const headerTextColor = text_header || headerTextColorMap[themeColor];

  const handleSetPage = (newPage) => {
    if (setPage) {
      setPage(newPage);
    } else {
      setInternalCurrentPage(newPage);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set('page', newPage.toString());
          return newParams;
        });
      }
    }
  };
  
  const handleSetItemsPerPage = (newItemsPerPage) => {
    if (setItemsPerPage) {
      setItemsPerPage(newItemsPerPage);
    } else {
      setInternalPageSize(newItemsPerPage);
      setInternalCurrentPage(1); 
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set('perPage', newItemsPerPage.toString());
          newParams.set('page', '1');
          return newParams;
        });
      }
    }
  };
  
  const handleSetSearchQuery = (newQuery) => {
    if (setSearchQuery) {
      setSearchQuery(newQuery);
    } else {
      setInternalSearchTerm(newQuery);
      setInternalCurrentPage(1);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set('search', newQuery);
          newParams.set('page', '1');
          return newParams;
        });
      }
    }
  };
  
  const handleSetActiveSubMenu = (newSubMenu) => {
    if (setActiveSubMenu) {
      setActiveSubMenu(newSubMenu);
    } else {
      setInternalActiveSubmenu(newSubMenu);
      setInternalCurrentPage(1); 
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set('category', newSubMenu);
          newParams.set('page', '1');
          return newParams;
        });
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!setPage && searchTerm !== internalSearchTerm) {
      setInternalCurrentPage(1);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isMobile) {
      const styleElement = document.createElement('style');
      styleElement.id = 'dropdown-mobile-fix';
      styleElement.innerHTML = `
        /* General dropdown fixes */
        .dropdown-menu, .select-dropdown, [role="listbox"], 
        ul[role="menu"], .select-options, .react-select__menu {
          position: fixed !important;
          z-index: 9999 !important;
          max-height: 40vh !important;
          overflow-y: auto !important;
          width: auto !important;
          min-width: 200px !important;
          border: 1px solid #e2e8f0 !important;
          background-color: white !important;
          border-radius: 0.375rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          top: auto !important;
        }
        
        /* Specific fix for the Waktu dropdown */
        [data-field="waktu"] .dropdown-container,
        [data-field="waktu"] .dropdown-wrapper,
        [data-field="waktu"] > div {
          position: static !important;
          overflow: visible !important;
        }
        
        /* Fix for the search input in dropdowns */
        .dropdown-search-input,
        input[placeholder="Search..."] {
          width: 100% !important;
          padding: 8px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 0.25rem !important;
          margin-bottom: 4px !important;
        }
        
        /* Fix for dropdown items */
        .dropdown-item,
        .select-option,
        [role="option"] {
          padding: 8px 12px !important;
          cursor: pointer !important;
        }
        
        /* Fix for Pilih Waktu button */
        button[aria-label="Pilih Waktu"],
        button:contains("Pilih Waktu") {
          width: 100% !important;
          text-align: left !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
      `;
      document.head.appendChild(styleElement);
      
      return () => {
        const existingStyle = document.getElementById('dropdown-mobile-fix');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isMobile]);

  // Use theme color for pagination active state
  const paginationActiveColor = `bg-${themeColor}`;

  const filteredData = data.filter((row) => {
    const matchesSearchTerm = Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (activeSubmenu === 'semua' || !hasSubmenu) return matchesSearchTerm;
    
    return matchesSearchTerm && row.type === activeSubmenu;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      handleSetPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleSetPage(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = Number(event.target.value);
    handleSetItemsPerPage(newPageSize);
  };

  const handleSearch = (e) => {
    handleSetSearchQuery(e.target.value);
  };

  const generatePages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage > totalPages - 4) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const isDropdown = (content) => {
    if (!content || typeof content !== 'object') return false;
    
    const isReactElement = React.isValidElement(content);
    if (!isReactElement) return false;
    
    const hasDropdownProps = 
      content.props && (
        content.props.className?.includes('select') || 
        content.props.className?.includes('dropdown') ||
        content.props.className?.includes('Pilih') ||
        content.props.children?.props?.className?.includes('select') ||
        (typeof content.type === 'function' && 
          (content.type.name?.includes('Dropdown') || 
           content.type.name?.includes('Select') || 
           content.type.displayName?.includes('Dropdown') ||
           content.type.displayName?.includes('Select')))
      );
      
    return hasDropdownProps;
  };

  const enhanceDropdownCell = (content, fieldName) => {
    if (!React.isValidElement(content)) return content;
    
    if (isDropdown(content) || fieldName === 'waktu') {
      return React.cloneElement(content, {
        className: `${content.props.className || ''} mobile-enhanced-dropdown`,
        style: { 
          ...(content.props.style || {}),
          position: 'static',
          width: '100%',
          zIndex: 50
        },
        'data-field': fieldName
      });
    }
    
    return content;
  };

  const renderMobileRow = (row, rowIndex, uniqueKey) => (
    <div 
      key={uniqueKey} 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible"
    >
      <div className="divide-y divide-gray-200">
        {headers.map((header, idx) => {
          const cellContent = row[header.key];
          const isDropdownCell = isDropdown(cellContent) || header.key === 'waktu';
          const enhancedContent = enhanceDropdownCell(cellContent, header.key);
          
          return (
            <div 
              key={idx} 
              data-field={header.key}
              className={`
                flex items-center p-3 gap-2
                ${header.key === 'aksi' ? 'justify-end bg-gray-50' : ''}
                ${isDropdownCell ? 'relative dropdown-container' : ''}
              `}
              onClick={(e) => {
                if (isDropdownCell) {
                  e.stopPropagation();
                } else if (onRowClick) {
                  onRowClick(row);
                }
              }}
            >
              {header.key !== 'aksi' && (
                <>
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      {header.label}
                    </span>
                  </div>
                  <div 
                    className={`flex-1 break-words ${isDropdownCell ? 'dropdown-wrapper' : ''}`}
                    style={isDropdownCell ? {position: 'static', minHeight: '40px'} : {}}
                  >
                    <span 
                      className={`text-sm text-gray-900 ${isDropdownCell ? 'block w-full' : ''}`}
                    >
                      {enhancedContent}
                    </span>
                  </div>
                </>
              )}
              {header.key === 'aksi' && (
                <div className="w-full">
                  {enhancedContent}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDesktopTable = () => (
    <div className="relative overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={headerBgColor}>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                style={{ width: header.width || 'auto' }}
                className={`
                  text-sm font-semibold ${headerTextColor} py-3 px-4 
                  ${header.align || "text-left"} 
                  ${index === 0 ? "rounded-tl-lg" : ""}
                  ${index === headers.length - 1 ? "rounded-tr-lg" : ""}
                `}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {paginatedData.map((row, rowIndex) => (
            <tr
              key={row.key || row.id || row.timestamp || rowIndex}
              className={`hover:bg-gray-50 transition-colors
                ${onRowClick ? "cursor-pointer" : "cursor-default"}
              `}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {headers.map((header, cellIndex) => {
                // Determine if this cell should wrap text
                const shouldWrap = header.wrap !== false; // Default to wrapping unless explicitly set to false
                const isDropdownCell = isDropdown(row[header.key]) || header.key === 'waktu';
                
                return (
                  <td
                    key={cellIndex}
                    data-field={header.key}
                    style={{ 
                      width: header.width || 'auto',
                      maxWidth: header.width || 'auto',
                    }}
                    className={`
                      text-sm text-gray-700 py-4 px-4 
                      ${header.align || "text-left"} 
                      ${shouldWrap ? 'whitespace-normal break-words' : 'whitespace-nowrap'}
                      ${isDropdownCell ? 'overflow-visible' : ''}
                    `}
                    onClick={isDropdownCell ? (e) => e.stopPropagation() : undefined}
                  >
                    {enhanceDropdownCell(row[header.key], header.key)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full">
      {/* Search and Page Size Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {hasSearch && (
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.707 19.293l-4.054-4.054A7.948 7.948 0 0016 9.5 8 8 0 108 17.5c1.947 0 3.727-.701 5.239-1.865l4.054 4.054a1 1 0 001.414-1.414zM10 15.5A6.5 6.5 0 1110 2a6.5 6.5 0 010 13.5z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-${themeColor}`}
              />
            </div>
          )}
          {hasFilter && (
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:ring-1 focus:ring-${themeColor} transition-colors`}
                onClick={onFilterClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.553.894l-4 2A1 1 0 017 17v-6.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
              </button>
              {additionalButton}
            </div>
          )}
        </div>
        {hasPagination && (
          <div className="text-gray-700 w-full sm:w-auto flex items-center justify-end gap-2">
            <label htmlFor="pageSize" className="text-sm whitespace-nowrap">
              Tampilkan
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className={`border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-${themeColor}`}
            >
              {[2, 10, 15, 20].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm">entri</span>
          </div>
        )}
      </div>

      {/* Submenu Section */}
      {hasSubmenu && submenuItems.length > 0 && (
        <div className="flex overflow-x-auto space-x-6 border-b border-gray-200 mb-4 pb-1">
          <button
            onClick={() => handleSetActiveSubMenu('semua')}
            className={`pb-3 px-1 text-sm font-medium whitespace-nowrap relative ${
              activeSubmenu === 'semua'
                ? `text-${themeColor} border-b-2 border-${themeColor}`
                : `text-gray-500 hover:text-${themeColor}`
            }`}
          >
            Semua
          </button>
          {submenuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleSetActiveSubMenu(item.value)}
              className={`pb-3 px-1 text-sm font-medium whitespace-nowrap relative ${
                activeSubmenu === item.value
                  ? `text-${themeColor} border-b-2 border-${themeColor}`
                  : `text-gray-500 hover:text-${themeColor}`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Table/Cards Section */}
      <div className="w-full">
        {isMobile ? (
          <div className="space-y-4">
            {paginatedData.map((row, idx) => renderMobileRow(row, idx, row.key || row.id || row.timestamp || idx))}
          </div>
        ) : (
          renderDesktopTable()
        )}
      </div>

      {/* Pagination Section */}
      {hasPagination && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="text-sm text-gray-700 w-full sm:w-auto text-center sm:text-left">
            Menampilkan {((currentPage - 1) * pageSize) + 1} sampai{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} dari{' '}
            {filteredData.length} entri
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              type="button"
              disabled={currentPage === 1}
              className={`
                py-1 px-3 rounded-md text-sm transition-colors
                ${currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }
              `}
            >
              Previous
            </button>
            <div className="flex gap-1 flex-wrap justify-center">
              {generatePages().map((page, index) => (
                <button
                  key={index}
                  onClick={() => page !== "..." && handlePageChange(page)}
                  disabled={page === "..."}
                  type="button"
                  className={`
                    py-1 px-3 rounded-md text-sm transition-colors
                    ${page === currentPage
                      ? `${paginationActiveColor} text-white`
                      : page === "..."
                      ? "bg-white text-gray-700 cursor-default"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }
                  `}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              type="button"
              className={`
                py-1 px-3 rounded-md text-sm transition-colors
                ${currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }
              `}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;