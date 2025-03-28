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
    const isAdminGudang = userData?.role === 'adminGudang'
    const isManajer = userData?.role === 'manajer';
    const isOwner = userData?.role === 'owner';
    const isAdmin = userData?.role === 'admin'
    const isFinance = userData?.role === 'finance'
    const toko_id= userData?.userId

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

        const iconToko = (isManajer || isOwner || isFinance) 
        ? '/Icon Warna/toko_non.svg' 
        : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2))
          ? '/icon/toko_toko2.svg' 
          : '/icon/toko.svg';

    const fetchCabangData = async () => {
        try {
          if (isAdmin && toko_id) {
            const response = await api.get(`/cabang?toko_id=${toko_id}`);
            
            if (response.data.success) {
              const cabangOptions = [
                { label: 'Semua', value: 'Semua', icon: iconToko, id: '' },
                ...response.data.data.map(cabang => ({
                  label: cabang.nama_cabang,
                  value: cabang.nama_cabang,
                  icon: iconToko,
                  id: cabang.cabang_id
                }))
              ];
              setStoreData(cabangOptions);
            }
          }
        } catch (error) {
          console.error('Error fetching cabang data:', error);
          setStoreData([
            { label: 'Semua', value: 'Semua', icon: iconToko, id: '' }
          ]);
        }
      };

    const fetchStoreData = async () => {
        try {
            const response = await api.get('/toko');
            
            if (response.data.success) {
                const stores = [
                    { label: 'Semua', value: 'Semua', icon: iconToko, id: '' },
                    ...response.data.data.map(store => ({
                        label: store.nama_toko,
                        value: store.nama_toko,
                        icon: iconToko,
                        id: store.toko_id
                    }))
                ];
                setStoreData(stores);
            }
        } catch (error) {
            console.error('Error fetching store data:', error);
            setStoreData([
                { label: 'Semua', value: 'Semua', icon: iconToko, id: '' }
            ]);
        }
    };

    const fetchKaryawanData = async () => {
        try {
            let url;
            if (isHeadGudang) {
                url = `/absensi-karyawan/${selectedMonth}/${selectedYear}?toko_id=1`;
            } else if (isAdmin) {
                if (selectedStore === "Semua" || !selectedStoreId) {
                    url = `/absensi-karyawan/${selectedMonth}/${selectedYear}?toko_id=${toko_id}`;
                } else {
                    const cabangId = selectedStoreId;
                    console.log(cabangId)
                    if (cabangId) {
                        url = `/absensi-karyawan/${selectedMonth}/${selectedYear}?cabang=${cabangId}`;
                    } else {
                        url = `/absensi-karyawan/${selectedMonth}/${selectedYear}?toko_id=${toko_id}`;
                    }
                }
            } else {
                url = `/absensi-karyawan/${selectedMonth}/${selectedYear}`;
            }
            
            console.log("Fetching karyawan data with URL:", url);
            
            const response = await api.get(url);
            
            if (response.data.success) {
                console.log("API response:", response.data);
                
                let formattedData = response.data.data.map(item => ({
                    id: item.karyawan.karyawan_id,
                    Nama: item.karyawan.nama_karyawan,
                    Toko: item.karyawan.toko?.nama_toko || '-',
                    Divisi: item.karyawan.divisi?.nama_divisi || '-',
                    KPI: item.totalPersentaseTercapai,
                    cabang: item.karyawan.cabang?.nama_cabang || '-',
                    cabang_id: item.karyawan.cabang_id,
                    toko_id: item.karyawan.toko_id
                }));
                
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
            let url;
            
            if (isHeadGudang) {
                url = `/karyawan/terbaik?toko_id=1&bulan=${selectedMonth}&tahun=${selectedYear}`;
            } else if(isAdmin) {
                if (selectedStore === "Semua" || !selectedStoreId) {
                    url = `/karyawan/terbaik?toko_id=${toko_id}&bulan=${selectedMonth}&tahun=${selectedYear}`;
                } else {
                    url = `/karyawan/terbaik?bulan=${selectedMonth}&tahun=${selectedYear}&cabang=${selectedStoreId}`;
                }
            } else {
                url = `/karyawan/terbaik?bulan=${selectedMonth}&tahun=${selectedYear}`;
                if (selectedStoreId) {
                    url += `&toko_id=${selectedStoreId}`;
                }
            }
            
            console.log("Fetching top karyawan with URL:", url); 
            
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

    const fetchDivisions = async () => {
        try {
          const url = isHeadGudang 
            ? '/divisi-karyawan?toko_id=1' 
            : '/divisi-karyawan';
          
          const response = await api.get(url);
          
          if (response.data.success) {
            const divisionData = response.data.data.map(division => division.nama_divisi);
            
            setDivisions(divisionData);
          }
        } catch (error) {
          console.error('Error fetching divisions:', error);
          setDivisions([]);
        }
      };
      useEffect(() => {
        if (!isHeadGudang) {
          if (isAdmin && toko_id) {
            fetchCabangData();
          } else {
            fetchStoreData();
          }
        }
      
        fetchDivisions();
        fetchKaryawanData();
        fetchTopKaryawan();
      }, []);

    useEffect(() => {
        fetchTopKaryawan();
        fetchKaryawanData();
    }, [selectedStoreId, selectedMonth, selectedYear]);

    const handleStoreSelect = (value, options) => {
        const selectedOption = options.find(option => option.value === value);

        setSelectedStoreId(selectedOption?.id || "");
    
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

    const dataCabang = storeData.length > 0 ? storeData : [
        { label: 'Semua', value: 'Semua', icon: iconToko, id: '' },
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

        if (selectedKategori !== "Semua") {
            filteredData = filteredData.filter(item => item.Divisi === selectedKategori);
        }
    
        if (!isHeadGudang && selectedStore !== "Semua") {

            if (isAdmin) {
                filteredData = filteredData.filter(item => item.cabang === selectedStore);
            } else {
                filteredData = filteredData.filter(item => item.Toko === selectedStore);
            }
        }
    
        return filteredData;
    };

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className={`text-${themeColor} text-base font-bold`}>Karyawan Terbaik</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            {!isHeadGudang && (
                                <div className="w-full md:w-auto">
                                    <ButtonDropdown 
                                        selectedIcon={iconToko} 
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
                                    className={`w-full px-4 py-2 border hover:border-${themeColor} border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5`}
                                />
                            </div>
                        </div>

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
                                            ? "10 Karyawan Terbaik"
                                            : `10 Karyawan Terbaik di ${selectedStore}`
                                    }
                                </h3>
                                <div className="overflow-x-auto">
                                    <Table
                                        headers={headers2}
                                        data={topKaryawan}
                                        bg_header="bg-none"
                                        text_header="text-gray-400"
                                        hasSearch={true}
                                        hasPagination={true}
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
                                className={`w-full bg-${themeColor} text-white py-2 px-4 rounded-lg hover:bg-opacity-90`}
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