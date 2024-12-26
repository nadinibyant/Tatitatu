import React from "react";

const Button = ({type = "button", label, icon, onClick, bgColor = "bg-purple-700", hoverColor = "hover:bg-purple-800", textColor = "text-white" }) => {
  return (
    <button
      className={`flex items-center text-sm justify-center ${bgColor} ${textColor} py-2 px-${label ? '4' : '2'} rounded-lg ${hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
      onClick={onClick}
      type={type}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {label && <span className="px-3">{label}</span>}
    </button>
  );
};

export default Button;
