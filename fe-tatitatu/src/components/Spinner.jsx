import React from "react";

const Spinner = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-solid rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-4 border-primary border-solid rounded-full animate-[spin_0.6s_linear_infinite]"></div>
      </div>
    </div>
  );
};

export default Spinner;