import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import LayoutWithNav from "../../../components/LayoutWithNav";
import InputDropdown from "../../../components/InputDropdown";
import api from "../../../utils/api";

export default function KaryawanTerbaik() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [selectedStore, setSelectedStore] = useState("Semua");
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const [storeData, setStoreData] = useState([]);
    const [topKaryawan, setTopKaryawan] = useState([]);
    const [karyawanData, setKaryawanData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const [divisions, setDivisions] = useState([]);

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
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isHeadGudang = userData?.role === 'headgudang';
    const isManajer = userData?.role === 'manajer';
    const isOwner = userData?.role === 'owner';

    const fetchStoreData = async () => {
        try {
            const response = await api.get('/toko');
            
            if (response.data.success) {
                const stores = [
                    { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg', id: '' },
                    ...response.data.data.map(store => ({
                        label: store.nama_toko,
                        value: store.nama_toko,
                        icon: '/icon/toko.svg',
                        id: store.toko_id
                    }))
                ];
                setStoreData(stores);
            }
        } catch (error) {
            console.error('Error fetching store data:', error);
            setStoreData([
                { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg', id: '' }
            ]);
        }
    };

    const fetchKaryawanData = async () => {
        try {
            const response = await api.get(`/absensi-karyawan/${selectedMonth}/${selectedYear}`);
            
            if (response.data.success) {
                // Process the data for the main table
                const formattedData = response.data.data.map(item => ({
                    id: item.karyawan.karyawan_id,
                    Nama: item.karyawan.nama_karyawan,
                    Toko: item.karyawan.toko.nama_toko,
                    Divisi: item.karyawan.divisi.nama_divisi,
                    KPI: item.totalPersentaseTercapai,
                    cabang: item.karyawan.cabang.nama_cabang,
                    toko_id: item.karyawan.toko_id
                }));
                
                // Extract unique divisions for filter
                const uniqueDivisions = [...new Set(formattedData.map(item => item.Divisi))];
                setDivisions(uniqueDivisions);
                
                setKaryawanData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching karyawan data:', error);
            setKaryawanData([]);
        }
    };

    const fetchTopKaryawan = async () => {
        try {
            let url = `/karyawan/terbaik?bulan=${selectedMonth}&tahun=${selectedYear}`;

            if (selectedStoreId) {
                url += `&toko_id=${selectedStoreId}`;
            }
            
            const response = await api.get(url);
            
            if (response.data.success) {
                const formattedData = response.data.data.map((item, index) => ({
                    nomor: index + 1,
                    "Foto": (
                        <img 
                            src={`${import.meta.env.VITE_API_URL}/images-karyawan/${item.Image}`}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                                e.target.src = "/api/placeholder/64/64";
                            }}
                        />
                    ),
                    "Nama": item.nama_karyawan,
                    "KPI": `${formatNumberWithDots(item.kpi)}%`
                }));
                setTopKaryawan(formattedData);
            }
        } catch (error) {
            console.error('Error fetching top karyawan data:', error);
            setTopKaryawan([]);
        }
    };

    useEffect(() => {
        if (!isHeadGudang) {
            fetchStoreData();
        }
        
        // Fetch karyawan data when component mounts
        fetchKaryawanData();
    }, []);

    useEffect(() => {
        fetchTopKaryawan();
        fetchKaryawanData();
    }, [selectedStoreId, selectedMonth, selectedYear]);

    const handleStoreSelect = (value, options) => {
        // Find the selected store
        const selectedStore = options.find(option => option.value === value);
        
        // Update the selected store ID
        setSelectedStoreId(selectedStore?.id || "");
        
        // Update the selected store value
        setSelectedStore(value);
    };

    const handleMonthChange = (e) => {
        const date = moment(e.target.value);
        setSelectedMonth(date.format('MM'));
        setSelectedYear(date.format('YYYY'));
    };

    useEffect(() => {
        setSelectedStore("Semua");
    }, []);

    const handleToday = () => {
        const today = moment().startOf("day");
        setStartDate(today.format("YYYY-MM-DD"));
        setEndDate(today.format("YYYY-MM-DD"));
        setIsModalOpen(false);
    };

    const handleLast7Days = () => {
        const today = moment().startOf("day");
        const sevenDaysAgo = today.clone().subtract(7, "days");
        setStartDate(sevenDaysAgo.format("YYYY-MM-DD"));
        setEndDate(today.format("YYYY-MM-DD"));
        setIsModalOpen(false);
    };

    const handleThisMonth = () => {
        const startMonth = moment().startOf("month");
        const endMonth = moment().endOf("month");
        setStartDate(startMonth.format("YYYY-MM-DD"));
        setEndDate(endMonth.format("YYYY-MM-DD"));
        setIsModalOpen(false);
    };

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });

    // Use storeData if it's available, otherwise use default data
    const dataCabang = storeData.length > 0 ? storeData : [
        { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' },
        { label: 'Gor Agus', value: 'Gor Agus', icon: '/icon/toko.svg' },
        { label: 'Lubeg', value: 'Lubeg', icon: '/icon/toko.svg' },
    ];

    const headers = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Toko", key: "Toko", align: "text-left" },
        { label: "Divisi", key: "Divisi", align: "text-left" },
        { label: "KPI", key: "KPI", align: "text-left" },
    ];

    const headers2 = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "KPI", key: "KPI", align: "text-left" },
    ];

    function formatNumberWithDots(number) {
        if (number === null || number === undefined || isNaN(number)) {
            return '0';
        }
        return Number(number).toLocaleString('id-ID');
    }

    const filterFields = [
        {
          label: "Divisi",
          key: "Divisi",
          options: [
            { label: "Semua", value: "Semua" },
            ...divisions.map(division => ({
              label: division,
              value: division
            }))
          ]
        },
    ];

    const filteredKaryawanData = () => {
        let filteredData = karyawanData;
   
        // Filter by division
        if (selectedKategori !== "Semua") {
            filteredData = filteredData.filter(item => item.Divisi === selectedKategori);
        }

        // Filter by store
        if (!isHeadGudang && selectedStore !== "Semua") {
            // If a store is selected in dropdown, filter by Toko field
            filteredData = filteredData.filter(item => item.Toko === selectedStore);
        }
    
        return filteredData;
    };

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Karyawan Terbaik</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            {!isHeadGudang && (
                                <div className="w-full md:w-auto">
                                    <ButtonDropdown 
                                        selectedIcon={'/icon/toko.svg'} 
                                        options={dataCabang} 
                                        onSelect={(value) => handleStoreSelect(value, dataCabang)}
                                    />
                                </div>
                            )}
                            <div className="w-full md:w-auto">
                                <input
                                    type="month"
                                    value={`${selectedYear}-${selectedMonth}`}
                                    onChange={handleMonthChange}
                                    className="w-full px-4 py-2 border border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5"
                                />
                            </div>
                        </div>

                        {/* Modal */}
                    {isModalOpen && (
                    <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                        <div className="relative flex flex-col items-start p-6 space-y-4 bg-white rounded-lg shadow-md max-w-lg">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex space-x-4 w-full">
                            <div className="flex flex-col w-full">
                            <label className="text-sm font-medium text-gray-600 pb-3">Dari</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            </div>
                            <div className="flex flex-col w-full">
                            <label className="text-sm font-medium text-gray-600 pb-3">Ke</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-3 w-full">
                            <button
                            onClick={handleToday}
                            className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                            >
                            Hari Ini
                            </button>
                            <button
                            onClick={handleLast7Days}
                            className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                            >
                            7 Hari Terakhir
                            </button>
                            <button
                            onClick={handleThisMonth}
                            className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                            >
                            Bulan Ini
                            </button>
                        </div>
                        </div>
                    </div>
                    )}
                    </section>

                    <section className="mt-5">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Main table */}
                            <div className="md:col-span-7 bg-white rounded-xl p-4">
                                <div className="overflow-x-auto">
                                    <Table
                                        headers={headers}
                                        data={filteredKaryawanData().map((item, index) => ({
                                            ...item,
                                            nomor: index + 1,
                                            KPI: `${formatNumberWithDots(item.KPI)}%`,
                                        }))}
                                        hasFilter={true}
                                        onFilterClick={handleFilterClick}
                                        className="min-w-full"
                                    />
                                </div>
                            </div>

                            {/* Top 10 table */}
                            <div className="lg:col-span-5 bg-white rounded-xl p-4">
                                <h3 className="font-bold text-lg mb-4">
                                    {isHeadGudang 
                                        ? "10 Karyawan Terbaik di Rumah Produksi"
                                        : selectedStore === "Semua" 
                                            ? "10 Karyawan Terbaik di Perusahaan"
                                            : `10 Karyawan Terbaik di ${selectedStore}`
                                    }
                                </h3>
                                <div className="overflow-x-auto">
                                    <Table
                                        headers={headers2}
                                        data={topKaryawan}
                                        bg_header="bg-none"
                                        text_header="text-gray-400"
                                        hasSearch={false}
                                        hasPagination={false}
                                        className="min-w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

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
                                    value={selectedKategori}
                                    onSelect={(value) => setSelectedKategori(value.value)}
                                    required={true}
                                />
                            ))}
                            <button
                                onClick={handleApplyFilter}
                                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </>
            )}
            </LayoutWithNav>
        </>
    );
}