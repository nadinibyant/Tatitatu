import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import { useState, useEffect } from "react";
import Table from "../../../components/Table";
import Input from "../../../components/Input";
import TextArea from "../../../components/Textarea";
import AlertSuccess from "../../../components/AlertSuccess";
import AlertError from "../../../components/AlertError";
import Spinner from "../../../components/Spinner";
import api from "../../../utils/api";

export default function IzinCutiKaryawan(){
    const userData = JSON.parse(localStorage.getItem('userData'))
    const karyawan_id = userData.userId
    const toko_id = userData.tokoId
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        karyawan_id: karyawan_id, 
        tanggal_mulai: '',
        tanggal_selesai: '',
        alasan: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalSucc, setModalSucc] = useState(false);
    const [data, setData] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        if (isInitialLoad) {
            fetchData();
            setIsInitialLoad(false);
        }
    }, [isInitialLoad]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/cuti-karyawan/02/2025`);
            
            if (response.data.success) {
                const allCutiData = response.data.data.reduce((acc, karyawan) => {
                    return [...acc, ...karyawan.cuti_karyawan];
                }, []);
    
                const formattedData = allCutiData.map((item, index) => ({
                    nomor: index + 1,
                    Tanggal: `${formatDate(item.tanggal_mulai)}`,
                    'Alasan Izin/Cuti': item.alasan,
                    Status: <StatusBadge status={item.status || 'Menunggu'} />,
                    'Jumlah Hari': item.jumlah_cuti
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

    const handleAdd = () => {
        setFormData({
            karyawan_id: karyawan_id,
            tanggal_mulai: '',
            tanggal_selesai: '',
            alasan: '',
            toko_id: toko_id
        });
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
        
        if (!formData.tanggal_mulai) {
            errors.push('Tanggal mulai harus diisi');
        }
        
        if (!formData.tanggal_selesai) {
            errors.push('Tanggal selesai harus diisi');
        }
        
        if (!formData.alasan) {
            errors.push('Alasan harus diisi');
        }

        if (formData.tanggal_mulai && formData.tanggal_selesai) {
            const mulai = new Date(formData.tanggal_mulai);
            const selesai = new Date(formData.tanggal_selesai);
            if (selesai < mulai) {
                errors.push('Tanggal selesai tidak boleh lebih kecil dari tanggal mulai');
            }
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

            const response = await api.post('/cuti-karyawan', {
                karyawan_id: formData.karyawan_id,
                tanggal_mulai: formData.tanggal_mulai,
                tanggal_selesai: formData.tanggal_selesai,
                alasan: formData.alasan,
                toko_id: toko_id
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

    const StatusBadge = ({ status }) => {
        const getStatusStyle = (status) => {
            switch(status.toLowerCase()) {
                case 'diterima':
                    return 'bg-green-50 text-green-600 border border-green-200';
                case 'ditolak':
                    return 'bg-red-50 text-red-500 border border-red-200';
                default:
                    return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
            }
        };

        return (
            <span 
                className={`px-4 py-1 rounded-md text-sm font-medium inline-block min-w-[100px] text-center
                    ${getStatusStyle(status)}`}
            >
                {status}
            </span>
        );
    };

    const headers = [
        { label: "No", key: "nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Alasan Izin/Cuti", key: "Alasan Izin/Cuti", align: "text-left" },
        { label: "Status", key: "Status", align: "text-left" }
    ];

    return(
        <LayoutWithNav>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className="text-primary text-base font-bold">Daftar Izin/Cuti</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                            <Button
                                label="Tambah Izin"
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

                {/* Modal Form */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <div 
                                className="fixed inset-0 bg-black opacity-30"
                                onClick={handleClose}
                            ></div>

                            <div className="relative bg-white rounded-lg w-full md:w-1/2 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Tambah Izin/Cuti
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
                                        <div className="flex gap-4">
                                            <Input
                                                label="Tanggal Mulai"
                                                type1="date"
                                                value={formData.tanggal_mulai}
                                                onChange={(value) => setFormData({...formData, tanggal_mulai: value})}
                                                width="w-1/2"
                                                required={true}
                                            />
                                            <Input
                                                label="Tanggal Selesai"
                                                type1="date"
                                                value={formData.tanggal_selesai}
                                                onChange={(value) => setFormData({...formData, tanggal_selesai: value})}
                                                width="w-1/2"
                                                required={true}
                                            />
                                        </div>

                                        <TextArea
                                            label="Alasan"
                                            value={formData.alasan}
                                            onChange={(e) => setFormData({...formData, alasan: e.target.value})}
                                            required={true}
                                            rows={4}
                                        />

                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium border-secondary border rounded-lg"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 font-medium"
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