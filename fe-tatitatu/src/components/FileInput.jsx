import React, { useState } from "react";

const FileInput = ({ label, onFileChange }) => {
  const [preview, setPreview] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-purple-700 rounded-lg p-6 text-purple-700 cursor-pointer hover:bg-purple-50 w-1/4">
      <label className="flex flex-col items-center justify-center cursor-pointer">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 object-cover mb-2 rounded-md"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mb-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M5 4a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3H5zm8 9v3a1 1 0 11-2 0v-3H8a1 1 0 010-2h3V8a1 1 0 012 0v3h3a1 1 0 010 2h-3z" />
          </svg>
        )}
        <span className="text-center text-sm font-medium">{label}</span>
      </label>
    </div>
  );
};

const FileInput2 = () => {
  const handleFileChange = (file) => {
    console.log("File uploaded: ", file);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Upload File</h1>
      <FileInput label="Masukkan Foto Barang" onFileChange={handleFileChange} />
    </div>
  );
};

export default FileInput2;
