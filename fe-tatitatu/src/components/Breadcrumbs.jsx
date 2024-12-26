import React from "react";

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index !== items.length - 1 ? (
            <a
              href={item.href}
              className="text-gray-500 hover:text-gray-700"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-primary font-bold">{item.label}</span>
          )}
          {index !== items.length - 1 && <span className="text-gray-400">&gt;</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
