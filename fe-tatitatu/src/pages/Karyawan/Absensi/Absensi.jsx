import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import Table from "../../../components/Table";
import Input from "../../../components/Input";
import FileInput from "../../../components/FileInput"; // Import komponen FileInput yang sudah diperbarui
import AlertSuccess from "../../../components/AlertSuccess";
import AlertError from "../../../components/AlertError";
import Spinner from "../../../components/Spinner";
import api from "../../../utils/api";

export default function Absensi() {
    // State Management
    const userData = JSON.parse(localStorage.getItem('userData'))
    const karyawan_id = userData.userId
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

    // Function to get current date in YYYY-MM-DD format
    const getCurrentDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Function to get current time in HH:MM format
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
        { label: "Foto", key: "foto", align: "text-left" },
        { label: "Jam Masuk", key: "jam_masuk", align: "text-left" },
        { label: "Jam Keluar", key: "jam_keluar", align: "text-left" },
        { label: "Total Menit", key: "total_menit", align: "text-left" },
        { label: "Lokasi", key: "lokasi", align: "text-left" },
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

    // API Functions
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/absensi-karyawan?karyawanId=${karyawan_id}`);
            
            if (response.data.success) {
                // Sort data by date in descending order to ensure latest record is first
                const sortedData = [...response.data.data].sort((a, b) => {
                    return new Date(b.tanggal + ' ' + (b.jam_masuk || '00:00')) - 
                           new Date(a.tanggal + ' ' + (a.jam_masuk || '00:00'));
                });
                
                const formattedData = sortedData.map((item, index) => ({
                    nomor: index + 1,
                    // Store original values for logic purposes
                    original_jam_masuk: item.jam_masuk,
                    original_jam_keluar: item.jam_keluar,
                    tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    lokasi: (
                        <a 
                            href={item.gmaps} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-maroon hover:text-red-800 underline flex items-center"
                        >
                            Lokasi
                            <svg 
                                className="w-4 h-4 ml-1" 
                                fill="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                />
                            </svg>
                        </a>
                    ),
                    foto: (
                        <img 
                            src={`${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${item.image}`}
                            alt="Foto Absensi" 
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                                e.target.src = "/api/placeholder/64/64"; 
                            }}
                        />
                    ),
                    jam_masuk: item.jam_masuk || '-',
                    jam_keluar: item.jam_keluar || '-',
                    total_menit: item.total_menit ? `${formatNumber(item.total_menit)} Menit` : '-'
                }));
                
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

    // Event Handlers
    const handleAdd = () => {
        const currentDate = getCurrentDate();
        const currentTime = getCurrentTime();
        
        const lastAttendance = data.length > 0 ? data[0] : null;
        
        const today = new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const hasTodayAttendance = lastAttendance && lastAttendance.tanggal === today;
        
        // Default form data
        let newFormData = {
            image: null,
            karyawan_id: karyawan_id,
            tanggal: currentDate,
            jam_masuk: currentTime,
            jam_keluar: '',  
            total_menit: '0',
            showJamKeluar: false  
        };
        
        if (hasTodayAttendance && 
            lastAttendance.jam_masuk && 
            lastAttendance.jam_masuk !== '-' && 
            (lastAttendance.jam_keluar === '-' || !lastAttendance.jam_keluar)) {
            
            newFormData = {
                ...newFormData,
                jam_masuk: lastAttendance.original_jam_masuk || lastAttendance.jam_masuk,
                jam_keluar: currentTime,
                showJamKeluar: true 
            };
        }
        
        setFormData(newFormData);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setError(null);
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

            
            
            console.log(totalMenit)
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
                submitData.append('total_menit', '0');
            }
            
            if (currentLocation && currentLocation.lat && currentLocation.lng) {
                submitData.append('lat', currentLocation.lat);
                submitData.append('lng', currentLocation.lng);
                setCoordinates(currentLocation);
            } else {
                submitData.append('lat', '0');
                submitData.append('lng', '0');
            }

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

    return (
        <LayoutWithNav>
            <div className="p-3 sm:p-5">
                {/* Header Section - Responsif */}
                <section className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 mb-4">
                    <div className="w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0">
                        <p className="text-primary text-base font-bold">Daftar Absensi</p>
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
                            bgColor="bg-primary"
                            hoverColor="hover:bg-opacity-90 hover:border hover:border-primary hover:text-white"
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
                                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 font-medium w-full sm:w-auto"
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