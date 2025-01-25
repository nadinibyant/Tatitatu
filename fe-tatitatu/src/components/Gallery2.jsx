import React, { useState, useEffect } from "react";

const GalleryItem = ({ item, onSelect, selectionCount }) => {
  const handleSelect = () => {
      const newCount = (selectionCount || 0) + 1;
      onSelect(item, newCount);
  };

  return (
      <div
          onClick={handleSelect}
          className={`relative border rounded-md p-4 cursor-pointer hover:shadow-md ${
              selectionCount > 0 ? "border-primary" : "border-gray-300"
          }`}
      >
          <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover rounded-md mb-2"
          />
          {selectionCount > 0 && (
              <span className="absolute top-2 right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                  {selectionCount}
              </span>
          )}
          <p className="text-sm text-gray-500">{item.code}</p>
          <h3 className="text-lg font-bold mb-1">{item.name}</h3>
          <p className="text-sm text-gray-500">Rp{item.price.toLocaleString()}</p>
      </div>
  );
};

const Gallery2 = ({ items, onSelect, selectedItems }) => {
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
              <GalleryItem
                  key={item.id}
                  item={item}
                  onSelect={onSelect}
                  selectionCount={
                      selectedItems.find((selected) => selected.id === item.id)?.count || 0
                  }
              />
          ))}
      </div>
  );
};

export default Gallery2;
