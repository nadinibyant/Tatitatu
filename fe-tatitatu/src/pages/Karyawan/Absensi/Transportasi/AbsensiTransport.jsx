import { useState, useEffect } from "react";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import Button from "../../../../components/Button";
import Table from "../../../../components/Table";
import Input from "../../../../components/Input";
import FileInput from "../../../../components/FileInput";
import InputDropdown from "../../../../components/InputDropdown";
import AlertSuccess from "../../../../components/AlertSuccess";
import Spinner from "../../../../components/Spinner";
import AlertError from "../../../../components/AlertError";
import { useNavigate } from "react-router-dom";
import api from "../../../../utils/api";

export default function AbsensiKaryawan() {
    // State Management
    const userData = JSON.parse(localStorage.getItem('userData'))
    const karyawan_id = userData.userId
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        foto: null,
        tanggal: '',
        lokasi: 'Lokasi',
        status: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalSucc, setModalSucc] = useState(false);
    const [data, setData] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const navigate = useNavigate();
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
    const [geoError, setGeoError] = useState(null);

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
    const statusOptions = [
        { value: 'Antar', label: 'Antar' },
        { value: 'Jemput', label: 'Jemput' }
    ];

    const headers = [
        { label: "No", key: "nomor", align: "text-left" },
        { label: "Tanggal", key: "tanggal", align: "text-left" },
        { label: "Foto", key: "foto", align: "text-left" },
        { label: "Lokasi", key: "lokasi", align: "text-left" },
        { label: "Status", key: "status", align: "text-left" }
    ];

    const StatusBadge = ({ status }) => {
        return (
            <span 
                className={`px-4 py-1 rounded-md text-sm font-medium inline-block min-w-[100px] text-center
                    ${status === 'Antar' 
                        ? 'bg-pink text-primary border border-red-200' 
                        : 'bg-primary text-white'
                    }`}
            >
                {status}
            </span>
        );
    };

    useEffect(() => {
        if (isInitialLoad) {
            fetchData();
            setIsInitialLoad(false);
        }
    }, [isInitialLoad]);

    // Handlers
    const handleAdd = () => {
        setFormData({
            foto: null,
            tanggal: '',
            lokasi: '',
            status: ''
        });
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setError(null);
    };

    const handleAcc = () => {
        setModalSucc(false);
        navigate('/absensi-karyawan-transport');
    };

    const validateForm = () => {
        const errors = [];
        
        if (!formData.foto) {
            errors.push('Silahkan Upload Foto Dahulu');
        }
        
        if (!formData.tanggal) {
            errors.push('Tanggal harus diisi');
        }
        
        // if (!formData.lokasi) {
        //     errors.push('Lokasi harus diisi');
        // }
        
        if (!formData.status) {
            errors.push('Status harus dipilih');
        }

        if (formData.foto && !['image/jpeg', 'image/png', 'image/jpg'].includes(formData.foto.type)) {
            errors.push('File harus berupa gambar (JPG, JPEG, atau PNG)');
        }
        if (formData.foto && formData.foto.size > 5 * 1024 * 1024) {
            errors.push('Ukuran file tidak boleh lebih dari 5MB');
        }

        return errors;
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/absensi-karyawan?karyawanId=${karyawan_id}`);
            
            if (response.data.success) {
                const formattedData = response.data.data.map((item, index) => ({
                    nomor: index + 1,
                    tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    foto: (
                        <img 
                            src={`${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${item.image}`}
                            alt="Lokasi" 
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                                e.target.src = "/api/placeholder/64/64"; 
                            }}
                        />
                    ),
                    lokasi: (
                        <a 
                            href={item.gmaps} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-maroon hover:text-red-800 underline flex items-center"
                        >
                            {item.lokasi}
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
                    status: <StatusBadge status={item.status} />
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        try {
            let currentLocation;
            try {
                currentLocation = await getCurrentLocation();
            } catch (geoErr) {
                setGeoError(geoErr.message);
                throw new Error(`Gagal mendapatkan lokasi: ${geoErr.message}. Mohon izinkan akses lokasi.`);
            }

            setIsLoading(true);
            const submitData = new FormData();
            submitData.append('image', formData.foto);
            submitData.append('tanggal', formData.tanggal);
            submitData.append('lokasi', "Lokasi");
            submitData.append('status', formData.status);
            submitData.append('karyawan_id', karyawan_id)
            if (currentLocation && currentLocation.lat && currentLocation.lng) {
                submitData.append('lat', currentLocation.lat);
                submitData.append('lng', currentLocation.lng);
                setCoordinates(currentLocation);
            } else {
                submitData.append('lat', '0');
                submitData.append('lng', '0');
            }

            await api.post('/absensi-karyawan', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        
            handleClose();
            setModalSucc(true);
            fetchData(); 

        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LayoutWithNav>
            <div className="p-5">
                {/* Header Section */}
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className="text-primary text-base font-bold">Data Absensi</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
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
                            />
                        </div>
                    </div>
                </section>

                {/* Table Section */}
                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Table 
                            data={data}
                            headers={headers}
                            hasSearch={true}
                            hasPagination={true}
                        />
                    </div>
                </section>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                            onClick={handleClose}
                        ></div>

                        <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:p-0">
                      
                            <div className="relative bg-white rounded-xl shadow-xl transform transition-all w-full max-w-md mx-auto p-5 sm:p-6">
                           
                                <div className="flex justify-between items-center mb-4 border-b pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Tambah Absensi
                                    </h3>
                                    <button 
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        aria-label="Close"
                                    >
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
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
                                                onFileChange={(file) => setFormData({...formData, foto: file})}
                                                required={true}
                                                width="w-full"
                                                accept="image/*"
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="w-full sm:w-1/2">
                                                <Input
                                                    label="Tanggal"
                                                    type1="date"
                                                    value={formData.tanggal}
                                                    onChange={(value) => setFormData({...formData, tanggal: value})}
                                                    width="w-full"
                                                    required={true}
                                                />
                                            </div>
                                            <div className="w-full sm:w-1/2">
                                                <InputDropdown
                                                    label="Status"
                                                    options={statusOptions}
                                                    value={formData.status}
                                                    onSelect={(selected) => setFormData({...formData, status: selected.value})}
                                                    required={true}
                                                    width="w-full"
                                                    name="status"
                                                    error={!formData.status && error}
                                                    errorMessage="Status harus dipilih"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6 pt-3 border-t">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="w-full sm:w-auto px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 mt-3 sm:mt-0"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 font-medium"
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
    
                {/* Loading Spinner */}
                {isLoading && <Spinner />}

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