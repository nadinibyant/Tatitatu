import React, { useState } from "react";

const Table = ({ data, headers, onRowClick, hasFilter = false, filterFields = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10); // Jumlah data per halaman
  const [currentPage, setCurrentPage] = useState(1); // Halaman saat ini
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setIsFilterModalOpen(false);
    // You can add logic here to filter data based on the `filters` state
  };

  // Filter data berdasarkan pencarian dan filterFields
  const filteredData = data.filter((row) => {
    const matchesSearchTerm = Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesFilters = Object.keys(filters).every((key) => {
      if (!filters[key]) return true; // Skip empty filters
      return String(row[key]).toLowerCase().includes(filters[key].toLowerCase());
    });

    return matchesSearchTerm && matchesFilters;
  });

  // Hitung total halaman
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Filter data untuk halaman saat ini
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1); // Reset ke halaman pertama
  };

  const generatePages = () => {
    const pages = [];
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 5) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage > totalPages - 5) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="overflow-x-auto w-full">
      {/* Search and Page Size Input */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
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
              className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none"
            />
          </div>
          {hasFilter && (
            <button
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500"
              onClick={() => setIsFilterModalOpen(true)}
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
          )}
        </div>
        <div className="text-gray-700">
          <label htmlFor="pageSize" className="mr-2">
            Page
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="border border-gray-300 rounded-md py-1 px-2"
          >
            {[5, 10, 15, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel */}
      <table className="min-w-full border-collapse">
        {/* Header */}
        <thead className="bg-pink-100 text-left rounded-t-lg">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`text-sm font-medium text-gray-700 py-3 px-4 ${header.align || "text-left"} ${
                  index === 0 ? "rounded-tl-lg" : index === headers.length - 1 ? "rounded-tr-lg" : ""
                }`}
                style={{
                  borderBottom: "1px solid #e5e7eb", // Custom border hanya di header
                }}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {paginatedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : "cursor-default"}`}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ borderBottom: "1px solid #e5e7eb" }}
            >
              {headers.map((header, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`text-sm text-gray-700 py-4 px-4 ${header.align || "text-left"}`}
                >
                  {row[header.key]}
                </td>
              ))}
              {/* Aksi Cell */}
              {row.aksi && (
                <td className="text-right py-4 px-4">
                  <button className="text-purple-700 hover:text-purple-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6 10a2 2 0 114 0 2 2 0 11-4 0zM4 10a2 2 0 11-4 0 2 2 0 114 0z" />
                    </svg>
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end items-center space-x-2 mt-4">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={`py-1 px-3 rounded-md ${
            currentPage === 1 ? "bg-gray-200 text-gray-400" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        {/* Page Numbers */}
        {generatePages().map((page, index) => (
          <button
            key={index}
            onClick={() => page !== "..." && handlePageChange(page)}
            className={`py-1 px-3 rounded-md ${
              page === currentPage
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={`py-1 px-3 rounded-md ${
            currentPage === totalPages ? "bg-gray-200 text-gray-400" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-6 w-1/3">
            <h2 className="text-lg font-bold mb-4">Filter Data</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              applyFilters();
            }}>
              {filterFields.map((field, index) => (
                <div className="mb-4" key={index}>
                  <label className="block text-gray-700 font-medium mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type || "text"}
                    placeholder={field.placeholder || ""}
                    value={filters[field.key] || ""}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                >
                  Terapkan
                </button>
                <button
                  className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  Tutup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
