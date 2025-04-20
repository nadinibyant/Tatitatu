import React, { useState, useRef, useEffect } from "react";

const FileInput = ({
  label,
  onFileChange,
  width = "w-full sm:w-2/3 md:w-1/6", 
  defaultValue,
  allowCamera = false, 
  cameraOnly = false,
  alignment = "center", 
  className = "", 
}) => {
  const [preview, setPreview] = useState(defaultValue || null);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); 
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const alignmentClass = 
    alignment === "start" ? "items-start justify-start" : 
    alignment === "end" ? "items-end justify-end" : 
    "items-center justify-center";

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isAdminGudang = userData?.role === "admingudang";
  const isHeadGudang = userData?.role === "headgudang";
  const isOwner = userData?.role === "owner";
  const isManajer = userData?.role === "manajer";
  const isAdmin = userData?.role === "admin";
  const isFinance = userData?.role === "finance";
  const isKaryawanProduksi = userData?.role === "karyawanproduksi";

  const themeColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi)
    ? "coklatTua"
    : (isManajer || isOwner || isFinance)
      ? "biruTua"
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

  const svgColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi)
    ? "#71503D"
    : (isManajer || isOwner || isFinance)
      ? "#023F80"
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "#2D2D2D"
        : "#7B0C42";

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingCamera(true);
    
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints = { 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      
      let errorMessage = "Tidak dapat mengakses kamera.";
      
      if (err.name === 'NotAllowedError') {
        errorMessage = "Izin akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "Tidak ditemukan kamera pada perangkat Anda.";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Kamera sedang digunakan oleh aplikasi lain.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = "Kamera tidak mendukung resolusi yang diminta.";
      }
      
      setCameraError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const toggleCamera = async () => {
    setFacingMode(prevMode => prevMode === "environment" ? "user" : "environment");
    
    if (showCamera) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setTimeout(() => {
        startCamera();
      }, 300); 
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    const canvas = document.createElement("canvas");
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext("2d");
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        
        const previewUrl = URL.createObjectURL(blob);
        setPreview(previewUrl);
        
        onFileChange(file);
        
        stopCamera();
      }
    }, "image/jpeg", 0.85); 
  };

  useEffect(() => {
    if (cameraOnly && !preview && !showCamera) {
      startCamera();
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOnly, preview, showCamera]);

  const renderPlaceholder = () => (
    <div className="flex flex-col items-center justify-center">
      {cameraOnly ? (
        <div className="text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 mx-auto mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke={svgColor}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          <span className="text-center text-sm font-medium">{label}</span>
        </div>
      ) : (
        <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M36.8346 19C36.8346 18.5138 36.6415 18.0474 36.2977 17.7036C35.9538 17.3598 35.4875 17.1667 35.0013 17.1667C34.5151 17.1667 34.0488 17.3598 33.7049 17.7036C33.3611 18.0474 33.168 18.5138 33.168 19H36.8346ZM18.5013 4.33332C18.9875 4.33332 19.4538 4.14017 19.7977 3.79635C20.1415 3.45254 20.3346 2.98622 20.3346 2.49999C20.3346 2.01376 20.1415 1.54744 19.7977 1.20363C19.4538 0.859811 18.9875 0.666656 18.5013 0.666656V4.33332ZM32.2513 33.6667H4.7513V37.3333H32.2513V33.6667ZM3.83464 32.75V5.24999H0.167969V32.75H3.83464ZM33.168 19V32.75H36.8346V19H33.168ZM4.7513 4.33332H18.5013V0.666656H4.7513V4.33332ZM4.7513 33.6667C4.50819 33.6667 4.27503 33.5701 4.10312 33.3982C3.93121 33.2263 3.83464 32.9931 3.83464 32.75H0.167969C0.167969 33.9656 0.650854 35.1314 1.5104 35.9909C2.36994 36.8504 3.53573 37.3333 4.7513 37.3333V33.6667ZM32.2513 37.3333C33.4669 37.3333 34.6327 36.8504 35.4922 35.9909C36.3517 35.1314 36.8346 33.9656 36.8346 32.75H33.168C33.168 32.9931 33.0714 33.2263 32.8995 33.3982C32.7276 33.5701 32.4944 33.6667 32.2513 33.6667V37.3333ZM3.83464 5.24999C3.83464 5.00687 3.93121 4.77372 4.10312 4.60181C4.27503 4.4299 4.50819 4.33332 4.7513 4.33332V0.666656C3.53573 0.666656 2.36994 1.14954 1.5104 2.00908C0.650854 2.86863 0.167969 4.03441 0.167969 5.24999H3.83464Z" fill={svgColor}/>
          <path d="M2 29.0833L11.8019 20.0982C12.1323 19.7954 12.5621 19.6241 13.0102 19.6166C13.4583 19.6092 13.8936 19.7662 14.2338 20.0578L25.8333 30M22.1667 25.4167L26.5419 21.0414C26.854 20.7291 27.2683 20.54 27.7086 20.5086C28.149 20.4773 28.5859 20.606 28.939 20.8709L35 25.4167M24 8H35M29.5 2.5V13.5" stroke={svgColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );

  const renderCameraToggleButton = () => (
    <button
      type="button"
      onClick={toggleCamera}
      className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-3 rounded-full z-10"
      title={facingMode === "environment" ? "Beralih ke Kamera Depan" : "Beralih ke Kamera Belakang"}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  );

  const renderCameraLoading = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20 rounded-md">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
    </div>
  );

  if (cameraOnly) {
    return (
      <div className={`flex flex-col ${alignmentClass} border-2 border-dashed border-${themeColor} rounded-lg p-4 text-${themeColor} ${width} ${className}`}>
        {showCamera ? (
          <div className="flex flex-col items-center w-full relative">
            <div className="relative w-full rounded-md overflow-hidden aspect-video mb-3">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                playsInline
              />
              {isLoadingCamera && renderCameraLoading()}
              {renderCameraToggleButton()}
            </div>
            <div className="flex flex-wrap justify-center gap-2 w-full">
              <button
                type="button"
                onClick={capturePhoto}
                className={`bg-${themeColor} text-white px-4 py-2 rounded-md text-sm font-medium flex-grow sm:flex-grow-0`}
              >
                Ambil Foto
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium flex-grow sm:flex-grow-0"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 max-w-full object-contain mb-2 rounded-md"
              />
            ) : (
              cameraError ? (
                <div className="text-center text-red-500 p-4">
                  <p className="mb-2">{cameraError}</p>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-10 w-10 mx-auto text-red-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
              ) : (
                renderPlaceholder()
              )
            )}
            
            {/* Camera button (show if no preview or if there's a camera error) */}
            {(!preview || cameraError) && (
              <button
                type="button"
                onClick={startCamera}
                className={`mt-3 bg-${themeColor} text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center w-full sm:w-auto`}
                disabled={isLoadingCamera}
              >
                {isLoadingCamera ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memuat Kamera...
                  </span>
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                    {cameraError ? "Coba Lagi" : "Ambil Foto"}
                  </>
                )}
              </button>
            )}
            
            {/* Reset/New photo buttons when there's a preview */}
            {preview && (
              <div className="flex flex-wrap justify-center gap-2 mt-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    onFileChange(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium flex-grow sm:flex-grow-0"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className={`bg-${themeColor} text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center flex-grow sm:flex-grow-0`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                    />
                  </svg>
                  Ambil Foto Baru
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Standard mode (file upload with optional camera)
  return (
    <div className={`flex flex-col ${alignmentClass} border-2 border-dashed border-${themeColor} rounded-lg p-4 text-${themeColor} cursor-pointer hover:bg-${themeColor === "primary" ? "purple" : "amber"}-50 ${width} ${className}`}>
      {showCamera ? (
        <div className="flex flex-col items-center w-full relative">
          <div className="relative w-full rounded-md overflow-hidden aspect-video mb-3">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
            />
            {isLoadingCamera && renderCameraLoading()}
            {renderCameraToggleButton()}
          </div>
          <div className="flex flex-wrap justify-center gap-2 w-full">
            <button
              type="button"
              onClick={capturePhoto}
              className={`bg-${themeColor} text-white px-4 py-2 rounded-md text-sm font-medium flex-grow sm:flex-grow-0`}
            >
              Ambil Foto
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium flex-grow sm:flex-grow-0"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center cursor-pointer w-full">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 max-w-full object-contain mb-2 rounded-md"
            />
          ) : (
            cameraError ? (
              <div className="text-center text-red-500 p-4">
                <p className="mb-2">{cameraError}</p>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 mx-auto text-red-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
            ) : (
              renderPlaceholder()
            )
          )}
          
          <span className="text-center text-sm font-medium pt-5">{label}</span>
          
          <div className="flex flex-wrap justify-center gap-2 mt-3 w-full">
            {allowCamera && !preview && (
              <button
                type="button"
                onClick={startCamera}
                className={`bg-${themeColor} text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center flex-grow sm:flex-grow-0`}
                disabled={isLoadingCamera}
              >
                {isLoadingCamera ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memuat Kamera...
                  </span>
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                    Gunakan Kamera
                  </>
                )}
              </button>
            )}
            
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  onFileChange(null);
                }}
                className={`bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto`}
              >
                Reset
              </button>
            )}
          </div>
        </label>
      )}
    </div>
  );
};

export default FileInput;