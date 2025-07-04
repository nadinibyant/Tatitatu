import React from 'react';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    itemsPerPage, 
    totalItems,
    themeColor = "primary" 
}) => {
    console.log('Pagination Debug:', {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        themeColor,
        shouldShow: totalPages > 1
    });

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            {/* Items info */}
            <div className="text-sm text-gray-700">
                Menampilkan {startItem} sampai {endItem} dari {totalItems} item
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : `text-${themeColor} hover:bg-${themeColor} hover:text-white border border-${themeColor}`
                    }`}
                >
                    Sebelumnya
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                            disabled={page === '...'}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                                page === '...'
                                    ? 'text-gray-400 cursor-default'
                                    : page === currentPage
                                    ? `bg-${themeColor} text-white`
                                    : `text-gray-700 hover:bg-gray-100 border border-gray-300`
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : `text-${themeColor} hover:bg-${themeColor} hover:text-white border border-${themeColor}`
                    }`}
                >
                    Selanjutnya
                </button>
            </div>
        </div>
    );
};

export default Pagination; 