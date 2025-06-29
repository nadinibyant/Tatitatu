import { useEffect, useState } from "react";
import InputDropdown from "../../../../components/InputDropdown";
import Input from "../../../../components/Input";
import { useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Table from "../../../../components/Table";
import Button from "../../../../components/Button";
import Gallery2 from "../../../../components/Gallery2";
import AlertSuccess from "../../../../components/AlertSuccess";
import Spinner from "../../../../components/Spinner";
import FileInput from "../../../../components/FileInput";
import api from "../../../../utils/api";
import AlertError from "../../../../components/AlertError";

export default function TambahAbsensiProduksi() {
    const [tanggal, setTanggal] = useState(null);
    const [dataCabang, setDataCabang] = useState([
        { nama: "", data: [] }  
    ]);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';
    const karyawan_id = userData.userId
    const [selectedImage, setSelectedImage] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCabang, setActiveCabang] = useState(null);

    // Modal gallery state
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [handmadeItems, setHandmadeItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const isKaryawanProduksi = userData?.role === 'karyawanproduksi'
    const isManajer = userData?.role === 'manajer';
    const isKasirToko = userData?.role === 'kasirtoko';
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance';

    const themeColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const [handmadeRes, categoriesRes] = await Promise.all([
                    api.get('/barang-handmade-gudang'),
                    api.get('/kategori-barang-gudang')
                ]);
    
                const processedHandmadeItems = handmadeRes.data.data.map(item => ({
                    id: item.barang_handmade_id,
                    image: item.image ? `${import.meta.env.VITE_API_URL}/images-barang-handmade-gudang/${item.image}` : `https://via.placeholder.com/150?text=${encodeURIComponent(item.nama_barang)}`,
                    name: item.nama_barang,
                    code: item.barang_handmade_id,
                    price: item.harga_jual || 0,
                    kategori: item.kategori.nama_kategori_barang
                }));
    
                // Process categories
                const processedCategories = ["Semua", ...categoriesRes.data.data.map(cat => 
                    cat.nama_kategori_barang
                )];
    
                setHandmadeItems(processedHandmadeItems);
                setCategories(processedCategories);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching data:', err);
            } finally {
                setIsLoadingData(false);
            }
        };
    
        fetchData();
    }, []);

    const dataBarang = {
        kategori: categories,
        items: handmadeItems,
    };

    const getAllItems = () => {
        return handmadeItems.map(item => ({
            label: item.name,
            value: item.id,
            kategori: item.kategori,
            code: item.code,
            price: item.price
        }));
    };

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isModalOpen]);

    const breadcrumbItems = [
        { label: "Data Absensi", href: "/absensi-karyawan-produksi" },
        { label: "Tambah Absensi", href: "" },
    ]
    const headers = [
        { label: "No", key: "No", align: "text-left", width: "110px" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Jumlah", key: "Jumlah", align: "text-left", width:"120px" },
        { label: "Aksi", key: "Aksi", align: "text-left", width: "110px" }
    ];

    const btnAddBaris = (cabangIndex) => {
        setActiveCabang(cabangIndex);
        setIsModalOpen(true);
    };

    const handleSelectItem = (item, count) => {
        console.log('Selected item:', item, 'count:', count);
        
        setSelectedItems((prev) => {
            const updated = [...prev];
            const existingItemIndex = updated.findIndex((i) => i.id === item.id);
            
            if (existingItemIndex !== -1) {
                if (count === 0) {
                    return updated.filter((i) => i.id !== item.id);
                } else {
                    updated[existingItemIndex] = { ...item, count };
                }
            } else if (count > 0) {
                updated.push({ ...item, count });
            }
            
            return updated;
        });
    };

    const filteredItems = isLoadingData ? [] : dataBarang.items.filter(
        (item) =>
            (selectedCategory === "Semua" || item.kategori === selectedCategory) &&
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    

    const resetSelection = () => {
        setSelectedItems([]);
        setIsModalOpen(false);
    };

    const handleModalSubmit = () => {
        if (activeCabang !== null && selectedItems.length > 0) {
            const updatedCabang = [...dataCabang];
            const allItems = getAllItems();
    
            const newItems = selectedItems.map((item, index) => {
                const currentIndex = updatedCabang[activeCabang].data.length + index;
                return {
                    id: item.id,
                    No: currentIndex + 1,
                    "Nama Barang": (
                        <InputDropdown
                            showRequired={false}
                            options={allItems}
                            value={item.id}
                            onSelect={(newSelection) => handleDropdownChange(item.id, newSelection)}
                        />
                    ),
                    "Jumlah": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={item.count}
                            onChange={(newCount) => handleQuantityChange(item.id, newCount)}
                        />
                    ),
                    "Aksi": (
                        <button 
                            type="button" 
                            onClick={(e) => handleDeleteRow(e, activeCabang, currentIndex)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <p className="text-merah">Hapus</p>
                        </button>
                    ),
                    quantity: item.count,
                    name: item.name
                };
            });
    
            updatedCabang[activeCabang].data.push(...newItems);
            setDataCabang(updatedCabang);
        }
        setIsModalOpen(false);
        setSelectedItems([]);
    };


    const handleDropdownChange = (itemId, nextSelection) => {
        const updatedDataCabang = [...dataCabang];
        const rowIndex = updatedDataCabang[activeCabang].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            const allItems = getAllItems();
            
            const currentRow = updatedDataCabang[activeCabang].data[rowIndex];
            const existingQuantity = currentRow.quantity || 
                                    (currentRow["Jumlah"]?.props?.value) || 
                                    0;
            const updatedRow = {
                ...currentRow,
                id: nextSelection.value,
                quantity: existingQuantity, 
                "Nama Barang": (
                    <InputDropdown
                        showRequired={false}
                        options={allItems}
                        value={nextSelection.value}
                        onSelect={(newVal) => handleDropdownChange(itemId, newVal)}
                    />
                ),
                "Jumlah": (
                    <Input
                        showRequired={false}
                        type="number"
                        value={existingQuantity} 
                        onChange={(newCount) => handleQuantityChange(itemId, newCount)}
                    />
                ),
                name: nextSelection.label
            };
    
            updatedDataCabang[activeCabang].data[rowIndex] = updatedRow;
            setDataCabang(updatedDataCabang);
        }
    };
    
    const handleQuantityChange = (itemId, newCount) => {
        const updatedCabangCopy = [...dataCabang];
        const rowIndex = updatedCabangCopy[activeCabang].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            const currentRow = updatedCabangCopy[activeCabang].data[rowIndex];
            
            updatedCabangCopy[activeCabang].data[rowIndex] = {
                ...currentRow,
                quantity: newCount, 
                "Jumlah": (
                    <Input
                        showRequired={false}
                        type="number"
                        value={newCount}
                        onChange={(newerCount) => handleQuantityChange(itemId, newerCount)}
                    />
                )
            };
            
            setDataCabang(updatedCabangCopy);
        }
    };

    const handleDeleteRow = (e, cabangIndex, rowIndex) => {
        e.preventDefault();
        e.stopPropagation();
        
        const updatedDataCabang = [...dataCabang];
        updatedDataCabang[cabangIndex].data = updatedDataCabang[cabangIndex].data.filter((_, index) => index !== rowIndex);

        updatedDataCabang[cabangIndex].data = updatedDataCabang[cabangIndex].data.map((item, idx) => ({
            ...item,
            No: idx + 1
        }));
        
        setDataCabang(updatedDataCabang);
    };

    const navigate = useNavigate();

    const calculateTotalMenitAndJumlah = async (barangData) => {
        let totalMenit = 0;
        let totalJumlah = 0;
        
        try {
            for (const row of barangData) {
                if (!row.id) continue;
                
                const response = await api.get(`/barang-handmade-gudang/${row.id}`);
                const waktuPengerjaan = response.data.data.waktu_pengerjaan;
                
                const menitPerBarang = waktuPengerjaan * row.quantity;
                totalMenit += menitPerBarang;
                totalJumlah += row.quantity;
            }
            
            return { totalMenit, totalJumlah };
        } catch (error) {
            console.error('Error calculating totals:', error);
            throw error;
        }
    };

    const handleTambahSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (!selectedImage) {
                throw new Error('Mohon upload foto absen terlebih dahulu');
            }
    
            if (!tanggal) {
                throw new Error('Mohon pilih tanggal terlebih dahulu');
            }
    
            const barangData = dataCabang[0].data;
            if (!barangData || barangData.length === 0) {
                throw new Error('Mohon pilih minimal satu barang terlebih dahulu');
            }
    
            let currentLocation;
            try {
                currentLocation = await getCurrentLocation();
            } catch (geoErr) {
                setGeoError(geoErr.message);
                throw new Error(`Gagal mendapatkan lokasi: ${geoErr.message}. Mohon izinkan akses lokasi.`);
            }
    
            const formattedDate = new Date(tanggal).toISOString().split('T')[0];
            const { totalMenit, totalJumlah } = await calculateTotalMenitAndJumlah(barangData);
    
            const formData = new FormData();
            formData.append('image', selectedImage);
            formData.append('tanggal', formattedDate);
            formData.append('jumlah_produksi', totalJumlah);
            formData.append('total_menit', totalMenit);
            formData.append('karyawan_id', karyawan_id);
            
            if (currentLocation && currentLocation.lat && currentLocation.lng) {
                formData.append('lat', currentLocation.lat);
                formData.append('lng', currentLocation.lng);
                setCoordinates(currentLocation);
            } else {
                formData.append('lat', '0');
                formData.append('lng', '0');
            }
            
            barangData.forEach((row, index) => {
                formData.append(`produk[${index}][barang_handmade_id]`, row.id);
                formData.append(`produk[${index}][jumlah]`, row.quantity.toString());
            });
    
            await api.post('/produksi-gudang', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            setModalSucc(true);
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAcc = () => {
        setModalSucc(false);
        navigate('/absensi-karyawan-produksi');
    };

    const handleBatalTambah = () => {
        navigate('/absensi-karyawan-produksi')
    }


    return (
        <>
            <LayoutWithNav>
                <div className="p-5">
                    <Breadcrumbs items={breadcrumbItems} />
    
                    {/* Section Form Input */}
                    <section className="bg-white p-5 mt-5 rounded-xl">
                        <form onSubmit={handleTambahSubmit}>
                            <section>
                                <div className="">
                                    <div className="mb-6 text-start">
                                        <label className="block text-gray-700 font-medium mb-2">Foto Absen</label>
                                        <FileInput
                                            label="Masukan Foto Absen"
                                            onFileChange={(file) => setSelectedImage(file)}
                                            cameraOnly={true}
                                            alignment="start"
                                        />
                                        
                                    </div>

                                    {/* Input Tanggal */}
                                    <div className="mb-6">
                                        <Input 
                                            label="Tanggal" 
                                            type1="date"
                                            width="w-full"
                                            value={tanggal}
                                            onChange={(e) => setTanggal(e)}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="">
                                {dataCabang.map((cabang, index) => (
                                    <div key={index} className="">
                                        <p className="font-bold">{cabang.nama}</p>
                                        <div className="pt-5">
                                            <Table headers={headers} data={cabang.data} />
                                            <Button
                                                label="Tambah Baris"
                                                icon={
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                }
                                                onClick={() => btnAddBaris(index)}
                                                bgColor=""
                                                hoverColor={`hover:border-${themeColor} hover:border`}
                                                textColor={`text-${themeColor}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </section>
    
                            {/* section total dan submit*/}
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleBatalTambah} className="px-4 py-2 border rounded-lg">
                                    Batal
                                </button>
                                <button type="submit" className={`px-4 py-2 bg-${themeColor} text-white rounded-lg`}>
                                    Simpan
                                </button>
                            </div>
                        </form>
    
                        {isModalOpen && (
                            <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50 p-2 sm:p-4">
                                <div className={`bg-white border border-${themeColor} rounded-md p-3 sm:p-4 md:p-6 w-full max-w-7xl h-[90vh] flex flex-col`}>
                                    {/* Header Section - Search, Clear, Buttons */}
                                    <div className="flex-shrink-0 flex flex-col space-y-3 mb-3 sm:mb-4">
                                        {/* Input Search */}
                                        <div className="relative w-full">
                                            <span className="absolute inset-y-0 left-3 flex items-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-5 h-5 text-gray-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M20.707 19.293l-4.054-4.054A7.948 7.948 0 0016 9.5 8 8 0 108 17.5c1.947 0 3.727-.701 5.239-1.865l4.054 4.054a1 1 0 001.414-1.414zM10 15.5A6.5 6.5 0 1110 2a6.5 6.5 0 010 13.5z" />
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                placeholder="Cari Barang yang mau dibeli"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setSelectedItems([]);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-700 focus:outline-none"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <p className={`text-${themeColor} font-semibold`}>
                                                    Terpilih {selectedItems.reduce((sum, item) => sum + item.count, 0)}
                                                </p>
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex gap-3">
                                                <Button
                                                    label="Batal"
                                                    bgColor="border border-secondary"
                                                    hoverColor="hover:bg-gray-100"
                                                    textColor="text-black"
                                                    onClick={() => {
                                                        resetSelection();
                                                        setSelectedItems([]);
                                                    }}
                                                    className="flex-1 sm:flex-none"
                                                />
                                                <Button
                                                    label="Pilih"
                                                    bgColor={`bg-${themeColor}`}
                                                    hoverColor="hover:bg-opacity-90"
                                                    textColor="text-white"
                                                    onClick={handleModalSubmit}
                                                    className="flex-1 sm:flex-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {isLoadingData ? (
                                        <div className="flex justify-center items-center flex-grow">
                                            <Spinner />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col flex-grow overflow-hidden">
                                            <div className="flex-shrink-0 flex border-b border-gray-300 mb-3 overflow-x-auto hide-scrollbar">
                                                {["Barang Handmade"].map((jenis) => (
                                                    <button
                                                        key={jenis}
                                                        onClick={() => setSelectedJenis(jenis)}
                                                        className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                                                            selectedJenis === jenis ? `text-${themeColor} border-b-2 border-${themeColor}` : "text-gray-400"
                                                        }`}
                                                    >
                                                        {jenis}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex-shrink-0 overflow-x-auto hide-scrollbar mb-3">
                                                <div className="flex flex-nowrap gap-2 pb-1">
                                                    {categories.map((kategori) => (
                                                        <button
                                                            key={kategori}
                                                            onClick={() => setSelectedCategory(kategori)}
                                                            className={`px-3 py-1 text-sm rounded-md whitespace-nowrap flex-shrink-0 ${
                                                                selectedCategory === kategori
                                                                    ? `bg-${themeColor} text-white`
                                                                    : "border border-gray-300"
                                                            }`}
                                                        >
                                                            {kategori}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex-grow overflow-y-auto" style={{ minHeight: 0 }}>
                                                <Gallery2
                                                    items={filteredItems || []}
                                                    onSelect={handleSelectItem}
                                                    selectedItems={selectedItems}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <style jsx>{`
                                    .hide-scrollbar {
                                        -ms-overflow-style: none;  /* IE and Edge */
                                        scrollbar-width: none;  /* Firefox */
                                    }
                                    
                                    .hide-scrollbar::-webkit-scrollbar {
                                        display: none;  /* Chrome, Safari and Opera */
                                    }
                                `}</style>
                            </section>
                        )}
                    </section>
                </div>

                {/* modal success */}
                {isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil ditambahkan"
                        confirmLabel="Ok"
                        onConfirm={handleAcc}
                    />
                )}
    
                {isLoading && (
                    <Spinner/>
                )}

                    {error && (
                        <AlertError
                            title={'Failed'}
                            description={error}
                            onConfirm={() => setError(null)}
                        />
                    )}
            </LayoutWithNav>
        </>
    );
}