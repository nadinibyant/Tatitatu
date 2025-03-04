import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Table from "../../../components/Table";
import ButtonDropdown from "../../../components/ButtonDropdown";
import LayoutWithNav from "../../../components/LayoutWithNav";
import InputDropdown from "../../../components/InputDropdown";
import { X } from "lucide-react";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";

export default function StokBarang() {
    const headers = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Jenis", key: "Jenis", align: "text-left" },
        { label: "Kategori", key: "Kategori", align: "text-left" },
        { label: "Jumlah Stok", key: "Jumlah Stok", align: "text-left" },
    ];

    const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const [selectedStore, setSelectedStore] = useState("Semua");
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';
    const isHeadGudang = userData?.role === 'headgudang'
    const isKasirToko = userData?.role === 'kasirtoko'
    const [stokData, setStokData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cabangData, setCabangData] = useState([]);
    const [cabangMapping, setCabangMapping] = useState({});
    const [selectedItemDetail, setSelectedItemDetail] = useState(null);
    const toko_id = userData.userId
    const cabang_id = userData.userId

    const themeColor = (isAdminGudang || isHeadGudang) ? "coklatTua" : "primary";

    const exportIcon = (isAdminGudang || isHeadGudang) ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
          <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#71503D"/>
        </svg>
      ) : (
        <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
        </svg>
      );

    const getDetailEndpoint = (item) => {
        if (item.barang_handmade_id) return `/barang-handmade/${item.barang_handmade_id}`;
        if (item.barang_non_handmade_id) return `/barang-non-handmade/${item.barang_non_handmade_id}`;
        if (item.barang_custom_id) return `/barang-custom/${item.barang_custom_id}`;
        if (item.packaging_id) return `/packaging/${item.packaging_id}`;
        return null;
    };

    const fetchItemDetail = async (item) => {
        const endpoint = getDetailEndpoint(item);
        if (!endpoint) return;
    
        try {
            const response = await api.get(endpoint);
            if (response.data.success) {
                setSelectedItemDetail(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching item detail:', error);
        }
    };    
    
    const [cabangOptions, setCabangOptions] = useState([
        { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' }
    ]);

    const [kategoriOptions, setKategoriOptions] = useState([
        { label: "Semua", value: "Semua" }
    ]);
    const [jenisOptions, setJenisOptions] = useState([
        { label: "Semua", value: "Semua" }
    ]);

    const fetchCabangData = async () => {
        if (!isAdminGudang) {
            try {
                const response = await api.get(`/cabang?toko_id=${toko_id}`);
                if (response.data.success) {
                    const cabangMap = response.data.data.reduce((acc, cabang) => {
                        acc[cabang.nama_cabang] = cabang.cabang_id;
                        return acc;
                    }, {});
 
                    setCabangMapping(cabangMap);
    
                    const cabangOpts = response.data.data.map(cabang => ({
                        label: cabang.nama_cabang,  
                        value: cabang.nama_cabang, 
                        icon: '/icon/toko.svg'
                    }));
                    
                    setCabangOptions([
                        { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' },
                        ...cabangOpts
                    ]);
                }
            } catch (error) {
                console.error('Error fetching cabang data:', error);
            }
        }
    };

    const getCabangName = (cabangId) => {
        const cabang = cabangData.find(c => c.cabang_id === cabangId);
        return cabang ? cabang.nama_cabang : `Cabang ${cabangId}`;
    };

    const fetchKategoriOptions = async () => {
        if (!isAdminGudang) {
            try {
                const response = await api.get(`/kategori-barang?toko_id=${toko_id}`);
                if (response.data.success) {
                    const kategoriOpts = response.data.data
                        .filter(item => !item.is_deleted)
                        .map(item => ({
                            label: item.nama_kategori_barang,
                            value: item.nama_kategori_barang
                        }));
                    setKategoriOptions([{ label: "Semua", value: "Semua" }, ...kategoriOpts]);
                }
            } catch (error) {
                console.error('Error fetching kategori options:', error);
            }
        }
    };

    const getJenisBarang = (item) => {
        if (item.barang_handmade_id) return "Handmade";
        if (item.barang_non_handmade_id) return "Non Handmade";
        if (item.barang_custom_id) return "Custom";
        if (item.packaging_id) return "Packaging";
        return "-";
    };

    const getBarangId = (item) => {
        return item.barang_handmade_id || 
               item.barang_non_handmade_id || 
               item.barang_custom_id || 
               item.packaging_id || 
               "-";
    };

    const transformStokGudang = (data) => {
        return data
            .filter(item => !item.is_deleted)
            .map((item) => {
                const barangData = item.barang;
                let jenisBarang = "-";
                let kategoriBarang = "-";
                let barangId = "-";
                let namaBarang = "-";

                if (barangData.barang_handmade_id) {
                    jenisBarang = barangData.jenis?.nama_jenis_barang || "Handmade";
                    barangId = barangData.barang_handmade_id;
                    kategoriBarang = barangData.kategori?.nama_kategori_barang || "-";
                    namaBarang = barangData.nama_barang;
                } else if (barangData.barang_nonhandmade_id) {
                    jenisBarang = barangData.jenis?.nama_jenis_barang || "Non Handmade";
                    barangId = barangData.barang_nonhandmade_id;
                    kategoriBarang = barangData.kategori?.nama_kategori_barang || "-";
                    namaBarang = barangData.nama_barang;
                } else if (barangData.barang_mentah_id) {
                    jenisBarang = "Mentah";
                    barangId = barangData.barang_mentah_id;
                    namaBarang = barangData.nama_barang;
                } else if (barangData.packaging_id) {
                    jenisBarang = "Packaging";
                    barangId = barangData.packaging_id;
                    namaBarang = barangData.nama_packaging;
                }

                return {
                    Nomor: barangId,
                    "Nama Barang": namaBarang,
                    Jenis: jenisBarang,
                    Kategori: kategoriBarang,
                    "Jumlah Stok": item.jumlah_stok,
                    image: barangData.image,
                    barang_handmade_id: barangData.barang_handmade_id,
                    barang_nonhandmade_id: barangData.barang_nonhandmade_id,
                    barang_mentah_id: barangData.barang_mentah_id,
                    packaging_id: barangData.packaging_id
                };
            });
    };
    
    const fetchStokData = async () => {
        try {
            setLoading(true);
            
            if (isAdminGudang) {
                const response = await api.get('/stok-barang-gudang');
                if (response.data.success) {
                    const transformedData = transformStokGudang(response.data.data);
                    setStokData(transformedData);
                }
            } else if (isKasirToko) {
                const response = await api.get(`/stok-barang?cabang=${cabang_id}`);
                if (response.data.success) {
                    setStokData(response.data.data.filter(item => !item.is_deleted));
                }
            } else {
                const response = await api.get('/stok-barang');
                if (response.data.success) {
                    setStokData(response.data.data.filter(item => !item.is_deleted));
                }
            }
        } catch (error) {
            console.error('Error fetching stok data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBarangName = (item) => {
        if (item.barang_handmade) return item.barang_handmade.nama_barang;
        if (item.barang_non_handmade) return item.barang_non_handmade.nama_barang;
        if (item.barang_custom) return item.barang_custom.nama_barang;
        if (item.packaging) return item.packaging.nama_packaging;
        return "-";
    };
    
    const getBarangKategori = (item) => {
        if (item.barang_handmade) return item.barang_handmade.kategori_barang.nama_kategori_barang;
        if (item.barang_non_handmade) return item.barang_non_handmade.kategori.nama_kategori_barang;
        if (item.barang_custom) return item.barang_custom.kategori.nama_kategori_barang;
        if (item.packaging) return item.packaging.kategori_barang.nama_kategori_barang;
        return "-";
    };
    
    const getBarangJenis = (item) => {
        if (item.barang_handmade) return item.barang_handmade.jenis_barang.nama_jenis_barang;
        if (item.barang_non_handmade) return item.barang_non_handmade.jenis.nama_jenis_barang;
        if (item.barang_custom) return item.barang_custom.jenis_barang.nama_jenis_barang;
        if (item.packaging) return item.packaging.jenis_barang.nama_jenis_barang;
        return "-";
    };

    const filteredData = () => {
        if (isAdminGudang) {
            return stokData.filter(item => {
                if (selectedJenis !== "Semua") {
                    // Match the jenis value exactly as it comes from the API
                    if (item.Jenis !== selectedJenis) return false;
                }
                if (selectedKategori !== "Semua" && item.Kategori !== selectedKategori) return false;
                return true;
            });
        } else {
            let filteredData = [...stokData];
            if (selectedStore !== "Semua") {
                filteredData = filteredData.filter(item => 
                    item.cabang?.nama_cabang === selectedStore
                );
            }
            const groupedData = filteredData.reduce((acc, item) => {
                const barangId = getBarangId(item);
                const existingItem = acc.find(i => getBarangId(i) === barangId);
        
                const formattedItem = {
                    Nomor: barangId,
                    "Nama Barang": getBarangName(item),
                    Jenis: getBarangJenis(item),
                    Kategori: getBarangKategori(item),
                    "Jumlah Stok": item.jumlah_stok,
                    stok_barang_id: item.stok_barang_id,
                    cabang_id: item.cabang_id,
                    barang_handmade_id: item.barang_handmade_id,
                    barang_non_handmade_id: item.barang_non_handmade_id,
                    barang_custom_id: item.barang_custom_id,
                    packaging_id: item.packaging_id,
                    image: item.barang_handmade?.image || 
                        item.barang_non_handmade?.image || 
                        item.barang_custom?.image || 
                        item.packaging?.image,
                    cabang: [{
                        nama: item.cabang?.nama_cabang,
                        stok: item.jumlah_stok,
                        cabang_id: item.cabang_id
                    }]
                };
        
                if (existingItem) {
                    existingItem["Jumlah Stok"] += item.jumlah_stok;
                    existingItem.cabang.push({
                        nama: item.cabang?.nama_cabang,
                        stok: item.jumlah_stok,
                        cabang_id: item.cabang_id
                    });
                } else {
                    acc.push(formattedItem);
                }
        
                return acc;
            }, []);
        
            return groupedData.filter(item => {
                if (selectedJenis !== "Semua" && item.Jenis !== selectedJenis) return false;
                if (selectedKategori !== "Semua" && item.Kategori !== selectedKategori) return false;
                return true;
            });
        }
    };
    
    useEffect(() => {
        const initializeData = async () => {
            await fetchFilterOptions();
            await fetchStokData();
            
            if (!isAdminGudang) {
                await fetchCabangData();
                await fetchKategoriOptions();
            }
        };

        initializeData();
    }, [isAdminGudang]);

    const fetchFilterOptions = async () => {
        try {
            if (isAdminGudang) {
                // Fetch jenis options from the API for admin gudang
                const jenisResponse = await api.get('/jenis-barang-gudang');
                if (jenisResponse.data.success) {
                    const jenisOpts = jenisResponse.data.data
                        .filter(item => !item.is_deleted)
                        .map(item => ({
                            label: item.nama_jenis_barang,
                            value: item.nama_jenis_barang,
                            id: item.jenis_barang_id // Add ID for export functionality
                        }));
                    setJenisOptions([{ label: "Semua", value: "Semua" }, ...jenisOpts]);
                }

                // Fetch kategori options for admin gudang
                const kategoriResponse = await api.get('/kategori-barang-gudang');
                if (kategoriResponse.data.success) {
                    const kategoriOpts = kategoriResponse.data.data
                        .filter(item => !item.is_deleted)
                        .map(item => ({
                            label: item.nama_kategori_barang,
                            value: item.nama_kategori_barang,
                            id: item.kategori_barang_id // Add ID for export functionality
                        }));
                    setKategoriOptions([{ label: "Semua", value: "Semua" }, ...kategoriOpts]);
                }
            } else {
                // For non-admin gudang users, set default jenis options
                setJenisOptions([
                    { label: "Semua", value: "Semua" },
                    { label: "Handmade", value: "Handmade" },
                    { label: "Non Handmade", value: "Non Handmade" },
                    { label: "Custom", value: "Custom" },
                    { label: "Packaging", value: "Packaging" },
                ]);
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    const handleFilterClick = (event) => {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setFilterPosition({
        top: buttonRect.bottom + window.scrollY + 5,
        left: buttonRect.left + window.scrollX
      });
      setIsFilterModalOpen(prev => !prev);
    };
  
    const handleApplyFilter = () => {
      setIsFilterModalOpen(false);
    };


    const handleRowClick = async (row) => {
        setSelectedItem(row);
        await fetchItemDetail(row);
        setIsDetailModalOpen(true);
    };

    const getImagePath = (item) => {
        if (item.barang_handmade_id) return '/images-barang-handmade/';
        if (item.barang_non_handmade_id) return '/images-barang-non-handmade/';
        if (item.barang_custom_id) return '/images-barang-custom/';
        if (item.packaging_id) return '/images-packaging/';
        return '';
    };

    const getImageUrl = (imagePath, item) => {
        if (!imagePath) return "/placeholder-image.jpg";
        const basePath = getImagePath(item);
        return `${import.meta.env.VITE_API_URL}${basePath}${imagePath}`;
    };

    const rincianStokHeaders = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Cabang", key: "Cabang", align: "text-left" },
        { label: "Jumlah Stok", key: "Jumlah Stok", align: "text-left" }
    ];

    const filterFields = [
        {
            label: "Jenis",
            key: "Jenis", 
            options: jenisOptions
        },
        {
            label: "Kategori",
            key: "Kategori",
            options: kategoriOptions 
        }
    ];

    const handleExport = async () => {
        try {
            let endpoint = '/stok-barang/export';
            let params = {};
            
            if (isAdminGudang) {
                endpoint = '/stok-barang-gudang/export';
                
                // Add query parameters for kategori and jenis if they are selected
                if (selectedKategori !== "Semua") {
                    // Find the kategori_barang_id from the kategoriOptions
                    const selectedKategoriOption = kategoriOptions.find(option => option.value === selectedKategori);
                    if (selectedKategoriOption && selectedKategoriOption.id) {
                        params.kategori_barang_id = selectedKategoriOption.id;
                    }
                }
                
                if (selectedJenis !== "Semua") {
                    // Find the jenis_barang_id from the jenisOptions
                    const selectedJenisOption = jenisOptions.find(option => option.value === selectedJenis);
                    if (selectedJenisOption && selectedJenisOption.id) {
                        params.jenis_barang_id = selectedJenisOption.id;
                    }
                }
            } else if (isKasirToko) {
                params = { cabang: cabang_id, toko_id: toko_id };
            } else {
                params = { toko_id: toko_id };
                
                if (selectedStore !== "Semua") {
                    params.cabang = cabangMapping[selectedStore];
                }
            }
            
            // Build the full URL to display for debugging
            const queryString = new URLSearchParams(params).toString();
            const fullUrl = `${import.meta.env.VITE_API_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
            console.log('Export URL:', fullUrl);
    
            const response = await api.get(endpoint, {
                params,
                responseType: 'blob'
            });
    
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = window.URL.createObjectURL(blob);
    
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Stok_Barang_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
    
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        {/* Left Section */}
                        <div className="left w-full md:w-auto">
                            <p className={`text-${themeColor} text-base font-bold`}>Stok Barang</p>
                        </div>

                        {/* Right Section */}
                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button
                                    label="Export"
                                    icon={exportIcon}
                                    bgColor="border border-secondary"
                                    hoverColor={`hover:border-${themeColor}`}
                                    textColor="text-black"
                                    onClick={handleExport}
                                />
                            </div>

                            {(!isKasirToko && !isAdminGudang) && (
                                <div className="w-full md:w-auto">
                                    <ButtonDropdown 
                                        selectedIcon={'/icon/toko.svg'} 
                                        options={cabangOptions} 
                                        onSelect={(value) => setSelectedStore(value)} 
                                    />
                                </div>
                            )}
                        
                        </div>
                    </section>

                    <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        {loading ? (
                            <Spinner/>
                        ) : (
                            <Table
                                headers={headers}
                                data={filteredData().map(item => ({
                                    ...item,
                                    "Jumlah Stok": `${item["Jumlah Stok"].toLocaleString('id-ID')} Pcs`
                                }))}
                                hasFilter={true}
                                onFilterClick={handleFilterClick}
                                onRowClick={isAdminGudang ? undefined : handleRowClick}
                            />
                        )}
                    </div>
                    </section>

                    {/* Filter Modal */}
                    {isFilterModalOpen && (
                    <>
                        <div 
                            className="fixed inset-0"
                            onClick={() => setIsFilterModalOpen(false)}
                        />
                        <div 
                            className="absolute bg-white rounded-lg shadow-lg p-4 w-80 z-50"
                            style={{ 
                                top: filterPosition.top,
                                left: filterPosition.left 
                            }}
                        >
                            <div className="space-y-4">
                                {filterFields.map((field) => (
                                    <InputDropdown
                                        key={field.key}
                                        label={field.label}
                                        options={field.options}
                                        value={field.key === "Jenis" ? selectedJenis : selectedKategori}
                                        onSelect={(value) => 
                                            field.key === "Jenis" 
                                                ? setSelectedJenis(value.value)
                                                : setSelectedKategori(value.value)
                                        }
                                        required={true}
                                    />
                                ))}
                                <button
                                    onClick={handleApplyFilter}
                                    className={`w-full bg-${themeColor} text-white py-2 px-4 rounded-lg hover:bg-opacity-90`}
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </>
                )}

{isDetailModalOpen && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg w-full max-w-3xl mx-4">
                            {/* Header with close button */}
                            <div className="flex justify-between items-center p-6">
                                <h2 className="text-xl font-semibold">{selectedItem["Nama Barang"]}</h2>
                                <button
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        setSelectedItemDetail(null); 
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Image Column */}
                                    <div>
                                        <img
                                            src={selectedItemDetail ? getImageUrl(selectedItemDetail.image, selectedItem) : "/placeholder-image.jpg"}
                                            alt={selectedItem["Nama Barang"]}
                                            className="w-full h-auto rounded-lg object-cover"
                                        />
                                    </div>

                                    {/* Details Columns */}
                                    <div className="col-span-2 grid grid-cols-2 gap-y-4">
                                        <div>
                                            <p className="text-gray-500">Nomor</p>
                                            <p className="font-medium">{selectedItem.Nomor}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Nama Barang</p>
                                            <p className="font-medium">{selectedItem["Nama Barang"]}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Jenis</p>
                                            <p className="font-medium">{selectedItem.Jenis}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Total Stok Keseluruhan</p>
                                            <p className="font-medium">{selectedItem["Jumlah Stok"]}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Rincian Stok Table */}
                                <div className="mt-8">
                                    <h3 className="font-bold mb-4">Rincian Stok</h3>
                                    <Table
                                        headers={rincianStokHeaders}
                                        data={selectedItem.cabang.map((item, index) => ({
                                            No: index + 1,
                                            Cabang: item.nama,
                                            "Jumlah Stok": item.stok.toLocaleString('id-ID')
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </LayoutWithNav>
        </>
    );
}