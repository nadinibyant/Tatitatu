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

export default function ProdukTerlaris() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isHeadGudang = userData?.role === 'headgudang';
  const isAdminGudang = userData?.role === 'admingudang'
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedJenis, setSelectedJenis] = useState("Semua");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [selectedStore, setSelectedStore] = useState("Semua");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
  const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
  const [barangTerlaris, setBarangTerlaris] = useState([]);
  const [topBarangTerlaris, setTopBarangTerlaris] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    barang_handmade: { nama: '-', jumlah: 0 },
    barang_non_handmade: { nama: '-', jumlah: 0 },
    packging: { nama: '-', jumlah: 0 },
    barang_custom: { nama: '-', jumlah: 0 }
  });
  const [productData, setProductData] = useState([]);
  const [kategoriBarang, setKategoriBarang] = useState([]);
  const [storeData, setStoreData] = useState([]);

  const fetchKategoriBarang = async () => {
    try {
      const endpoint = isManajer ? '/kategori-barang' : '/kategori-barang-gudang';
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setKategoriBarang(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching kategori barang:', error);
      setKategoriBarang([]);
    }
  };

  const getFilteredCategories = () => {
    const baseOptions = [{ label: "Semua", value: "Semua" }];

    if (selectedStore === "Semua") {
      const uniqueCategories = new Set();
      const uniqueCategoryOptions = [];
      
      kategoriBarang.forEach(kategori => {
        if (!uniqueCategories.has(kategori.nama_kategori_barang)) {
          uniqueCategories.add(kategori.nama_kategori_barang);
          uniqueCategoryOptions.push({
            label: kategori.nama_kategori_barang,
            value: kategori.nama_kategori_barang
          });
        }
      });
      
      return [...baseOptions, ...uniqueCategoryOptions];
    } 

    else {
      const selectedStoreObj = storeData.find(store => store.value === selectedStore);
      if (!selectedStoreObj || !selectedStoreObj.id) {
        return baseOptions;
      }
      
      const selectedTokoId = selectedStoreObj.id;
      
      const filteredCategories = kategoriBarang
        .filter(kategori => kategori.toko_id === selectedTokoId)
        .map(kategori => ({
          label: kategori.nama_kategori_barang,
          value: kategori.nama_kategori_barang
        }));
      
      return [...baseOptions, ...filteredCategories];
    }
  };
  const fetchStoreData = async () => {
    try {
      if (isManajer) {
        const response = await api.get('/toko');
        
        if (response.data.success) {
          const stores = [
            { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg', id: null },
            ...response.data.data.map(store => ({
              label: store.nama_toko,
              value: store.nama_toko,
              icon: '/icon/toko.svg',
              id: store.toko_id 
            }))
          ];
          setStoreData(stores);
        }
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
      setStoreData([
        { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg', id: null }
      ]);
    }
  };
  
  useEffect(() => {
    if (isAdminGudang || isHeadGudang || isManajer) {
      fetchKategoriBarang();
    }

    if (isManajer) {
      fetchStoreData();
    }
  }, []);

  const monthValue = `${selectedYear}-${selectedMonth}`;

  const handleMonthChange = (e) => {
    const value = e.target.value; 
    const [year, month] = value.split('-');
    setSelectedMonth(month);
    setSelectedYear(year);
  };  

  const getDateRange = (year, month) => {
    const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
    const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
    return { startDate, endDate };
  };
  

  const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });

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

  const getImagePath = (kategori) => {
    switch(kategori) {
      case 'Handmade':
        return 'images-barang-handmade';
      case 'Non Handmade':
      case 'NonHandmade':
        return 'images-barang-non-handmade';
      case 'Packaging':
        return 'images-packaging';
      case 'Mentah':
      case 'Bahan Mentah':
        return 'images-barang-mentah';
      case 'Custom':
        return 'images-barang-custom';
      default:
        return 'images-barang-handmade';
    }
  };  

  const fetchProductData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      const response = await api.get(`/produk-penjualan-gudang/terlaris?startDate=${startDate}&endDate=${endDate}`);
      
      if (response.data.success) {
        const { data } = response.data;
        const tableData = [];

        if (data.handmade) {
          tableData.push({
            nomor: tableData.length + 1,
            Nama: data.handmade.nama,
            Kategori: "Handmade",
            Jenis: "Handmade",
            Terjual: data.handmade.total_terjual
          });
        }
        
        if (data.nonhandmade) {
          tableData.push({
            nomor: tableData.length + 1,
            Nama: data.nonhandmade.nama,
            Kategori: "Non Handmade",
            Jenis: "Non Handmade",
            Terjual: data.nonhandmade.total_terjual
          });
        }
  
        if (data.packaging) {
          tableData.push({
            nomor: tableData.length + 1,
            Nama: data.packaging.nama,
            Kategori: "Packaging",
            Jenis: "Packaging",
            Terjual: data.packaging.total_terjual
          });
        }
  
        if (data.mentah) {
          tableData.push({
            nomor: tableData.length + 1,
            Nama: data.mentah.nama,
            Kategori: "Mentah",
            Jenis: "Mentah",
            Terjual: data.mentah.total_terjual
          });
        }
  
        setProductData(tableData);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      setProductData([]);
    }
  };

  const fetchBarangTerlaris = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      const response = await api.get(`/produk-penjualan-gudang/topten?startDate=${startDate}&endDate=${endDate}`);
      
      if (response.data.success) {
        const formattedData = response.data.data.map((item, index) => ({
          nomor: index + 1,
          "Foto": (
            <img 
              src={`${import.meta.env.VITE_API_URL}/${getImagePath(item.kategori)}/${item.image}`}
              className="w-8 h-8 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = "/api/placeholder/64/64";
              }}
            />
          ),
          "Nama Barang": item.nama,
          "Terjual": `${formatNumberWithDots(item.total_terjual)} Pcs`
        }));
        setBarangTerlaris(formattedData);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
      setBarangTerlaris([]);
    }
  };
  
  // Function to fetch top 10 products data for manager/owner
  const fetchTopBarangTerlaris = async () => {
    try {
      if (isOwner || isManajer) {
        const response = await api.get(`/produk-penjualan/terlaris?bulan=${selectedMonth}&tahun=${selectedYear}`);
        
        if (response.data.success) {
          const formattedData = response.data.data.map((item, index) => ({
            nomor: index + 1,
            "Foto": (
              <img 
                src={`${import.meta.env.VITE_API_URL}/${getImagePath(item.kategori)}/${item.image}`}
                className="w-8 h-8 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = "/api/placeholder/64/64";
                }}
              />
            ),
            "Nama Barang": item.name,
            "Terjual": `${formatNumberWithDots(item.total_terjual)} Pcs`
          }));
          setTopBarangTerlaris(formattedData);
        }
      }
    } catch (error) {
      console.error('Error fetching top company products:', error);
      setTopBarangTerlaris([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      const response = await api.get(`/produk-penjualan-gudang/terlaris?startDate=${startDate}&endDate=${endDate}`);
      
      if (response.data.success) {
        const { data } = response.data;
        setDashboardData({
          barang_handmade: data.handmade ? {
            nama: data.handmade.nama,
            jumlah: data.handmade.total_terjual
          } : { nama: '-', jumlah: 0 },
          barang_non_handmade: data.nonhandmade ? {
            nama: data.nonhandmade.nama,
            jumlah: data.nonhandmade.total_terjual
          } : { nama: '-', jumlah: 0 },
          packging: data.packaging ? {
            nama: data.packaging.nama,
            jumlah: data.packaging.total_terjual
          } : { nama: '-', jumlah: 0 },
          barang_custom: data.mentah ? {
            nama: data.mentah.nama,
            jumlah: data.mentah.total_terjual
          } : { nama: '-', jumlah: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        barang_handmade: { nama: '-', jumlah: 0 },
        barang_non_handmade: { nama: '-', jumlah: 0 },
        packging: { nama: '-', jumlah: 0 },
        barang_custom: { nama: '-', jumlah: 0 }
      });
    }
  };

  useEffect(() => {
    if (isAdminGudang || isHeadGudang) {
      fetchDashboardData();
      fetchBarangTerlaris();
      fetchProductData();
    }
    
    if (isOwner || isManajer) {
      fetchTopBarangTerlaris();
    }
  }, [selectedMonth, selectedYear]);

  // Default data if API fails
  const defaultStoreCabang = [
    { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' },
    { label: 'Gor Agus', value: 'Gor Agus', icon: '/icon/toko.svg' },
    { label: 'Lubeg', value: 'Lubeg', icon: '/icon/toko.svg' },
  ];

  // Use storeData if manager and it exists, otherwise use default data
  const dataCabang = isManajer && storeData.length > 0 ? storeData : defaultStoreCabang;

  const data = {
    dashboard: {
        barang_handmade: {
          nama: 'Mutiara Hitam',
          jumlah: 100
        },
        barang_non_handmade: {
          nama: 'Gelang Besi',
          jumlah: 500
        },
        packging: {
          nama: 'Zipper',
          jumlah: 12000
        },
        barang_custom: {
          nama: 'Butiran Debu',
          jumlah: 10000
        },
    },
    data_handmade: {
        data: [
          {
            id: 1,
            Nama: "Mutiara Hitam",
            Kategori: "Gelang",
            id_kategori: 1,
            Jenis: "Barang Handmade",
            id_jenis: 1,
            Terjual: 100,
            Tanggal: "2024-12-12",
            Cabang: "Gor Agus"
          },
          {
            id: 2,
            Nama: "Mutiara Hitam",
            Kategori: "Gelang",
            id_kategori: 1,
            Jenis: "Barang Handmade",
            id_jenis: 1,
            Terjual: 100,
            Tanggal: "2024-12-13",
            Cabang: "Lubeg"
          },
          {
            id: 3,
            Nama: "Mutiara Hitam",
            Kategori: "Gelang",
            id_kategori: 1,
            Jenis: "Barang Handmade",
            id_jenis: 1,
            Terjual: 100,
            Tanggal: "2024-12-14",
            Cabang: "Gor Agus"
          },
        ]
      },
      data_non_handmade: {
        data: [
          {
            id: 1,
            Nama: "Gelang Besi",
            Kategori: "Gelang",
            id_kategori: 1,
            Jenis: "Barang Non-Handmade",
            id_jenis: 2,
            Terjual: 150,
            Tanggal: "2024-12-12",
            Cabang: "Lubeg"
          },
        ]
      },
      data_custom: {
        data: [
          {
            id: 1,
            Nama: "Butiran Debu",
            Kategori: "Packaging",
            id_kategori: 3,
            Jenis: "Barang Custom",
            id_jenis: 3,
            Terjual: 200,
            Tanggal: "2024-12-12",
            Cabang: "Gor Agus"
          },
        ]
    },
    barang_terlaris: [
      {
        Foto: 'https://via.placeholder.com/150',
        "Nama Barang": 'Mutiara Hitam',
        Terjual: 6000,
        Tanggal: "2024-12-12",
        Cabang: "Gor Agus"
      },
      {
        Foto: 'https://via.placeholder.com/150',
        "Nama Barang": 'Gelang Besi',
        Terjual: 1000,
        Tanggal: "2024-12-13",
        Cabang: "Lubeg"
      }
    ]
  };

  const headers = [
    { label: "#", key: "nomor", align: "text-left" },
    { label: "Nama", key: "Nama", align: "text-left" },
    { label: "Kategori", key: "Kategori", align: "text-left" },
    { label: "Jenis", key: "Jenis", align: "text-left" },
    { label: "Terjual", key: "Terjual", align: "text-left" },
  ];

  const headers2 = [
    { label: "#", key: "nomor", align: "text-left" },
    { label: "Foto", key: "Foto", align: "text-left" },
    { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
    { label: "Terjual", key: "Terjual", align: "text-left" },
  ]

  const filteredData = () => {
    let dataToDisplay = [];

    if (selectedJenis === "Semua") {
      dataToDisplay = [
        ...data.data_handmade.data,
        ...data.data_non_handmade.data,
        ...data.data_custom.data,
      ];
    } else if (selectedJenis === "Barang Handmade") {
      dataToDisplay = data.data_handmade.data;
    } else if (selectedJenis === "Barang Non-Handmade") {
      dataToDisplay = data.data_non_handmade.data;
    } else if (selectedJenis === "Barang Custom") {
      dataToDisplay = data.data_custom.data;
    }

    if (selectedKategori !== "Semua") {
      dataToDisplay = dataToDisplay.filter(item => item.Kategori === selectedKategori);
    }

    return dataToDisplay;
  };

  const filterFields = isOwner ? [
    {
      label: "Kategori",
      key: "Kategori",
      options: [
        { label: "Semua", value: "Semua" },
        { label: "Gelang", value: "Gelang" },
        { label: "Cincin", value: "Cincin" },
        { label: "Anting", value: "Anting" },
        { label: "Tas", value: "Tas" },
      ]
    }
  ] : isManajer ? [
    {
      label: "Kategori",
      key: "Kategori",
      options: getFilteredCategories()
    }
  ] : (isAdminGudang || isHeadGudang) ? [
    {
      label: "Jenis",
      key: "Jenis",
      options: [
        { label: "Semua", value: "Semua" },
        { label: "Handmade", value: "Handmade" },
        { label: "Non Handmade", value: "Non Handmade" },
        { label: "Mentah", value: "Mentah" },
        { label: "Packaging", value: "Packaging" },
      ]
    },
    {
      label: "Kategori",
      key: "Kategori",
      options: [
        { label: "Semua", value: "Semua" },
        ...kategoriBarang.map(kategori => ({
          label: kategori.nama_kategori_barang,
          value: kategori.nama_kategori_barang
        }))
      ]
    }
  ] : [
    {
      label: "Jenis",
      key: "Jenis",
      options: [
        { label: "Semua", value: "Semua" },
        { label: "Barang Handmade", value: "Barang Handmade" },
        { label: "Barang Non-Handmade", value: "Barang Non-Handmade" },
        { label: "Barang Custom", value: "Barang Custom" },
      ]
    },
    {
      label: "Kategori",
      key: "Kategori",
      options: [
        { label: "Semua", value: "Semua" },
        { label: "Gelang", value: "Gelang" },
        { label: "Cincin", value: "Cincin" },
        { label: "Anting", value: "Anting" },
        { label: "Tas", value: "Tas" },
      ]
    }
  ];

  useEffect(() => {
    if (isManajer) {
      setSelectedKategori("Semua");
    }
  }, [selectedStore]);

  const selectedData = filteredData().filter((item) => {
    const isStoreMatch = selectedStore === "Semua" || item.Cabang === selectedStore;

    return isStoreMatch
  });

  function formatNumberWithDots(number) {
    if (number === null || number === undefined || isNaN(number)) {
      return '0'; 
    }
    return number.toLocaleString('id-ID');
  }

  return (
    <>
      <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
        <div className="p-5">
          <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
            <div className="left w-full md:w-auto">
              <p className="text-primary text-base font-bold">
                  {isOwner || isManajer ? 'Produk Terlaris Perusahaan' : 'Produk Terlaris'}
              </p>
            </div>

            <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
              {!isAdminGudang && (
                <div className="w-full md:w-auto">
                  {/* <Button 
                    label="Export" 
                    icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                    </svg>} 
                    bgColor="border border-secondary" 
                    hoverColor="hover:bg-white" 
                    textColor="text-black" 
                  /> */}
                </div>
              )}
              {/* ButtonDropdown for stores visible for manager or roles that aren't headgudang or admingudang */}
              {(!isHeadGudang && !isAdminGudang) && (
                <div className="w-full md:w-auto">
                  <ButtonDropdown 
                    selectedIcon={'/icon/toko.svg'} 
                    options={dataCabang} 
                    onSelect={(value) => setSelectedStore(value)} 
                  />
                </div>
              )}
              <div className="w-full md:w-auto">
                              <input
                                    type="month"
                                        value={`${selectedYear}-${selectedMonth}`}
                                        onChange={(e) => {
                                            const date = moment(e.target.value);
                                            setSelectedMonth(date.format('MM'));
                                            setSelectedYear(date.format('YYYY'));
                                        }}
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

          <section className="mt-5 bg-white rounded-xl">
            <div className="p-5">
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* handmade */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-sm">Barang Handmade Terlaris</p>
                                <p className="font-bold text-lg truncate">{dashboardData.barang_handmade.nama}</p>
                                <p>{formatNumberWithDots(dashboardData.barang_handmade.jumlah)} Pcs</p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <img src="/Dashboard Produk/handmade.svg" alt="handmade" className="w-12 h-12" />
                            </div>
                        </div>
                    </div>

                    {/* non handmade */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-sm">Barang Non-Handmade Terlaris</p>
                                <p className="font-bold text-lg truncate">{dashboardData.barang_non_handmade.nama}</p>
                                <p>{formatNumberWithDots(dashboardData.barang_non_handmade.jumlah)} Pcs</p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <img src="/Dashboard Produk/nonhandmade.svg" alt="nonhandmade" className="w-12 h-12" />
                            </div>
                        </div>
                    </div>

                    {/* packaging atau custom */}
                    <div className="w-full">
                      <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-sm">
                            {isManajer ? 'Barang Custom Terlaris' : 'Packaging Terlaris'}
                          </p>
                          <p className="font-bold text-lg truncate">
                            {isManajer ? dashboardData.barang_custom.nama : dashboardData.packging.nama}
                          </p>
                          <p>
                            {formatNumberWithDots(isManajer ? dashboardData.barang_custom.jumlah : dashboardData.packging.jumlah)} Pcs
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <img 
                            src={isManajer ? "/Dashboard Produk/custom.svg" : "/Dashboard Produk/packaging.svg"}
                            alt={isManajer ? "Custom" : "packaging"} 
                            className="w-12 h-12" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* custom mentah */}
                    <div className="w-full">
                      <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-sm">
                            {isManajer ? 'Barang Mentah Terlaris' : 'Barang Mentah Terlaris'}
                          </p>
                          <p className="font-bold text-lg truncate">{dashboardData.barang_custom.nama}</p>
                          <p>{formatNumberWithDots(dashboardData.barang_custom.jumlah)} Pcs</p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <img src="/Dashboard Produk/custom.svg" alt="Custom" className="w-12 h-12" />
                        </div>
                      </div>
                    </div>
                </div>
            </div>
        </section>


          <section className="mt-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5">
                    <Table
                      headers={headers}
                      data={isAdminGudang ? productData.map(item => ({
                          ...item,
                          Terjual: `${formatNumberWithDots(item.Terjual)} Pcs`,
                      })) : selectedData.map((item, index) => ({
                          ...item,
                          nomor: index + 1,
                          Terjual: `${item.Terjual} Pcs`,
                      }))}
                      hasFilter={!isAdminGudang}
                      onFilterClick={handleFilterClick}
                    />
                  </div>

                  <div className="bg-white rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base">
                            {isOwner || isManajer? '10 Barang Terlaris di Perusahaan' : '10 Barang Terlaris di Toko'}
                        </h3>
                      </div>
                      <Table
                        headers={headers2}
                        data={(isAdminGudang || isHeadGudang) ? barangTerlaris : (isOwner || isManajer) ? topBarangTerlaris : data.barang_terlaris.map((item, index) => ({
                          ...item,
                          "Foto": <img src={item["Foto"]} className="w-8 h-8 object-cover rounded-lg" />,
                          nomor: index + 1,
                          Terjual: `${formatNumberWithDots(item.Terjual)} Pcs`,
                        }))}
                        bg_header="bg-none"
                        text_header="text-gray-400"
                        hasSearch={false}
                        hasPagination={false}
                      />
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