import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import moment from "moment";
import Button from "../../../components/Button";
import Table from "../../../components/Table";
import ButtonDropdown from "../../../components/ButtonDropdown";
import { menuHeadGudang, menuItems, userOptions } from "../../../data/menu";
import LayoutWithNav from "../../../components/LayoutWithNav";
import { useNavigate } from "react-router-dom";
import InputDropdown from "../../../components/InputDropdown";
import api from "../../../utils/api";

export default function Dashboard(){

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [selectedStore, setSelectedStore] = useState("Semua");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const [kategoriBarang, setKategoriBarang] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const monthValue = `${selectedYear}-${selectedMonth}`;

    const [dashboardData, setDashboardData] = useState({
      barang_handmade: { nama: '-', jumlah: 0 },
      barang_non_handmade: { nama: '-', jumlah: 0 },
      packging: { nama: '-', jumlah: 0 },
      barang_custom: { nama: '-', jumlah: 0 }
    });

      const getDateRange = (year, month) => {
        const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
        const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
        return { startDate, endDate };
      };
      

    const handleMonthChange = (e) => {
      const value = e.target.value; 
      const [year, month] = value.split('-');
      setSelectedMonth(month);
      setSelectedYear(year);
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

  const mapKategoriToJenis = (kategori) => {

    if (isHeadGudang) {
      switch (kategori) {
        case "Handmade":
          return "Barang Handmade";
        case "Non Handmade":
          return "Barang Non-Handmade";
        case "Custom":
          return "Barang Mentah"; 
        case "Packaging":
          return "Packaging";
        default:
          return kategori;
      }
    } else {
      switch (kategori) {
        case "Handmade":
          return "Barang Handmade";
        case "Non Handmade":
          return "Barang Non-Handmade";
        case "Custom":
          return "Barang Custom"; 
        case "Packaging":
          return "Packaging";
        default:
          return kategori;
      }
    }
  };

  const fetchTopEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/karyawan/terbaik?bulan=${selectedMonth}&tahun=${selectedYear}`);
      
      if (response.data.success) {
        const baseUrl = import.meta.env.VITE_API_URL;

        const transformedEmployees = response.data.data.map(employee => ({
          Foto: employee.Image 
            ? `${baseUrl}/images-karyawan/${employee.Image}` 
            : 'https://via.placeholder.com/150',
          Nama: employee.nama_karyawan,
          KPI: employee.kpi,
          cabang: employee.cabang || '-'
        }));
        
        setData(prevData => ({
          ...prevData,
          karyawan_terbaik: transformedEmployees
        }));
      }
    } catch (error) {
      console.error('Error fetching top employees data:', error);

    } finally {
      setLoading(false);
    }
  };

  const fetchManagerProductData = async () => {
    try {
      setLoading(true);
      const monthMapping = {
        'January': '01', 'February': '02', 'March': '03', 'April': '04',
        'May': '05', 'June': '06', 'July': '07', 'August': '08',
        'September': '09', 'October': '10', 'November': '11', 'December': '12'
      };
      
      const formattedMonth = monthMapping[selectedMonth] || selectedMonth;
      
      const response = await api.get(`/produk-penjualan/terlaris?bulan=${formattedMonth}&tahun=${selectedYear}`);
      
      if (response.data.success) {
        const transformedData = {
          produk_terlaris: {
            data_handmade: {
              data: []
            },
            data_non_handmade: {
              data: []
            },
            data_custom: {
              data: []
            }
          }
        };
        
        const baseUrl = api.defaults.baseURL || '';

        response.data.data.forEach((product) => {
          // Basic product object
          const productObj = {
            id: product.id,
            Nama: product.name,
            Kategori: product.kategori,
            Jenis: mapKategoriToJenis(product.kategori),
            Terjual: product.total_terjual,
            Tanggal: moment().format("YYYY-MM-DD"),
            Cabang: "Semua",
  
            image: product.image ? `${baseUrl}/images-barang/${product.image}` : null
          };
          
          if (product.kategori === "Handmade") {
            transformedData.produk_terlaris.data_handmade.data.push(productObj);
          } else if (product.kategori === "Non Handmade") {
            transformedData.produk_terlaris.data_non_handmade.data.push(productObj);
          } else if (product.kategori === "Custom" || product.kategori === "Packaging") {
            transformedData.produk_terlaris.data_custom.data.push(productObj);
          }
        });

        setData(prevData => ({
          ...prevData,
          produk_terlaris: transformedData.produk_terlaris
        }));
      }
    } catch (error) {
      console.error('Error fetching manager product data:', error);
    } finally {
      setLoading(false);
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
    if (isManajer) {
      fetchManagerProductData();
      fetchTopEmployees();
      fetchKategoriBarang();  
    } else if (isHeadGudang) {
      fetchDashboardData();
      fetchKategoriBarang();
    }
  }, [selectedMonth, selectedYear, isManajer, isHeadGudang]);

  useEffect(() => {
    setSelectedStore("Semua");
  }, []);

    const [data, setData] = useState(
      isHeadGudang ? {
          barang_terlaris: {
              handmade: {
                  nama: 'Mutiara Hitam',
                  jumlah: 100001
              },
              non_handmade: {
                  nama: 'Gelang Besi',
                  jumlah: 502
              },
              custom: {
                  nama: 'Butiran Bulan',
                  jumlah: 12033
              },
              packaging: {
                  nama:'Zipper',
                  jumlah: 1200
              },
          },
          produk_terlaris: {
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
          },
          karyawan_terbaik: [
            { Foto: 'https://via.placeholder.com/150', Nama: 'Nadini Annisa Byant', KPI: 80, cabang: 'Lubeg' },
            { Foto: 'https://via.placeholder.com/150', Nama: 'Nadini Annisa Byant', KPI: 80, cabang: 'Lubeg' },
            { Foto: 'https://via.placeholder.com/150', Nama: 'Nadini Annisa Byant', KPI: 80, cabang: 'Gor Agus' },
          ]
      } : {
          cabang_terlaris: {
              keuntungan: {
                  nama_toko: 'Tatitatu',
                  jumlah: 10000000
              },
              pemasukan: {
                  nama_toko: 'Rumah Produksi',
                  jumlah: 65000000
              },
              pengeluaran: {
                  nama_toko: 'Tatitatu',
                  jumlah: 100000000
              },
              barang: {
                  nama_barang:'Bonifade',
                  jumlah: 1200
              },
          },
          produk_terlaris: {
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
          },
          karyawan_terbaik: [
            { Foto: 'https://via.placeholder.com/150', Nama: 'Nadini Annisa Byant', KPI: 80, cabang: 'Lubeg' },
            { Foto: 'https://via.placeholder.com/150', Nama: 'Nadini Annisa Byant', KPI: 80, cabang: 'Lubeg' },
            { Foto: 'https://via.placeholder.com/150', Nama: 'Nadini Annisa Byant', KPI: 80, cabang: 'Gor Agus' },
          ]
      }
  );

  function formatNumberWithDots(number) {
    if (number === undefined || number === null) {
        return '0';
    }
    return number.toLocaleString('id-ID');
}
    
    const headers = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Kategori", key: "Kategori", align: "text-left" },
        { label: "Jenis", key: "Jenis", align: "text-left" },
        { label: "Terjual", key: "Terjual", align: "text-left" },
    ];

    const filteredData = () => {
      let dataToDisplay = [];
    
      if (!data.produk_terlaris) {
        return [];
      }
      if (selectedJenis === "Semua") {
        dataToDisplay = [
          ...(data.produk_terlaris.data_handmade?.data || []),
          ...(data.produk_terlaris.data_non_handmade?.data || []),
          ...(data.produk_terlaris.data_custom?.data || []),
        ];
      } else if (selectedJenis === "Handmade" || selectedJenis === "Barang Handmade") {
        dataToDisplay = data.produk_terlaris.data_handmade?.data || [];
      } else if (selectedJenis === "Non Handmade" || selectedJenis === "Barang Non-Handmade") {
        dataToDisplay = data.produk_terlaris.data_non_handmade?.data || [];
      } else if (selectedJenis === "Custom" || selectedJenis === "Barang Custom" || selectedJenis === "Mentah") {
        dataToDisplay = (data.produk_terlaris.data_custom?.data || []).filter(item => 
          item.Kategori !== "Packaging" && item.Jenis !== "Packaging"
        );
      } else if (selectedJenis === "Packaging") {
        dataToDisplay = (data.produk_terlaris.data_custom?.data || []).filter(item => 
          item.Kategori === "Packaging" || item.Jenis === "Packaging"
        );
      }
    
      if (selectedKategori !== "Semua") {
        dataToDisplay = dataToDisplay.filter(item => 
          item.Kategori === selectedKategori || 
          item.Kategori?.toLowerCase() === selectedKategori.toLowerCase()
        );
      }
    
      return dataToDisplay;
    };
    
    const filterFields = [
      {
        label: "Jenis",
        key: "Jenis",
        options: isHeadGudang ? [
          { label: "Semua", value: "Semua" },
          { label: "Handmade", value: "Handmade" },
          { label: "Non Handmade", value: "Non Handmade" },
          { label: "Mentah", value: "Mentah" }, 
          { label: "Packaging", value: "Packaging" }
        ] : [
          { label: "Semua", value: "Semua" },
          { label: "Handmade", value: "Handmade" },
          { label: "Non Handmade", value: "Non Handmade" },
          { label: "Custom", value: "Custom" },
          { label: "Packaging", value: "Packaging" }
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
    ];
    
      const selectedData = filteredData().filter((item) => {
        const isStoreMatch = selectedStore === "Semua" || item.Cabang === selectedStore;
    
        return isStoreMatch
      });

      const headers2 = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "KPI", key: "KPI", align: "text-center" },
    ];

    const renderOverviewSection = () => {
      if (isHeadGudang) {
          return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Handmade Card */}
                  <div className="w-full">
                      <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                          <div className="flex-1">
                            <p className="text-gray-400 text-sm">Barang Handmade Terlaris</p>
                                <p className="font-bold text-lg truncate">{dashboardData.barang_handmade.nama}</p>
                                <p>{formatNumberWithDots(dashboardData.barang_handmade.jumlah)} Pcs Terjual</p>
                          </div>
                          <div className="flex items-center justify-center ml-4">
                              <img src="/Dashboard Produk/handmade.svg" alt="handmade" />
                          </div>
                      </div>
                  </div>
  
                  {/* Non-Handmade Card */}
                  <div className="w-full">
                      <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                          <div className="flex-1">
                            <p className="text-gray-400 text-sm">Barang Non-Handmade Terlaris</p>
                                <p className="font-bold text-lg truncate">{dashboardData.barang_non_handmade.nama}</p>
                                <p>{formatNumberWithDots(dashboardData.barang_non_handmade.jumlah)} Pcs Terjual</p>
                          </div>
                          <div className="flex items-center justify-center ml-4">
                              <img src="/Dashboard Produk/nonhandmade.svg" alt="nonhandmade" />
                          </div>
                      </div>
                  </div>
  
                  {/* Custom Card */}
                  <div className="w-full">
                      <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                          <div className="flex-1">
                                <p className="text-gray-400 text-sm">Barang Mentah Terlaris</p>
                                <p className="font-bold text-lg truncate">{dashboardData.barang_custom.nama}</p>
                                <p>{formatNumberWithDots(dashboardData.barang_custom.jumlah)} Pcs Terjual</p>
                          </div>
                          <div className="flex items-center justify-center ml-4">
                              <img src="/Dashboard Produk/custom.svg" alt="custom" />
                          </div>
                      </div>
                  </div>
  
                  {/* Packaging Card */}
                  <div className="w-full">
                      <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                          <div className="flex-1">
                              <p className="text-gray-400 text-sm">Packaging Terlaris</p>
                                <p className="font-bold text-lg truncate">{dashboardData.packging.nama}</p>
                                <p>{formatNumberWithDots(dashboardData.packging.jumlah)} Pcs Terjual</p>
                          </div>
                          <div className="flex items-center justify-center ml-4">
                              <img src="/Dashboard Produk/packaging.svg" alt="packaging" />
                          </div>
                      </div>
                  </div>
              </div>
          );
      }
  
      // Admin View
      return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Keuntungan Card */}
              <div className="w-full">
                  <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                      <div className="flex-1">
                          <p className="text-gray-400 text-sm">Keuntungan Terbanyak</p>
                          <p className="font-bold text-lg">{data.cabang_terlaris.keuntungan.nama_toko}</p>
                          <p className="">Rp{formatNumberWithDots(data.cabang_terlaris.keuntungan.jumlah)}</p>
                      </div>
                      <div className="flex items-center justify-center ml-4">
                          <img src="/keuangan/keuntungan.svg" alt="keuntungan" />
                      </div>
                  </div>
              </div>
  
              {/* Pemasukan Card */}
              <div className="w-full">
                  <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                      <div className="flex-1">
                          <p className="text-gray-400 text-sm">Pemasukan Terbanyak</p>
                          <p className="font-bold text-lg">{data.cabang_terlaris.pemasukan.nama_toko}</p>
                          <p className="">Rp{formatNumberWithDots(data.cabang_terlaris.pemasukan.jumlah)}</p>
                      </div>
                      <div className="flex items-center justify-center ml-4">
                          <img src="/keuangan/pemasukan.svg" alt="pemasukan" />
                      </div>
                  </div>
              </div>
  
              {/* Pengeluaran Card */}
              <div className="w-full">
                  <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                      <div className="flex-1">
                          <p className="text-gray-400 text-sm">Pengeluaran Terbanyak</p>
                          <p className="font-bold text-lg">{data.cabang_terlaris.pengeluaran.nama_toko}</p>
                          <p className="">Rp{formatNumberWithDots(data.cabang_terlaris.pengeluaran.jumlah)}</p>
                      </div>
                      <div className="flex items-center justify-center ml-4">
                          <img src="/keuangan/pengeluaran.svg" alt="pengeluaran" />
                      </div>
                  </div>
              </div>
  
              {/* Barang Custom Card */}
              <div className="w-full">
                  <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                      <div className="flex-1">
                          <p className="text-gray-400 text-sm">Barang Custom Terlaris</p>
                          <p className="font-bold text-lg">{data.cabang_terlaris.barang.nama_barang}</p>
                          <p className="">{formatNumberWithDots(data.cabang_terlaris.barang.jumlah)}</p>
                      </div>
                      <div className="flex items-center justify-center ml-4">
                          <img src="/keuangan/produkterjual.svg" alt="produk" />
                      </div>
                  </div>
              </div>
          </div>
      );
  };

    return(
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
            <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                    <p className="text-primary text-base font-bold">Overview</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
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
                </section>

                {/* cabang Terlaris */}
                <section className="mt-5">
                  {!isHeadGudang && (
                      <div className="w-full p-4 rounded-lg flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                              <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1.77506 2.27503C1.54232 2.73795 1.42787 3.31146 1.19899 4.4559L0.430023 8.30071C0.321042 8.82494 0.320198 9.36589 0.427543 9.89045C0.534887 10.415 0.74816 10.9122 1.05431 11.3514C1.36045 11.7907 1.75303 12.1629 2.20801 12.4452C2.66299 12.7274 3.17079 12.9139 3.70033 12.9931C4.22987 13.0723 4.77001 13.0426 5.28768 12.9059C5.80534 12.7691 6.28965 12.5281 6.71094 12.1976C7.13224 11.8672 7.48166 11.4542 7.73781 10.984C7.99396 10.5138 8.15146 9.99633 8.20066 9.46316L8.29067 8.57589C8.24194 9.14019 8.31145 9.70845 8.49478 10.2444C8.6781 10.7803 8.97119 11.272 9.35534 11.6883C9.73948 12.1045 10.2062 12.436 10.7257 12.6616C11.2453 12.8873 11.8061 13.002 12.3725 12.9986C12.9389 12.9952 13.4984 12.8737 14.0151 12.6418C14.5319 12.4099 14.9946 12.0728 15.3737 11.652C15.7528 11.2312 16.0399 10.7359 16.2168 10.1978C16.3936 9.65975 16.4563 9.0907 16.4008 8.52703L16.4947 9.46316C16.5439 9.99633 16.7014 10.5138 16.9575 10.984C17.2137 11.4542 17.5631 11.8672 17.9844 12.1976C18.4057 12.5281 18.89 12.7691 19.4076 12.9059C19.9253 13.0426 20.4654 13.0723 20.995 12.9931C21.5245 12.9139 22.0323 12.7274 22.4873 12.4452C22.9423 12.1629 23.3349 11.7907 23.641 11.3514C23.9472 10.9122 24.1604 10.415 24.2678 9.89045C24.3751 9.36589 24.3743 8.82494 24.2653 8.30071L23.4963 4.4559C23.2674 3.31146 23.153 2.73924 22.9202 2.27503C22.6777 1.79158 22.3363 1.36454 21.918 1.02161C21.4998 0.67868 21.0141 0.427534 20.4925 0.284472C19.991 0.146881 19.4072 0.146881 18.2396 0.146881H6.45571C5.28812 0.146881 4.70432 0.146881 4.20283 0.284472C3.68123 0.427534 3.19554 0.67868 2.77729 1.02161C2.35904 1.36454 2.01758 1.79158 1.77506 2.27503ZM20.4089 14.9346C21.4136 14.9372 22.4019 14.6798 23.2777 14.1875V15.5776C23.2777 20.4267 23.2777 22.8518 21.7707 24.3576C20.5581 25.5715 18.7514 25.8068 15.5624 25.8531V21.3641C15.5624 20.1618 15.5624 19.5613 15.3039 19.1138C15.1346 18.8206 14.8912 18.5771 14.598 18.4078C14.1505 18.1493 13.55 18.1493 12.3477 18.1493C11.1453 18.1493 10.5448 18.1493 10.0973 18.4078C9.80415 18.5771 9.56068 18.8206 9.39139 19.1138C9.13293 19.5613 9.13293 20.1618 9.13293 21.3641V25.8531C5.94392 25.8068 4.13725 25.5702 2.92465 24.3576C1.41759 22.8518 1.41759 20.4267 1.41759 15.5776V14.1875C2.29381 14.68 3.28256 14.9374 4.28769 14.9346C5.77372 14.9356 7.20442 14.371 8.28939 13.3555C9.39489 14.3744 10.8443 14.9383 12.3477 14.9346C13.851 14.9383 15.3004 14.3744 16.4059 13.3555C17.4909 14.371 18.9229 14.9356 20.4089 14.9346Z" fill="#7B0C42"/>
                              </svg>
                          </div>
                          <h2 className="text-lg font-bold text-[#93025F]">
                            {isOwner || isManajer ? 'Toko Terlaris' : 'Cabang Terlaris'}
                          </h2>
                      </div>
                  )}
                </section>
                
                <section className="mt-2 bg-white rounded-xl">
                    <div className="p-5">
                        {renderOverviewSection()}
                    </div>
                </section>

                    <section className="mt-5">
                        {!isHeadGudang && (
                            <section className="">
                                <div className="w-full p-4 rounded-lg flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                                        <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19.0394 8.51902L23.4846 5.98925C23.307 5.81169 23.0941 5.66994 22.8343 5.52768L14.4994 0.775846C13.7665 0.3617 13.0567 0.136719 12.3475 0.136719C11.6383 0.136719 10.929 0.361195 10.1955 0.775342L7.79592 2.13431L19.0394 8.51902ZM12.3475 12.3144L17.3959 9.45325L6.19987 3.05693L1.86066 5.52819C1.60037 5.66943 1.388 5.81169 1.20993 5.98925L12.3475 12.3144ZM13.1516 25.8632C13.2343 25.8395 13.3049 25.8042 13.3882 25.7573L22.6452 20.4839C23.7448 19.8574 24.3477 19.2187 24.3477 17.5046V8.29455C24.3477 7.93992 24.3123 7.65592 24.2533 7.39614L13.1516 13.7329V25.8632ZM11.5434 25.8632V13.7329L0.442679 7.39614C0.376717 7.69081 0.344896 7.99209 0.347844 8.29404V17.5046C0.347844 19.2187 0.950651 19.8574 2.05033 20.4839L11.3078 25.7568C11.3906 25.8042 11.4607 25.8395 11.5434 25.8632Z" fill="#7B0C42"/>
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold text-[#93025F]">Produk Terlaris</h2>
                                </div>                
                            </section>
                        )}
                        <div className="flex flex-wrap md:flex-nowrap md:space-x-4 lg:space-x-4">
                            {/* produk terlaris */}

                            <div className="w-full bg-white rounded-xl p-5">
                              <Table
                                  headers={headers}
                                  data={selectedData.map((item, index) => ({
                                      ...item,
                                      nomor: index + 1,
                                      image: item.image ? (
                                          <div className="w-12 h-12 flex items-center justify-center">
                                              <img 
                                                  src={item.image}
                                                  alt={item.Nama}
                                                  className="w-full h-full object-cover rounded"
                                                  onError={(e) => {
                                                      e.target.src = '/placeholder-image.jpg';
                                                  }}
                                              />
                                          </div>
                                      ) : (
                                          <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded">
                                              <span className="text-gray-400 text-xs">No image</span>
                                          </div>
                                      ),
                                      Terjual: `${item.Terjual} Pcs`,
                                  }))}
                                  hasFilter={true}
                                  onFilterClick={handleFilterClick}
                              />
                            </div>

                            <div className="w-full bg-white rounded-xl p-5">
                                <p className="font-bold">
                                  {isOwner || isManajer ? '10 Karyawan Terbaik Perusahaan' : '10 Karyawan Terbaik Toko'}
                                </p>
                                <Table
                                    headers={headers2}
                                    data={data.karyawan_terbaik.map((item, index) => ({
                                        ...item,
                                        "Foto": <img src={item["Foto"]} className="w-12 h-12 rounded-full object-cover" />,
                                        nomor: index + 1,
                                        KPI: `${formatNumberWithDots(item.KPI)}%`,
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

            {/* Filter Modal */}
        {/* {isFilterModalOpen && (
            <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
              <div className="relative flex flex-col items-start p-6 space-y-4 border w-full bg-white rounded-lg shadow-md max-w-lg">
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold mb-4">Filter</h2>
                <form className="w-full" onSubmit={(e) => { e.preventDefault(); handleApplyFilter(); }}>
                  {filterFields.map((field, index) => (
                    <div className="mb-4" key={index}>
                      <label className="block text-gray-700 font-medium mb-2">
                        {field.label}
                      </label>
                      <ButtonDropdown
                        options={field.options}
                        selectedStore={field.key === "Jenis" ? selectedJenis : selectedKategori}
                        onSelect={(value) => field.key === "Jenis" ? setSelectedJenis(value) : setSelectedKategori(value)}
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="py-2 px-4 w-full bg-primary text-white rounded-md hover:bg-white hover:border hover:border-primary hover:text-black focus:outline-none"
                  >
                    Terapkan
                  </button>
                </form>
              </div>
            </div>
          )} */}
        </LayoutWithNav>
        </>
    )
}