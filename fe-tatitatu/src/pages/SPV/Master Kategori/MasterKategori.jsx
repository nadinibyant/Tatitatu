import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Input from "../../../components/Input";
import Table from "../../../components/Table";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";
import AlertSuccess from "../../../components/AlertSuccess";
import Alert from "../../../components/Alert";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import AlertError from "../../../components/AlertError";

export default function MasterKategori() {
    const [showListModal, setShowListModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formType, setFormType] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState('');
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setLoading] = useState(false)
    const [isAlertSuccess, setAlertSucc] = useState(false)
    const [id,setId] = useState('')
    const [isAlertDel, setAlertDel] = useState(false)
    const [isErrorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isAlertSuccDel, setAlertDelSucc] = useState(false)
    const [tableData, setTableData] = useState([]);
    const userDataLogin = JSON.parse(localStorage.getItem('userData'));
    const [toko_id, setTokoId] = useState(null);

    useEffect(() => {
        const fetchTokoId = async () => {
            try {
                if (userDataLogin.role === 'kasirtoko') {
                    const response = await api.get(`/cabang/${userDataLogin.userId}`);
                    if (response.data.success) {
                        setTokoId(response.data.data.toko_id);
                    }
                } else {
                    setTokoId(userDataLogin.userId);
                }
            } catch (error) {
                console.error('Error fetching toko id:', error);
            }
        };
    
        if (userDataLogin) {
            fetchTokoId();
        }
    }, [userDataLogin]);
    
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('userData'));
        if (!user) {
            navigate('/login');
            return;
        }
        setUserData(user);
    }, [navigate]);

    const fetchDivisi = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/divisi-karyawan?toko_id=${toko_id}`);
            const items = response.data.data.map(item => ({
                id: item.divisi_karyawan_id,
                kategori: item.nama_divisi
            }));
    
            setData(prevData => ({
                ...prevData,
                categories: prevData.categories.map(category => {
                    if (category.title === 'Divisi') {
                        return {
                            ...category,
                            data: items
                        };
                    }
                    return category;
                })
            }));
    
            if (selectedCategory?.title === 'Divisi') {
                setTableData(items);
            }
        } catch (error) {
            console.error('Error fetching divisi:', error);
        } finally {
            setLoading(false);
        }
    };

    // get kategori barang
    const fetchBarang = async () => {
        try {
            setLoading(true);
            const endpoint = userData?.role === 'admingudang' ? '/kategori-barang-gudang' : `/kategori-barang?toko_id=${toko_id}`;
            const response = await api.get(endpoint);
            const items = response.data.data.map(item => ({
                id: item.kategori_barang_id,
                kategori: item.nama_kategori_barang
            }));
    
            setData(prevData => ({
                ...prevData,
                categories: prevData.categories.map(category => {
                    if (category.title === 'Kategori Barang') {
                        return {
                            ...category,
                            data: items
                        };
                    }
                    return category;
                })
            }));
    
            if (selectedCategory?.title === 'Kategori Barang') {
                setTableData(items);
            }
        } catch (error) {
            console.error('Error fetching kategori barang:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetode = async () => {
        try {
            setLoading(true);
            const endpoint = userData?.role === 'admingudang' ? '/metode-pembayaran-gudang' : '/metode-pembayaran';
            let url = endpoint;
            if (userData?.role === 'admin' || userData?.role === 'kasirtoko') {
                url = `${endpoint}?toko_id=${toko_id}`;
            }


            const response = await api.get(url);
            const items = response.data.data.map(item => ({
                id: item.metode_id,
                kategori: item.nama_metode
            }));

            
            setData(prevData => ({
                ...prevData,
                categories: prevData.categories.map(category => {
                    if (category.title === 'Metode Pembayaran') {
                        return {
                            ...category,
                            data: items
                        };
                    }
                    return category;
                })
            }));
    
            if (selectedCategory?.title === 'Metode Pembayaran') {
                setTableData(items);
            }
        } catch (error) {
            console.error('Error fetching metode pembayaran:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchKategoriPemasukan = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kategori-pemasukan');
            const items = response.data.data.map(item => ({
                id: item.kategori_pemasukan_id,
                kategori: item.kategori_pemasukan
            }));
            
            setData(prevData => ({
                ...prevData,
                categories: prevData.categories.map(category => {
                    if (category.title === 'Kategori Pemasukan') {
                        return {
                            ...category,
                            data: items
                        };
                    }
                    return category;
                })
            }));
    
            if (selectedCategory?.title === 'Kategori Pemasukan') {
                setTableData(items);
            }
        } catch (error) {
            console.error('Error fetching kategori pemasukan:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchKategoriPengeluaran = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kategori-pengeluaran');
            const items = response.data.data.map(item => ({
                id: item.kategori_pengeluaran_id,
                kategori: item.kategori_pengeluaran
            }));
            
            setData(prevData => ({
                ...prevData,
                categories: prevData.categories.map(category => {
                    if (category.title === 'Kategori Pengeluaran') {
                        return {
                            ...category,
                            data: items
                        };
                    }
                    return category;
                })
            }));
    
            if (selectedCategory?.title === 'Kategori Pengeluaran') {
                setTableData(items);
            }
        } catch (error) {
            console.error('Error fetching kategori pengeluaran:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData && toko_id) {  
            if (userData.role === 'admingudang' || userData.role === 'admin') {
                fetchBarang();
            }
            if (['admin', 'kasirtoko', 'finance', 'admingudang'].includes(userData.role)) {
                fetchMetode();
            }
            if (userData.role === 'admin' || userData.role === 'headgudang') {
                fetchDivisi();
            }
            if (userData.role === 'finance') {
                fetchKategoriPemasukan();
                fetchKategoriPengeluaran()
            }
        }
    }, [userData, toko_id]);

    const [data, setData] = useState({
        categories: [
            { 
                title: 'Metode Pembayaran', 
                id: 1,
                data: []
            },
            { 
                title: 'Kategori Barang', 
                id: 2,
                data: []
            },
            { 
                title: 'Kategori Pengeluaran', 
                id: 3,
                data: [
                    { id: 1, kategori: "Beban Operasional", no: 1, aksi: getActionButtons() },
                    { id: 2, kategori: "Beban Transportasi", no: 2, aksi: getActionButtons() },
                    { id: 3, kategori: "Beban Bangunan", no: 3, aksi: getActionButtons() },
                    { id: 4, kategori: "Beban Karyawan", no: 4, aksi: getActionButtons() },
                    { id: 5, kategori: "Beban Keluarga", no: 5, aksi: getActionButtons() }
                ]
            },
            { 
                title: 'Kategori Pemasukan', 
                id: 4,
                data: [
                    { id: 1, kategori: "Penjualan Produk", no: 1, aksi: getActionButtons() },
                    { id: 2, kategori: "Investasi", no: 2, aksi: getActionButtons() }
                ]
            },
            { 
                title: 'Divisi', 
                id: 5,
                data: []
            }
        ]
    });

    function getActionButtons(item = {}) {
        return (
            <div className="flex gap-2 justify-end">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if(item?.id) { 
                            handleEditItem(item);
                        }
                    }} 
                    className="text-orange-500"
                >
                    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z" fill="#DA5903"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z" fill="#DA5903"/>
                    </svg>
                </button>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if(item?.id) { 
                            handleDeleteItem(item);
                        }
                    }} 
                    className="text-red-500"
                >
                    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 1H10.5L9.5 0H4.5L3.5 1H0V3H14M1 16C1 16.5304 1.21071 17.0391 1.58579 17.4142C1.96086 17.7893 2.46957 18 3 18H11C11.5304 18 12.0391 17.7893 12.4142 17.4142C12.7893 17.0391 13 16.5304 13 16V4H1V16Z" fill="#B91C1C"/>
                    </svg>
                </button>
            </div>
        );
    }

    const getFilteredCategories = () => {
        switch(userData?.role) {
            case 'kasirtoko':
                return data.categories.filter(category => 
                    category.title === 'Metode Pembayaran'
                );
            case 'finance':
                return data.categories.filter(category => 
                    category.title === 'Metode Pembayaran' || 
                    category.title === 'Kategori Pengeluaran' || 
                    category.title === 'Kategori Pemasukan'
                );
            case 'admin':
                return data.categories.filter(category => 
                    category.title === 'Metode Pembayaran' || 
                    category.title === 'Kategori Barang' || 
                    category.title === 'Divisi'
                );
            case 'admingudang':
                return data.categories.filter(category => 
                    category.title === 'Metode Pembayaran' || 
                    category.title === 'Kategori Barang'
                )
            case 'headgudang':
                return data.categories.filter(category => 
                    category.title === 'Divisi'
                );
            default:
                return data.categories;
        }
    };

    const tableHeaders = [
        { key: 'no', label: 'No' },
        { key: 'kategori', label: 'Kategori' },
        { key: 'aksi', label: 'Aksi', align: 'text-right' }
    ];

    const handleEdit = (category) => {
        const categoryWithActions = {
            ...category,
            data: category.data.map(item => ({
                ...item,
                aksi: getActionButtons(item)
            }))
        };
        setSelectedCategory(categoryWithActions);
        setTableData(category.data); 
        setShowListModal(true);
    };

    const handleAddItem = () => {
        setFormType('add');
        setSelectedItem(null);
        setFormData('');
        setShowFormModal(true);
    };

    const handleEditItem = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setId(item.id)
        setFormData(item.kategori);
        setShowFormModal(true);
    };

    const handleFormSubmit = async () => {
        if (!formData.trim()) {
            return;
        }
    
        try {
            setLoading(true);
            if(selectedCategory.title === 'Divisi') {
                if(formType === 'add') {
                    await api.post('/divisi-karyawan', {
                        nama_divisi: formData,
                        toko_id: toko_id
                    });
                    await fetchDivisi();
                    setShowFormModal(false);
                    setAlertSucc(true);
                } else {
                    await api.put(`/divisi-karyawan/${id}`, {
                        nama_divisi: formData
                    });
                    await fetchDivisi();
                    setShowFormModal(false);
                    setAlertSucc(true);
                }
            } else if (selectedCategory.title === 'Kategori Barang'){
                const endpoint = userData?.role === 'admingudang' ? '/kategori-barang-gudang' : '/kategori-barang';
                if(formType === 'add') {
                    const payload = userData?.role === 'admingudang' 
                        ? { nama_kategori_barang: formData }
                        : { nama_kategori_barang: formData, toko_id: toko_id };
                    await api.post(endpoint, payload);
                    await fetchBarang();
                    setShowFormModal(false);
                    setAlertSucc(true);
                } else {
                    await api.put(`${endpoint}/${id}`, {
                        nama_kategori_barang: formData
                    });
                    await fetchBarang();
                    setShowFormModal(false);
                    setAlertSucc(true);
                }
            } else if (selectedCategory.title === 'Metode Pembayaran'){
                const endpoint = userData?.role === 'admingudang' ? '/metode-pembayaran-gudang' : '/metode-pembayaran';
                if(formType === 'add') {
                    let payload = { nama_metode: formData };
                                    
                    if (userData?.role === 'admin' || userData?.role === 'kasirtoko') {
                        payload.toko_id = toko_id;
                    }
                    
                    await api.post(endpoint, payload);
                    await fetchMetode();
                    setShowFormModal(false);
                    setAlertSucc(true);
                } else {
                    await api.put(`${endpoint}/${id}`, {
                        nama_metode: formData
                    });
                    await fetchMetode();
                    setShowFormModal(false);
                    setAlertSucc(true);
                }
            } else if (selectedCategory.title === 'Kategori Pemasukan'){
                if(formType === 'add') {
                    const payload = { 
                        kategori_pemasukan: formData 
                    };
                    
                    await api.post('/kategori-pemasukan', payload);
                    await fetchKategoriPemasukan();
                    setShowFormModal(false);
                    setAlertSucc(true);
                } else {
                    await api.put(`/kategori-pemasukan/${id}`, {
                        kategori_pemasukan: formData
                    });
                    await fetchKategoriPemasukan();
                    setShowFormModal(false);
                    setAlertSucc(true);
                } 
            } else if (selectedCategory.title === 'Kategori Pengeluaran'){
                if(formType === 'add') {
                    const payload = { 
                        kategori_pengeluaran: formData 
                    };
                    
                    await api.post('/kategori-pengeluaran', payload);
                    await fetchKategoriPengeluaran();
                    setShowFormModal(false);
                    setAlertSucc(true);
                } else {
                    await api.put(`/kategori-pengeluaran/${id}`, {
                        kategori_pengeluaran: formData
                    });
                    await fetchKategoriPengeluaran();
                    setShowFormModal(false);
                    setAlertSucc(true);
                } 
            }
        } catch (error) {
            console.error('Error submitting data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = (item) => {
        setAlertDel(true)
        setId(item.id)
    };

    const handleConfirmDel = async () => {
        try {
            setLoading(true);
            if (selectedCategory.title === 'Kategori Barang') {
                const endpoint = userData?.role === 'admingudang' ? '/kategori-barang-gudang' : '/kategori-barang';
                const response = await api.delete(`${endpoint}/${id}`);
                if (response.data.success) {
                    await fetchBarang(); 
                    setAlertDel(false);
                    setAlertDelSucc(true);
                } else {
                    setErrorMessage(response.data.message);
                    setErrorAlert(true);
                }
            } else if(selectedCategory.title === 'Metode Pembayaran'){
                const endpoint = userData?.role === 'admingudang' ? '/metode-pembayaran-gudang' : '/metode-pembayaran';
                const response = await api.delete(`${endpoint}/${id}`);
                if (response.data.success) {
                    await fetchMetode(); 
                    setAlertDel(false);
                    setAlertDelSucc(true);
                } else {
                    setErrorMessage(response.data.message);
                    setErrorAlert(true);
                }
            } else if (selectedCategory.title === 'Divisi'){
                const response = await api.delete(`/divisi-karyawan/${id}`);
                if (response.data.success) {
                    await fetchDivisi(); 
                    setAlertDel(false);
                    setAlertDelSucc(true);
                } else {
                    setErrorMessage(response.data.message);
                    setErrorAlert(true);
                }
            } else if (selectedCategory.title === 'Kategori Pemasukan'){
                const response = await api.delete(`/kategori-pemasukan/${id}`)
                if (response.data.success) {
                    await fetchKategoriPemasukan()
                    setAlertDel(false)
                    setAlertDelSucc(true)
                } else {
                    setErrorMessage(response.data.message)
                    setErrorAlert(true)
                }
            } else if (selectedCategory.title === 'Kategori Pengeluaran'){
                const response = await api.delete(`/kategori-pengeluaran/${id}`)
                if (response.data.success) {
                    await fetchKategoriPengeluaran()
                    setAlertDel(false)
                    setAlertDelSucc(true)
                } else {
                    setErrorMessage(response.data.message)
                    setErrorAlert(true)
                }
            }
        } catch (error) {
            console.error('Kesalahan Server', error);
            setErrorMessage('Terjadi kesalahan saat menghapus data');
            setErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <div className="">
                    <h1 className="text-base font-bold text-primary mb-6">
                        Master Kategori
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {getFilteredCategories().map((category) => (
                            <div 
                                key={category.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col h-full items-center justify-center text-center">
                                    <h2 className="text-base font-bold text-gray-800 mb-4">
                                        {category.title}
                                    </h2>
                                    <div className="mt-auto flex justify-center">
                                        <button 
                                            onClick={() => handleEdit(category)}
                                            className="inline-flex items-center px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                                        >
                                            <svg 
                                                className="w-4 h-4 mr-2" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                strokeWidth="2"
                                            >
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {showListModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">{selectedCategory.title}</h3>
                                <button onClick={() => setShowListModal(false)} className="text-gray-500 hover:text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex justify-end items-center mb-4">
                                <Button
                                    label={'Tambah'}
                                    icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z" fill="white"/>
                                        </svg>
                                    }
                                    onClick={handleAddItem}
                                    bgColor="bg-primary"
                                    hoverColor="hover:bg-primary/90"
                                    textColor="text-white"
                                />
                            </div>

                            <div className="mt-4 flex-1 overflow-y-auto scrollbar-hide">
                            <Table
                                headers={tableHeaders}
                                data={tableData.map((item, index) => ({
                                    ...item,
                                    no: index + 1,
                                    aksi: getActionButtons(item)
                                }))}
                            />
                            </div>
                        </div>
                    </div>
                )}

            {showFormModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">
                                {formType === 'add' ? `Tambah ${selectedCategory.title}` : `Edit ${selectedCategory.title}`}
                            </h3>
                            <button onClick={() => setShowFormModal(false)} className="text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <Input
                                label={`Nama ${selectedCategory.title}`}
                                value={formData}
                                onChange={(value) => setFormData(value)}
                                required='true'
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowFormModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleFormSubmit}
                                disabled={!formData.trim()}
                                className={`px-4 py-2 rounded-md ${
                                    !formData.trim() 
                                        ? 'bg-gray-300 cursor-not-allowed' 
                                        : 'bg-primary hover:bg-primary/90'
                                } text-white`}
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

                {isLoading && (
                    <Spinner/>
                )}

                {isAlertSuccess && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data Berhasil Ditambahkan/Diperbaharui"
                        confirmLabel="Ok"
                        onConfirm={() => setAlertSucc(false)}
                    />
                )}

                {isAlertDel && (
                    <Alert
                        title="Hapus Data"
                        description="Apakah kamu yakin ingin menghapus data ini?"
                        confirmLabel="Hapus"
                        cancelLabel="Kembali"
                        onConfirm={handleConfirmDel}
                        onCancel={() => setAlertDel(false)}
                        open={isAlertDel}
                        onClose={() => setAlertDel(false)}
                    />
                )}

                {isAlertSuccDel && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data Berhasil Dihapus"
                        confirmLabel="Ok"
                        onConfirm={() => setAlertDelSucc(false)}
                    />
                )}

                {isErrorAlert && (
                <AlertError
                    title="Gagal!!"
                    description={errorMessage}
                    confirmLabel="Ok"
                    onConfirm={() => setErrorAlert(false)}
                />
                )}
            </div>
        </LayoutWithNav>
    );
}