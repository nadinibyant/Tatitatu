import React, { useState } from "react";

const Table = ({
  bg_header = 'bg-pink',
  text_header = 'text-primary',
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
  additionalButton
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSubmenu, setActiveSubmenu] = useState(defaultSubmenu);

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
          {hasFilter && (
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary/50 transition-colors"
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
          <div className="text-gray-700 w-full sm:w-auto flex items-center justify-end">
            <label htmlFor="pageSize" className="text-sm mr-2">
              Page
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {[5, 10, 15, 20].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Submenu Section */}
      {hasSubmenu && submenuItems.length > 0 && (
        <div className="flex space-x-6 border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveSubmenu('semua')}
            className={`pb-4 px-1 text-sm font-medium relative ${
              activeSubmenu === 'semua'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-primary'
            }`}
          >
            Semua
          </button>
          {submenuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveSubmenu(item.value)}
              className={`pb-4 px-1 text-sm font-medium relative ${
                activeSubmenu === item.value
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Table Section */}
      <div className="relative overflow-x-auto sm:rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden max-h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${bg_header}`}>
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      style={{ width: header.width || 'auto' }}
                      className={`
                        text-sm font-semibold ${text_header} py-3 px-4 
                        ${header.align || "text-left"} whitespace-nowrap
                        ${index === 0 ? "sm:rounded-tl-lg" : ""}
                        ${index === headers.length - 1 ? "sm:rounded-tr-lg" : ""}
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
                    key={rowIndex}
                    className={`hover:bg-gray-50 transition-colors
                      ${onRowClick ? "cursor-pointer" : "cursor-default"}
                    `}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {headers.map((header, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{ width: header.width || 'auto' }}
                        className={`
                          text-sm text-gray-700 py-4 px-4 
                          ${header.align || "text-left"} 
                          whitespace-nowrap
                        `}
                      >
                        {row[header.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination Section */}
      {hasPagination && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of{' '}
            {filteredData.length} entries
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
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
                  className={`
                    py-1 px-3 rounded-md text-sm transition-colors
                    ${page === currentPage
                      ? "bg-primary text-white"
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