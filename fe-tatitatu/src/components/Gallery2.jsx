import React, { useState } from "react";

const GalleryItem = ({ item, onSelect, selectionCount, showStockAlert, enableStockValidation }) => {
  const userData = JSON.parse(localStorage.getItem('userData'))
  const role = userData?.role
  const isAdminGudang = role === 'admingudang';
  const isHeadGudang = role === 'headgudang';
  const isKasirToko = role === 'kasirtoko';
  const isManajer = role === 'manajer';
  const isOwner = role === 'owner';
  const isFinance = role === 'finance';
  const isAdmin = role === 'admin';
  const isKaryawanProduksi = role === 'karyawanproduksi';
  const toko_id = userData?.tokoId;

  const themeColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi || toko_id === 1) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : ((isAdmin && userData?.userId !== 1 && userData?.userId !== 2) || 
         (isKasirToko && toko_id !== undefined && toko_id !== null && toko_id !== 1 && toko_id !== 2))
        ? "hitam"
        : "primary";
  
  const handleSelect = () => {
    const newCount = (selectionCount || 0) + 1;
    
    if (enableStockValidation && item.stock !== undefined && newCount > item.stock) {
      showStockAlert(item.name);
      return;
    }
    
    onSelect(item, newCount);
  };

  return (
    <div
      onClick={handleSelect}
      className={`relative border rounded-md p-4 cursor-pointer hover:shadow-md ${
        selectionCount > 0 ? `border-${themeColor}` : "border-gray-300"
      }`}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-48 object-cover rounded-md mb-2"
      />
      {selectionCount > 0 && (
        <span className={`absolute top-2 right-2 bg-${themeColor} text-white rounded-full w-6 h-6 flex items-center justify-center`}>
          {selectionCount}
        </span>
      )}
      <p className="text-sm text-gray-500">{item.code}</p>
      <h3 className="text-lg font-bold mb-1">{item.name}</h3>
      <p className="text-sm text-gray-500">
        Rp{(item.price || 0).toLocaleString()}
      </p>
      
      {enableStockValidation && item.stock !== undefined && (
        <p className={`text-sm ${item.stock === 0 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
          Stok: {item.stock} {item.stock === 0 && '(Habis)'}
        </p>
      )}
      
      {enableStockValidation && item.stock !== undefined && item.stock > 0 && item.stock <= 5 && (
        <p className="text-xs text-amber-600 mt-1">Stok menipis!</p>
      )}
      
      {enableStockValidation && item.stock !== undefined && item.stock === 0 && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-70 rounded-md flex items-center justify-center">
          <p className="text-red-600 font-bold text-lg">Stok Habis</p>
        </div>
      )}
    </div>
  );
};

const Gallery2 = ({ 
  items, 
  onSelect, 
  selectedItems, 
  role = "",
  enableStockValidation = false 
}) => {
  const [stockAlert, setStockAlert] = useState({ show: false, itemName: '' });
  
  const showStockAlert = (itemName) => {
    setStockAlert({ show: true, itemName });
    setTimeout(() => {
      setStockAlert({ show: false, itemName: '' });
    }, 3000); 
  };
  
  return (
    <div className="relative">
      {enableStockValidation && stockAlert.show && (
        <div className="sticky top-0 left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10 mb-4 shadow-md flex items-center justify-between">
          <div>
            <strong className="font-bold">Perhatian!</strong>
            <span className="block sm:inline"> Stok "{stockAlert.itemName}" tidak mencukupi.</span>
          </div>
          <button 
            className="ml-4"
            onClick={() => setStockAlert({ show: false, itemName: '' })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {items.map((item) => (
          <GalleryItem
            key={item.id}
            item={item}
            onSelect={onSelect}
            selectionCount={
              selectedItems.find((selected) => selected.id === item.id)?.count || 0
            }
            role={role}
            showStockAlert={showStockAlert}
            enableStockValidation={enableStockValidation}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery2;