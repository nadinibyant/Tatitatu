import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import Table from "../../../components/Table";
import Input from "../../../components/Input";
import FileInput from "../../../components/FileInput"; 
import AlertSuccess from "../../../components/AlertSuccess";
import AlertError from "../../../components/AlertError";
import Spinner from "../../../components/Spinner";
import api from "../../../utils/api";

export default function Absensi() {
    const userData = JSON.parse(localStorage.getItem('userData'))
    const toko_id = userData?.tokoId
    const karyawan_id = userData.userId
    
    const themeColor = !toko_id 
        ? "biruTua" 
        : toko_id === 1 
            ? "coklatTua" 
            : toko_id === 2 
                ? "primary" 
                : "hitam";
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        image: null,
        karyawan_id: karyawan_id, 
        tanggal: '',
        jam_masuk: '',
        jam_keluar: '',
        total_menit: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalSucc, setModalSucc] = useState(false);
    const [data, setData] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const navigate = useNavigate();
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
    const [geoError, setGeoError] = useState(null);
    
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState({
        type: '', 
        foto: '',
        lokasi: '',
        jam: '',
        coordinates: { lat: 0, lng: 0 }
      });

    const getCurrentDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }
    
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    let errorMessage;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'User denied the request for geolocation';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'The request to get user location timed out';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred';
                    }
                    reject(new Error(errorMessage));
                }
            );
        });
    };

    // Table Configuration
    const headers = [
        { label: "No", key: "nomor", align: "text-center" },
        { label: "Tanggal", key: "tanggal", align: "text-left" },
        { label: "Jam Masuk", key: "jam_masuk", align: "text-left" },
        { label: "Jam Keluar", key: "jam_keluar", align: "text-left" },
        { label: "Total Menit", key: "total_menit", align: "text-left" },
    ];

    const handleTimeChange = (field, value) => {
        const updatedFormData = { ...formData, [field]: value };
        const totalMenit = calculateTotalMinutes(
            field === 'jam_masuk' ? value : formData.jam_masuk,
            field === 'jam_keluar' ? value : formData.jam_keluar
        );
        
        setFormData({
            ...updatedFormData,
            total_menit: totalMenit
        });
    };

    // Utility Functions
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const calculateTotalMinutes = (jamMasuk, jamKeluar) => {
        if (!jamMasuk || !jamKeluar) return 0;
        
        const [masukHour, masukMinute] = jamMasuk.split(':').map(Number);
        const [keluarHour, keluarMinute] = jamKeluar.split(':').map(Number);
        
        let masukInMinutes = (masukHour * 60) + masukMinute;
        let keluarInMinutes = (keluarHour * 60) + keluarMinute;
        
        if (keluarInMinutes < masukInMinutes) {
            keluarInMinutes += 1440; 
        }
        
        return keluarInMinutes - masukInMinutes;
    };

    // Effects
    useEffect(() => {
        if (isInitialLoad) {
            fetchData();
            setIsInitialLoad(false);
        }
    }, [isInitialLoad]);

    // Handler for opening detail modal
    const handleOpenDetailModal = (type, data) => {
        const coordinates = extractCoordinates(data.lokasi);
        setDetailData({
          type,
          foto: data.foto,
          lokasi: data.lokasi,
          jam: data.jam,
          coordinates: coordinates
        });
        setShowDetailModal(true);
      };

    // API Functions
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/absensi-karyawan?karyawanId=${karyawan_id}`);
            
            if (response.data.success) {
                // Sort data by date in descending order to ensure latest record is first
                const sortedData = [...response.data.data].sort((a, b) => {
                    return new Date(b.tanggal) - new Date(a.tanggal);
                });
                
                const formattedData = sortedData.map((item, index) => {
                    const masuk = item.jam_masuk || { jam: '-', foto: null, lokasi: null };
                    const keluar = item.jam_keluar || { jam: '-', foto: null, lokasi: null };
                    
                    // Calculate total minutes
                    let totalMenit = 0;
                    if (masuk.jam !== '-' && keluar.jam !== '-') {
                        totalMenit = calculateTotalMinutes(masuk.jam, keluar.jam);
                    }
                    
                    return {
                        nomor: index + 1,
                        tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }),
                        // Create clickable jam masuk component
                        jam_masuk: masuk.jam !== '-' ? (
                            <button 
                                className={`text-${themeColor} hover:underline flex items-center`}
                                onClick={() => handleOpenDetailModal('masuk', masuk)}
                            >
                                {masuk.jam}
                                <svg 
                                    className="w-4 h-4 ml-1" 
                                    fill="currentColor" 
                                    viewBox="0 0 24 24" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12 6C7.6 6 4 8.1 4 10.8V14.4C4 17.1 7.6 19.2 12 19.2C16.4 19.2 20 17.1 20 14.4V10.8C20 8.1 16.4 6 12 6Z" strokeWidth="2" stroke="currentColor" fill="none"/>
                                    <path d="M12 15.6C14.2091 15.6 16 14.5255 16 13.2C16 11.8745 14.2091 10.8 12 10.8C9.79086 10.8 8 11.8745 8 13.2C8 14.5255 9.79086 15.6 12 15.6Z" strokeWidth="2" stroke="currentColor" fill="none"/>
                                </svg>
                            </button>
                        ) : '-',
                        // Create clickable jam keluar component
                        jam_keluar: keluar.jam !== '-' ? (
                            <button 
                                className={`text-${themeColor} hover:underline flex items-center`}
                                onClick={() => handleOpenDetailModal('keluar', keluar)}
                            >
                                {keluar.jam}
                                <svg 
                                    className="w-4 h-4 ml-1" 
                                    fill="currentColor" 
                                    viewBox="0 0 24 24" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12 6C7.6 6 4 8.1 4 10.8V14.4C4 17.1 7.6 19.2 12 19.2C16.4 19.2 20 17.1 20 14.4V10.8C20 8.1 16.4 6 12 6Z" strokeWidth="2" stroke="currentColor" fill="none"/>
                                    <path d="M12 15.6C14.2091 15.6 16 14.5255 16 13.2C16 11.8745 14.2091 10.8 12 10.8C9.79086 10.8 8 11.8745 8 13.2C8 14.5255 9.79086 15.6 12 15.6Z" strokeWidth="2" stroke="currentColor" fill="none"/>
                                </svg>
                            </button>
                        ) : '-',
                        total_menit: totalMenit ? `${formatNumber(totalMenit)} Menit` : '-',
                        // Store raw data for internal use
                        raw: {
                            masuk,
                            keluar,
                            tanggal: item.tanggal
                        }
                    };
                });
                
                setData(formattedData);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        const currentDate = getCurrentDate();
        const currentTime = getCurrentTime();
        
        const allAttendances = [...data].sort((a, b) => {
            const dateA = new Date(a.raw.tanggal + ' ' + a.raw.masuk.jam);
            const dateB = new Date(b.raw.tanggal + ' ' + b.raw.masuk.jam);
            return dateB - dateA; 
        });
        
        const unfinishedAttendance = allAttendances.find(item => 
            item.raw.masuk && 
            item.raw.masuk.jam !== '-' && 
            (!item.raw.keluar || item.raw.keluar.jam === '-')
        );
        
        let newFormData = {
            image: null,
            karyawan_id: karyawan_id,
            tanggal: currentDate,
            jam_masuk: currentTime,
            jam_keluar: '',
            total_menit: '0',
            showJamKeluar: false
        };
        
        if (unfinishedAttendance) {
            const totalMenit = calculateTotalMinutes(
                unfinishedAttendance.raw.masuk.jam, 
                currentTime
            );
            
            newFormData = {
                ...newFormData,
                jam_masuk: unfinishedAttendance.raw.masuk.jam,
                jam_keluar: currentTime,
                total_menit: totalMenit,
                showJamKeluar: true,
                tanggal: unfinishedAttendance.raw.tanggal 
            };
            
            console.log('Clock-out mode:', {
                originalDate: unfinishedAttendance.raw.tanggal,
                clockIn: unfinishedAttendance.raw.masuk.jam,
                clockOut: currentTime,
                totalMinutes: totalMenit
            });
        } else {
            console.log('Clock-in mode - new attendance');
        }
        
        setFormData(newFormData);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setError(null);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
    };

    const handleAcc = () => {
        setModalSucc(false);
        fetchData();
    };

    const validateForm = () => {
        const errors = [];
        
        if (!formData.image) {
            errors.push('Foto harus diupload');
        }
        
        if (!formData.tanggal) {
            errors.push('Tanggal harus diisi');
        }
        
        if (!formData.jam_masuk) {
            errors.push('Jam masuk harus diisi');
        }
        
        if (formData.showJamKeluar && !formData.jam_keluar) {
            errors.push('Jam keluar harus diisi');
        }

        if (formData.image && !['image/jpeg', 'image/png', 'image/jpg'].includes(formData.image.type)) {
            errors.push('File harus berupa gambar (JPG, JPEG, atau PNG)');
        }

        if (formData.image && formData.image.size > 5 * 1024 * 1024) {
            errors.push('Ukuran file tidak boleh lebih dari 5MB');
        }

        return errors;
    };

    console.log(formData)

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        try {
            setIsLoading(true);
            let currentLocation;
            try {
                currentLocation = await getCurrentLocation();
            } catch (geoErr) {
                setGeoError(geoErr.message);
                throw new Error(`Gagal mendapatkan lokasi: ${geoErr.message}. Mohon izinkan akses lokasi.`);
            }
            const totalMenit = formData.showJamKeluar ? 
                calculateTotalMinutes(formData.jam_masuk, formData.jam_keluar) : 0;
            
            const submitData = new FormData();
            submitData.append('image', formData.image);
            submitData.append('karyawan_id', formData.karyawan_id);
            submitData.append('tanggal', formData.tanggal);
            submitData.append('jam_masuk', formData.jam_masuk);
            
            if (formData.showJamKeluar) {
                submitData.append('jam_keluar', formData.jam_keluar);
                submitData.append('total_menit', totalMenit.toString());
            } else {
                submitData.append('jam_keluar', '');
                submitData.append('total_menit', 0);
            }
            
            if (currentLocation && currentLocation.lat && currentLocation.lng) {
                submitData.append('lat', currentLocation.lat);
                submitData.append('lng', currentLocation.lng);
                setCoordinates(currentLocation);
            } else {
                submitData.append('lat', '0');
                submitData.append('lng', '0');
            }

            console.log(submitData)

            const response = await api.post('/absensi-karyawan', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200 || response.status === 201) {
                setModalSucc(true);
                handleClose();
                fetchData();
            }

        } catch (error) {
            console.error('Error submitting data:', error);
            setError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
        } finally {
            setIsLoading(false);
        }
    };

    const extractCoordinates = (url) => {
        try {
          const regex = /q=([^&]+)/;
          const match = url.match(regex);
          if (match && match[1]) {
            const coords = match[1].split(',');
            if (coords.length === 2) {
              return {
                lat: parseFloat(coords[0]),
                lng: parseFloat(coords[1])
              };
            }
          }
          return { lat: 0, lng: 0 };
        } catch (error) {
          console.error('Error extracting coordinates:', error);
          return { lat: 0, lng: 0 };
        }
      };

      const getMapEmbedUrl = (lat, lng) => {
        return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
      };

    return (
        <LayoutWithNav>
            <div className="p-3 sm:p-5">
                {/* Header Section - Responsif */}
                <section className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 mb-4">
                    <div className="w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0">
                        <p className={`text-${themeColor} text-base font-bold`}>Daftar Absensi</p>
                    </div>

                    <div className="w-full sm:w-auto">
                        <Button
                            label="Tambah"
                            icon={
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 13 13"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z"
                                        fill="white"
                                    />
                                </svg>
                            }
                            bgColor={`bg-${themeColor}`}
                            hoverColor={`hover:bg-opacity-90 hover:border hover:border-${themeColor} hover:text-white`}
                            textColor="text-white"
                            onClick={handleAdd}
                            className="w-full sm:w-auto"
                        />
                    </div>
                </section>

                <section className="mt-3 sm:mt-5 bg-white rounded-xl">
                    <div className="p-3 sm:p-5">
                        <Table 
                            data={data}
                            headers={headers}
                            hasSearch={true}
                            hasPagination={true}
                        />
                    </div>
                </section>

                {/* Add Modal - Responsif */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
                            <div 
                                className="fixed inset-0 bg-black opacity-30"
                                onClick={handleClose}
                            ></div>

                            <div className="relative bg-white rounded-lg w-full max-w-lg md:w-2/3 lg:w-1/2 xl:w-1/3 p-4 sm:p-6 mx-4 my-8 sm:my-0">
                                <div className="flex justify-between items-center mb-4 sm:mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Tambah Absensi
                                    </h3>
                                    <button 
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1 text-sm">
                                                Masukan Foto
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <FileInput
                                                label="Masukan Foto Absen"
                                                onFileChange={(file) => setFormData({...formData, image: file})}
                                                width="w-full" 
                                                required={true}
                                                accept="image/*"
                                                cameraOnly={true}
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Input
                                                label="Tanggal"
                                                type1="date"
                                                value={formData.tanggal}
                                                onChange={(value) => setFormData({...formData, tanggal: value})}
                                                width="w-full sm:w-1/2"
                                                required={true}
                                                disabled={true}
                                            />
                                            
                                            <Input
                                                label="Jam Masuk"
                                                type1="time"
                                                value={formData.jam_masuk}
                                                onChange={(value) => handleTimeChange('jam_masuk', value)}
                                                width="w-full sm:w-1/2"
                                                required={true}
                                                disabled={true}
                                            />
                                        </div>

                                        
                                        {formData.showJamKeluar && (
                                            <Input
                                                label="Jam Keluar"
                                                type1="time"
                                                value={formData.jam_keluar}
                                                onChange={(value) => handleTimeChange('jam_keluar', value)}
                                                width="w-full sm:w-1/2"
                                                required={true}
                                                disabled={true}
                                            />
                                        )}

                                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-lg border border-gray-300 w-full sm:w-auto mt-2 sm:mt-0"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className={`px-4 py-2 bg-${themeColor} text-white rounded-lg hover:bg-opacity-90 font-medium w-full sm:w-auto`}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail Modal for Jam Masuk/Keluar */}
                {showDetailModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
                            <div 
                                className="fixed inset-0 bg-black opacity-30"
                                onClick={handleCloseDetailModal}
                            ></div>

                            <div className="relative bg-white rounded-lg w-full max-w-lg md:w-2/3 lg:w-3/5 p-4 sm:p-6 mx-4 my-8 sm:my-0">
                                <div className="flex justify-between items-center mb-4 sm:mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Detail Absensi - Jam {detailData.type === 'masuk' ? 'Masuk' : 'Keluar'} ({detailData.jam})
                                    </h3>
                                    <button 
                                        onClick={handleCloseDetailModal}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Image */}
                                    <div>
                                        <h4 className="text-md font-medium mb-2">Foto Absensi</h4>
                                        <div className="bg-gray-100 rounded-lg p-2 flex justify-center">
                                            <img 
                                                src={`${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${detailData.foto}`}
                                                alt={`Foto Absensi ${detailData.type}`}
                                                className="rounded-lg max-h-64 object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/api/placeholder/400/300";
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Map */}
                                    <div>
                                        <h4 className="text-md font-medium mb-2">Lokasi</h4>
                                        <div className="bg-gray-100 rounded-lg p-2 h-64">
                                            <iframe
                                            title="Location Map"
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            style={{ border: 0, borderRadius: '0.5rem' }}
                                            src={getMapEmbedUrl(detailData.coordinates?.lat || 0, detailData.coordinates?.lng || 0)}
                                            allowFullScreen
                                            ></iframe>
                                        </div>
                                        <div className="mt-2">
                                            <a 
                                            href={detailData.lokasi}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-${themeColor} hover:underline flex items-center justify-center`}
                                            >
                                            Buka di Google Maps
                                            <svg 
                                                className="w-4 h-4 ml-1" 
                                                fill="currentColor" 
                                                viewBox="0 0 24 24" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M14 5C13.4477 5 13 4.55228 13 4C13 3.44772 13.4477 3 14 3H20C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11C19.4477 11 19 10.5523 19 10V6.41421L11.7071 13.7071C11.3166 14.0976 10.6834 14.0976 10.2929 13.7071C9.90237 13.3166 9.90237 12.6834 10.2929 12.2929L17.5858 5H14Z" />
                                                <path d="M5 7C4.44772 7 4 7.44772 48V19C4 19.5523 4.44772 20 5 20H16C16.5523 20 17 19.5523 17 19V14C17 13.4477 17.4477 13 18 13C18.5523 13 19 13.4477 19 14V19C19 20.6569 17.6569 22 16 22H5C3.34315 22 2 20.6569 2 19V8C2 6.34315 3.34315 5 5 5H10C10.5523 5 11 5.44772 11 6C11 6.55228 10.5523 7 10 7H5Z" />
                                            </svg>
                                            </a>
                                        </div>
                                        </div>

                                    <button
                                        type="button"
                                        onClick={handleCloseDetailModal}
                                        className={`w-full px-4 py-2 bg-${themeColor} text-white rounded-lg hover:bg-opacity-90 font-medium`}
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
{/* Success Modal */}
{isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil ditambahkan"
                        confirmLabel="Ok"
                        onConfirm={handleAcc}
                    />
                )}

                {/* Loading Spinner - Responsif */}
                {isLoading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                        <Spinner />
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <AlertError
                        title="Gagal"
                        description={error}
                        onConfirm={() => setError(null)}
                    />
                )}
            </div>
        </LayoutWithNav>
    );
}