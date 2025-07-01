import React, { useState, useEffect } from "react";
import LayoutWithNav from "../../../components/LayoutWithNav";
import Table from "../../../components/Table";
import api from "../../../utils/api";
import { useNavigate } from "react-router-dom";

export default function AkunKerja() {
    const [karyawanData, setKaryawanData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getUserData = () => {
        try {
            return JSON.parse(localStorage.getItem('userData') || '{"role":"admin"}');
        } catch (error) {
            console.error("Error parsing user data:", error);
            return { role: "admin" };
        }
    };
    
    const userData = getUserData();
    const isAdminGudang = userData.role === 'admingudang';
    const isHeadGudang = userData.role === 'headgudang';
    const isOwner = userData.role === 'owner';
    const isManajer = userData.role === 'manajer';
    const isAdmin = userData.role === 'admin';
    const isFinance = userData.role === 'finance';

    const themeColor = (isAdminGudang || isHeadGudang) 
        ? "coklatTua" 
        : (isManajer || isOwner || isFinance) 
            ? "biruTua" 
            : "primary";
            
    useEffect(() => {
        fetchKaryawanData();
    }, []);

    const navigate = useNavigate()
    const handleClickEdit = (item) => {
        navigate(`/profile/${item.user_id}`)
        localStorage.setItem('role_name', item.role_name)
        // localStorage.setItem('user_id', item.id)
    }

    // Fetch data from API
    const fetchKaryawanData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/list-akun-kerja');
            if (response?.data?.success) {
                const formattedData = response.data.data.map((item, index) => ({
                    nomor: index + 1,
                    Nama: item.nama,
                    Email: item.email,
                    id: item.user_id,
                    role_id: item.role_id,
                    role_name: item.role_name,
                    karyawan_id: item.karyawan_id,
                    Aksi: (
                        <a 
                            onClick={() => handleClickEdit(item)}
                            className="flex items-center px-3 py-1 text-oren border border-secondary rounded-md hover:bg-black/5"
                        >
                            <svg width="17" height="18" viewBox="0 0 17 18" className="mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z" fill="#DA5903"/>
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z" fill="#DA5903"/>
                            </svg>
                            Edit Data
                        </a>
                    ),
                }));
                
                setKaryawanData(formattedData);
            } else {
                console.error("Failed to fetch data:", response?.data?.message || "Unknown error");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const headers = [
        { label: "No", key: "nomor", width: "60px", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Username", key: "Email", align: "text-left" },
        { label: "Aksi", key: "Aksi", width:"150px", align: "text-left" },
    ];

    const getBgHeaderColor = () => {
        if (isAdminGudang || isHeadGudang) return 'bg-coklatMuda';
        if (isManajer || isOwner || isFinance) return 'bg-biruMuda';
        return 'bg-pink';
    };
    
    const getTextHeaderColor = () => {
        if (isAdminGudang || isHeadGudang) return 'text-coklatTua';
        if (isManajer || isOwner || isFinance) return 'text-biruTua';
        return 'text-primary';
    };

    return (
        <LayoutWithNav>
            <div className="p-5">
                <div className="left w-full md:w-auto">
                    <p className={`text-${themeColor} text-base font-bold`}>Daftar Akun Karyawan</p>
                </div>

                <section className="mt-5 bg-white rounded-xl shadow-sm">
                    <div className="p-5">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <p className="text-gray-500">Memuat data...</p>
                            </div>
                        ) : (
                            <Table
                                headers={headers}
                                data={karyawanData}
                                hasFilter={false}
                                bg_header={getBgHeaderColor()}
                                text_header={getTextHeaderColor()}
                                syncWithUrl={true}
                            />
                        )}
                    </div>
                </section>
            </div>
        </LayoutWithNav>
    );
}