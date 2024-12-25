import React, { useState } from "react";

const Gallery = ({ items, onSearch, filterFields = [], pageSizeOptions = [4, 8, 12, 16], onItemClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const filteredItems = items.filter((item) => {
    const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      return String(item[key]).toLowerCase().includes(filters[key].toLowerCase());
    });

    return matchesSearchTerm && matchesFilters;
  });

  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setIsFilterModalOpen(false);
  };

  return (
    <div className="p-4">
      {/* Search and Filter */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 items-center w-2/3">
          <input
            type="text"
            placeholder="Cari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.553.894l-4 2A1 1 0 017 17v-6.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </button>
        </div>
        <div>
          <label htmlFor="pageSize" className="mr-2">Page</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md py-1 px-2"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedItems.map((item, index) => (
          <div
            key={index}
            className="border rounded-md p-4 cursor-pointer hover:shadow-md"
            onClick={() => onItemClick && onItemClick(item)}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover rounded-md mb-2"
            />
            <p className="text-sm text-gray-500">{item.code}</p>
            <h3 className="text-lg font-bold mb-1">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.price}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={`py-1 px-3 rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`py-1 px-3 rounded-md ${
              page === currentPage
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={`py-1 px-3 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyFilters();
              }}
            >
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


export default Gallery;
