import React from "react";

const Button = ({
  type = "button", 
  label, 
  icon, 
  onClick, 
  bgColor = "", 
  hoverColor = "", 
  textColor = "text-white", 
}) => {
  
  const userData = JSON.parse(localStorage.getItem('userData'))
  const role = userData?.role
  const ringColor = (role === "admingudang" || role === "headgudang") 
    ? "focus:ring-1 focus:ring-coklatTua focus:outline-none" 
    : (role === 'manajer' || role === 'owner' || role === 'finance')
    ? "focus:ring-1 focus:ring-biruTua focus:outline-none" 
    : (role === 'admin' && userData?.userId !== 1 || userData?.userId !== 1)
    ? "focus:ring-1 focus:ring-hitam focus:outline-none" 
    : "focus:ring-1 focus:ring-primary focus:outline-none"; 
  
  return (
    <button
      className={`flex items-center text-sm justify-center ${bgColor} ${textColor} py-2 px-${label ? '4' : '2'} rounded-lg ${hoverColor} ${ringColor} transition duration-150`}
      onClick={onClick}
      type={type}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {label && <span className="px-3">{label}</span>}
    </button>
  );
};

export default Button;