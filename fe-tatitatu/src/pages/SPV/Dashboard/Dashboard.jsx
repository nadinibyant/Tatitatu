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
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'
    const toko_id = userData?.userId
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

    const colorMap = {
      coklatTua: "text-coklatTua",
      biruTua: "text-biruTua",
      primary: "text-primary"
    };

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? "coklatTua" 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";

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

  const getImagePath = (kategori) => {
    if (isHeadGudang || isAdmin) {
      switch(kategori) {
        case 'Handmade':
          return 'images-barang-handmade-gudang';
        case 'Non Handmade':
        case 'Non-Handmade':
        case 'NonHandmade':
          return 'images-barang-non-handmade-gudang';
        case 'Packaging':
          return 'images-packaging-gudang';
        case 'Mentah':
        case 'Bahan Mentah':
        case 'Custom':
          return 'images-barang-mentah';
        default:
          return 'images-barang-handmade-gudang';
      }
    }
  
    switch(kategori) {
      case 'Handmade':
        return 'images-barang-handmade';
      case 'Non Handmade':
      case 'NonHandmade':
      case 'Non-Handmade':
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
      setLoading(true);
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      
      let endpoint;
      if (isHeadGudang) {
        endpoint = `/produk-penjualan/toko/terlaris?toko_id=1&startDate=${startDate}&endDate=${endDate}`;
      } else if (isAdmin) {
        endpoint = `/produk-penjualan/toko/terlaris?toko_id=${toko_id}&startDate=${startDate}&endDate=${endDate}`;
      } else if (isOwner || isManajer) {
        endpoint = `/produk-penjualan/toko/terlaris?toko_id=null&startDate=${startDate}&endDate=${endDate}`;
      } else {
        endpoint = `/produk-penjualan/toko/terlaris?startDate=${startDate}&endDate=${endDate}`;
      }
      
      console.log("Fetching product data with endpoint:", endpoint);
      
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const tableData = response.data.data.map((item, index) => ({
          nomor: index + 1,
          id: item.id,
          Nama: item.name || item.nama || '-',
          Kategori: item.kategori,
          Jenis: mapKategoriToJenis(item.kategori),
          Terjual: item.total_terjual,
          image: item.image ? `${import.meta.env.VITE_API_URL}/${getImagePath(item.kategori)}/${item.image}` : null
        }));
        
        setData(prevData => {
          const newData = { ...prevData };
          
          const handmadeData = [];
          const nonHandmadeData = [];
          const customData = [];
          const packagingData = [];
          
          tableData.forEach(item => {
            const productObject = {
              id: item.id,
              Nama: item.Nama,
              Kategori: item.Kategori,
              Jenis: item.Jenis,
              Terjual: item.Terjual,
              Tanggal: moment().format("YYYY-MM-DD"),
              Cabang: "-",
              image: item.image
            };
            
            if (item.Kategori === "Handmade") {
              handmadeData.push(productObject);
            } else if (item.Kategori === "Non Handmade" || item.Kategori === "Non-Handmade") {
              nonHandmadeData.push(productObject);
            } else if (item.Kategori === "Packaging") {
              packagingData.push(productObject);
            } else if (item.Kategori === "Custom" || item.Kategori === "Mentah" || item.Kategori === "Bahan Mentah") {
              customData.push(productObject);
            }
          });
  
          newData.produk_terlaris = {
            data_handmade: { data: handmadeData },
            data_non_handmade: { data: nonHandmadeData },
            data_custom: { data: [...customData, ...packagingData] }
          };
          
          return newData;
        });
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      setData(prevData => ({
        ...prevData,
        produk_terlaris: {
          data_handmade: { data: [] },
          data_non_handmade: { data: [] },
          data_custom: { data: [] }
        }
      }));
    } finally {
      setLoading(false);
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
        const dashboardObj = {
          barang_handmade: { nama: '-', jumlah: 0 },
          barang_non_handmade: { nama: '-', jumlah: 0 },
          packging: { nama: '-', jumlah: 0 },
          barang_custom: { nama: '-', jumlah: 0 } 
        };

        response.data.data.forEach(item => {
          switch (item.kategori) {
            case 'Handmade':
              dashboardObj.barang_handmade = { nama: item.name, jumlah: item.total_terjual };
              break;
            case 'Non Handmade':
            case 'Non-Handmade':
              dashboardObj.barang_non_handmade = { nama: item.name, jumlah: item.total_terjual };
              break;
            case 'Packaging':
              dashboardObj.packging = { nama: item.name, jumlah: item.total_terjual };
              break;
            case 'Mentah':
            case 'Bahan Mentah':
              dashboardObj.barang_custom = { nama: item.name, jumlah: item.total_terjual };
              break;
            default:
              break;
          }
        });
  
        setDashboardData(dashboardObj);
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

  const fetchHeadGudangEmployees = async () => {
    try {
      setLoading(true); 
      const response = await api.get(`/karyawan/terbaik?toko_id=${toko_id}&bulan=${selectedMonth}&tahun=${selectedYear}`);
      
      if (response.data.success) {
        const baseUrl = import.meta.env.VITE_API_URL;
        
        const transformedEmployees = response.data.data.map((employee, index) => ({
          nomor: index + 1,
          Foto: employee.Image 
            ? `${baseUrl}/images-karyawan/${employee.Image}` 
            : 'https://via.placeholder.com/150',
          Nama: employee.nama_karyawan,
          KPI: employee.kpi,
          cabang: '-' 
        }));

        setData(prevData => ({
          ...prevData,
          karyawan_terbaik: transformedEmployees
        }));
      }
    } catch (error) {
      console.error('Error fetching HeadGudang employees data:', error);
      console.error('Attempted toko_id:', toko_id);

      setData(prevData => ({
        ...prevData,
        karyawan_terbaik: []
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchTokoTerlaris = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);

      let endpoint = `/toko/terlaris?startDate=${startDate}&endDate=${endDate}`;
      if (isAdmin) {
        endpoint = `/toko/terlaris?toko_id=${userData?.userId}&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        if (isAdmin) {
          const { cabang_terlaris } = response.data.data;
          
          setData(prevData => ({
            ...prevData,
            cabang_terlaris: {
              keuntungan: {
                nama_toko: cabang_terlaris.keuntungan_tertinggi.nama_cabang,
                jumlah: cabang_terlaris.keuntungan_tertinggi.keuntungan
              },
              pemasukan: {
                nama_toko: cabang_terlaris.pemasukan_tertinggi.nama_cabang,
                jumlah: cabang_terlaris.pemasukan_tertinggi.total_pemasukan
              },
              pengeluaran: {
                nama_toko: cabang_terlaris.pengeluaran_tertinggi.nama_cabang,
                jumlah: cabang_terlaris.pengeluaran_tertinggi.total_pengeluaran
              },
              barang: {
                nama_barang: cabang_terlaris.penjualan_terbanyak.nama_cabang,
                jumlah: cabang_terlaris.penjualan_terbanyak.produk_terjual
              }
            }
          }));
        } else {
          const { toko_terlaris } = response.data.data;
          
          setData(prevData => ({
            ...prevData,
            cabang_terlaris: {
              keuntungan: {
                nama_toko: toko_terlaris.keuntungan_tertinggi.nama_toko,
                jumlah: toko_terlaris.keuntungan_tertinggi.keuntungan
              },
              pemasukan: {
                nama_toko: toko_terlaris.pemasukan_tertinggi.nama_toko,
                jumlah: toko_terlaris.pemasukan_tertinggi.total_pemasukan
              },
              pengeluaran: {
                nama_toko: toko_terlaris.pengeluaran_tertinggi.nama_toko,
                jumlah: toko_terlaris.pengeluaran_tertinggi.total_pengeluaran
              },
              barang: {
                nama_barang: toko_terlaris.penjualan_terbanyak.nama_toko,
                jumlah: toko_terlaris.penjualan_terbanyak.produk_terjual
              }
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching toko terlaris:', error);
      setData(prevData => ({
        ...prevData,
        cabang_terlaris: {
          keuntungan: { nama_toko: '-', jumlah: 0 },
          pemasukan: { nama_toko: '-', jumlah: 0 },
          pengeluaran: { nama_toko: '-', jumlah: 0 },
          barang: { nama_barang: '-', jumlah: 0 }
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHeadGudang || isAdmin) {
      fetchDashboardData();
      fetchProductData(); 
      
      if (isHeadGudang) {
        fetchHeadGudangEmployees();
      } else if (isAdmin) {
        fetchHeadGudangEmployees();
        fetchTokoTerlaris();
      }
      
      fetchKategoriBarang();
    } else if (isOwner || isManajer) {
      fetchTokoTerlaris();
      fetchProductData(); 
      fetchTopEmployees();
      fetchKategoriBarang();
    }
  }, [selectedMonth, selectedYear, isManajer, isHeadGudang, isAdmin, isOwner]);

  useEffect(() => {
    setSelectedStore("Semua");
  }, []);
  const initialData = () => {
    if (isHeadGudang || isAdmin) {
      return {
        barang_terlaris: {
          handmade: { nama: '-', jumlah: 0 },
          non_handmade: { nama: '-', jumlah: 0 },
          custom: { nama: '-', jumlah: 0 },
          packaging: { nama: '-', jumlah: 0 },
        },
        produk_terlaris: {
          data_handmade: { data: [] },
          data_non_handmade: { data: [] },
          data_custom: { data: [] },
        },
        karyawan_terbaik: []
      };
    } else {
      return {
        cabang_terlaris: {
          keuntungan: { nama_toko: '-', jumlah: 0 },
          pemasukan: { nama_toko: '-', jumlah: 0 },
          pengeluaran: { nama_toko: '-', jumlah: 0 },
          barang: { nama_barang: '-', jumlah: 0 },
        },
        produk_terlaris: {
          data_handmade: { data: [] },
          data_non_handmade: { data: [] },
          data_custom: { data: [] },
        },
        karyawan_terbaik: []
      };
    }
  };
  
  const [data, setData] = useState(initialData());

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
      } else if (selectedJenis === "Custom" || selectedJenis === "Barang Custom" || selectedJenis === "Mentah" || selectedJenis === "Barang Mentah") {
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
      // {
      //   label: "Kategori",
      //   key: "Kategori",
      //   options: [
      //     { label: "Semua", value: "Semua" },
      //     ...kategoriBarang.map(kategori => ({
      //       label: kategori.nama_kategori_barang,
      //       value: kategori.nama_kategori_barang
      //     }))
      //   ]
      // }
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

    const getDashboardIconPath = (baseIconName) => {
      if (isAdminGudang || isHeadGudang) {
        return `/Dashboard Produk/${baseIconName}_gudang.svg`;
      }
      return `/Dashboard Produk/${baseIconName}.svg`;
    };

    const getDashboardIconPath2 = (baseIconName) => {
      if (isManajer || isOwner || isFinance) {
        return `/keuangan/${baseIconName}_non.svg`;
      }
      return `/keuangan/${baseIconName}.svg`;
    };

    const tokoIcon = (isManajer || isOwner || isFinance) ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
      <path d="M1.18951 1.77346C0.995552 2.15922 0.900181 2.63715 0.709441 3.59085L0.068639 6.79486C-0.0221781 7.23171 -0.0228815 7.68251 0.0665719 8.11964C0.156025 8.55678 0.333753 8.97106 0.588876 9.33712C0.843998 9.70318 1.17115 10.0133 1.55029 10.2486C1.92944 10.4838 2.35261 10.6392 2.79389 10.7052C3.23518 10.7712 3.68529 10.7465 4.11668 10.6325C4.54807 10.5185 4.95166 10.3177 5.30274 10.0423C5.65382 9.76691 5.945 9.42278 6.15846 9.03096C6.37192 8.63914 6.50317 8.20787 6.54417 7.76356L6.61918 7.02418C6.57857 7.49443 6.6365 7.96797 6.78927 8.41457C6.94203 8.86116 7.18628 9.27097 7.5064 9.61783C7.82652 9.96468 8.21547 10.2409 8.6484 10.429C9.08134 10.617 9.54873 10.7126 10.0207 10.7098C10.4927 10.7069 10.9589 10.6057 11.3896 10.4124C11.8202 10.2192 12.2058 9.93829 12.5217 9.58761C12.8376 9.23692 13.0769 8.8242 13.2243 8.3758C13.3717 7.92739 13.4239 7.45318 13.3776 6.98346L13.4558 7.76356C13.4968 8.20787 13.6281 8.63914 13.8415 9.03096C14.055 9.42278 14.3462 9.76691 14.6973 10.0423C15.0483 10.3177 15.4519 10.5185 15.8833 10.6325C16.3147 10.7465 16.7648 10.7712 17.2061 10.7052C17.6474 10.6392 18.0706 10.4838 18.4497 10.2486C18.8289 10.0133 19.156 9.70318 19.4111 9.33712C19.6662 8.97106 19.844 8.55678 19.9334 8.11964C20.0229 7.68251 20.0222 7.23171 19.9314 6.79486L19.2906 3.59085C19.0998 2.63715 19.0044 2.1603 18.8105 1.77346C18.6084 1.37059 18.3238 1.01471 17.9753 0.72894C17.6268 0.443166 17.222 0.233877 16.7874 0.114659C16.3694 1.19758e-07 15.8829 0 14.91 0H5.09004C4.11705 0 3.63056 1.19758e-07 3.21264 0.114659C2.77798 0.233877 2.37324 0.443166 2.0247 0.72894C1.67615 1.01471 1.3916 1.37059 1.18951 1.77346ZM16.7177 12.3231C17.555 12.3252 18.3785 12.1108 19.1084 11.7005V12.8589C19.1084 16.8998 19.1084 18.9208 17.8525 20.1756C16.842 21.1872 15.3364 21.3833 12.6789 21.4219V17.681C12.6789 16.6791 12.6789 16.1786 12.4636 15.8057C12.3225 15.5614 12.1196 15.3585 11.8753 15.2174C11.5023 15.0021 11.0019 15.0021 10 15.0021C8.99808 15.0021 8.49765 15.0021 8.12474 15.2174C7.88041 15.3585 7.67752 15.5614 7.53645 15.8057C7.32106 16.1786 7.32106 16.6791 7.32106 17.681V21.4219C4.66355 21.3833 3.15799 21.1861 2.1475 20.1756C0.891609 18.9208 0.891609 16.8998 0.891609 12.8589V11.7005C1.62179 12.1109 2.44575 12.3254 3.28337 12.3231C4.52172 12.3239 5.71397 11.8534 6.61811 11.0072C7.53936 11.8563 8.74718 12.3262 10 12.3231C11.2528 12.3262 12.4606 11.8563 13.3819 11.0072C14.286 11.8534 15.4793 12.3239 16.7177 12.3231Z" fill="#023F80"/>
      </svg>
    ) : (
        <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.77506 2.27503C1.54232 2.73795 1.42787 3.31146 1.19899 4.4559L0.430023 8.30071C0.321042 8.82494 0.320198 9.36589 0.427543 9.89045C0.534887 10.415 0.74816 10.9122 1.05431 11.3514C1.36045 11.7907 1.75303 12.1629 2.20801 12.4452C2.66299 12.7274 3.17079 12.9139 3.70033 12.9931C4.22987 13.0723 4.77001 13.0426 5.28768 12.9059C5.80534 12.7691 6.28965 12.5281 6.71094 12.1976C7.13224 11.8672 7.48166 11.4542 7.73781 10.984C7.99396 10.5138 8.15146 9.99633 8.20066 9.46316L8.29067 8.57589C8.24194 9.14019 8.31145 9.70845 8.49478 10.2444C8.6781 10.7803 8.97119 11.272 9.35534 11.6883C9.73948 12.1045 10.2062 12.436 10.7257 12.6616C11.2453 12.8873 11.8061 13.002 12.3725 12.9986C12.9389 12.9952 13.4984 12.8737 14.0151 12.6418C14.5319 12.4099 14.9946 12.0728 15.3737 11.652C15.7528 11.2312 16.0399 10.7359 16.2168 10.1978C16.3936 9.65975 16.4563 9.0907 16.4008 8.52703L16.4947 9.46316C16.5439 9.99633 16.7014 10.5138 16.9575 10.984C17.2137 11.4542 17.5631 11.8672 17.9844 12.1976C18.4057 12.5281 18.89 12.7691 19.4076 12.9059C19.9253 13.0426 20.4654 13.0723 20.995 12.9931C21.5245 12.9139 22.0323 12.7274 22.4873 12.4452C22.9423 12.1629 23.3349 11.7907 23.641 11.3514C23.9472 10.9122 24.1604 10.415 24.2678 9.89045C24.3751 9.36589 24.3743 8.82494 24.2653 8.30071L23.4963 4.4559C23.2674 3.31146 23.153 2.73924 22.9202 2.27503C22.6777 1.79158 22.3363 1.36454 21.918 1.02161C21.4998 0.67868 21.0141 0.427534 20.4925 0.284472C19.991 0.146881 19.4072 0.146881 18.2396 0.146881H6.45571C5.28812 0.146881 4.70432 0.146881 4.20283 0.284472C3.68123 0.427534 3.19554 0.67868 2.77729 1.02161C2.35904 1.36454 2.01758 1.79158 1.77506 2.27503ZM20.4089 14.9346C21.4136 14.9372 22.4019 14.6798 23.2777 14.1875V15.5776C23.2777 20.4267 23.2777 22.8518 21.7707 24.3576C20.5581 25.5715 18.7514 25.8068 15.5624 25.8531V21.3641C15.5624 20.1618 15.5624 19.5613 15.3039 19.1138C15.1346 18.8206 14.8912 18.5771 14.598 18.4078C14.1505 18.1493 13.55 18.1493 12.3477 18.1493C11.1453 18.1493 10.5448 18.1493 10.0973 18.4078C9.80415 18.5771 9.56068 18.8206 9.39139 19.1138C9.13293 19.5613 9.13293 20.1618 9.13293 21.3641V25.8531C5.94392 25.8068 4.13725 25.5702 2.92465 24.3576C1.41759 22.8518 1.41759 20.4267 1.41759 15.5776V14.1875C2.29381 14.68 3.28256 14.9374 4.28769 14.9346C5.77372 14.9356 7.20442 14.371 8.28939 13.3555C9.39489 14.3744 10.8443 14.9383 12.3477 14.9346C13.851 14.9383 15.3004 14.3744 16.4059 13.3555C17.4909 14.371 18.9229 14.9356 20.4089 14.9346Z" fill="#7B0C42"/>
        </svg>                            
    );
    
    const dataBarangIcon = (isManajer || isOwner || isFinance) ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
      <path d="M15.5765 7.40711L19.2808 5.29897C19.1328 5.151 18.9554 5.03288 18.7389 4.91433L11.7932 0.954466C11.1824 0.609344 10.5909 0.42186 9.99987 0.42186C9.40883 0.42186 8.81779 0.608923 8.20658 0.954046L6.20689 2.08652L15.5765 7.40711ZM9.99987 10.57L14.2069 8.18563L4.87684 2.85537L1.26084 4.91475C1.04393 5.03245 0.866955 5.151 0.718565 5.29897L9.99987 10.57ZM10.6699 21.8606C10.7389 21.8409 10.7977 21.8114 10.8671 21.7723L18.5813 17.3778C19.4977 16.8557 20 16.3235 20 14.8951V7.22005C20 6.92453 19.9706 6.68786 19.9214 6.47137L10.6699 11.752V21.8606ZM9.3298 21.8606V11.752L0.0791855 6.47137C0.0242174 6.71693 -0.00230034 6.968 0.000156252 7.21963V14.8951C0.000156252 16.3235 0.502496 16.8557 1.4189 17.3778L9.13349 21.7719C9.20243 21.8114 9.26086 21.8409 9.3298 21.8606Z" fill="#023F80"/>
      </svg>
    ) : (
      <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.0394 8.51902L23.4846 5.98925C23.307 5.81169 23.0941 5.66994 22.8343 5.52768L14.4994 0.775846C13.7665 0.3617 13.0567 0.136719 12.3475 0.136719C11.6383 0.136719 10.929 0.361195 10.1955 0.775342L7.79592 2.13431L19.0394 8.51902ZM12.3475 12.3144L17.3959 9.45325L6.19987 3.05693L1.86066 5.52819C1.60037 5.66943 1.388 5.81169 1.20993 5.98925L12.3475 12.3144ZM13.1516 25.8632C13.2343 25.8395 13.3049 25.8042 13.3882 25.7573L22.6452 20.4839C23.7448 19.8574 24.3477 19.2187 24.3477 17.5046V8.29455C24.3477 7.93992 24.3123 7.65592 24.2533 7.39614L13.1516 13.7329V25.8632ZM11.5434 25.8632V13.7329L0.442679 7.39614C0.376717 7.69081 0.344896 7.99209 0.347844 8.29404V17.5046C0.347844 19.2187 0.950651 19.8574 2.05033 20.4839L11.3078 25.7568C11.3906 25.8042 11.4607 25.8395 11.5434 25.8632Z" fill="#7B0C42"/>
      </svg>                           
    );

    const renderOverviewSection = () => {
      if (isHeadGudang) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Handmade Card */}
            <div className="w-full">
              <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Barang Handmade Terlaris</p>
                  <p className="font-bold text-lg truncate">{dashboardData.barang_handmade.nama || '-'}</p>
                  <p>{formatNumberWithDots(dashboardData.barang_handmade.jumlah)} Pcs Terjual</p>
                </div>
                <div className="flex items-center justify-center ml-4">
                  <img src={getDashboardIconPath("handmade")}alt="handmade" />
                </div>
              </div>
            </div>
    
            {/* Non-Handmade Card */}
            <div className="w-full">
              <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Barang Non-Handmade Terlaris</p>
                  <p className="font-bold text-lg truncate">{dashboardData.barang_non_handmade.nama || '-'}</p>
                  <p>{formatNumberWithDots(dashboardData.barang_non_handmade.jumlah)} Pcs Terjual</p>
                </div>
                <div className="flex items-center justify-center ml-4">
                  <img src={getDashboardIconPath("nonhandmade")} alt="nonhandmade" />
                </div>
              </div>
            </div>
    
            {/* Custom Card (Mentah) */}
            <div className="w-full">
              <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Barang Mentah Terlaris</p>
                  <p className="font-bold text-lg truncate">{dashboardData.barang_custom.nama || '-'}</p>
                  <p>{formatNumberWithDots(dashboardData.barang_custom.jumlah)} Pcs Terjual</p>
                </div>
                <div className="flex items-center justify-center ml-4">
                  <img src={getDashboardIconPath("custom")} alt="custom" />
                </div>
              </div>
            </div>
    
            {/* Packaging Card */}
            <div className="w-full">
              <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Packaging Terlaris</p>
                  <p className="font-bold text-lg truncate">{dashboardData.packging.nama || '-'}</p>
                  <p>{formatNumberWithDots(dashboardData.packging.jumlah)} Pcs Terjual</p>
                </div>
                <div className="flex items-center justify-center ml-4">
                  <img src={getDashboardIconPath("packaging")} alt="packaging" />
                </div>
              </div>
            </div>
          </div>
        );
      }
    
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keuntungan Card */}
          <div className="w-full">
            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Keuntungan Terbanyak</p>
                <p className="font-bold text-lg">{data.cabang_terlaris?.keuntungan?.nama_toko || '-'}</p>
                <p className="">Rp{formatNumberWithDots(data.cabang_terlaris?.keuntungan?.jumlah)}</p>
              </div>
              <div className="flex items-center justify-center ml-4">
                <img src={getDashboardIconPath2("keuntungan")} alt="keuntungan" />
              </div>
            </div>
          </div>
    
          {/* Pemasukan Card */}
          <div className="w-full">
            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Pemasukan Terbanyak</p>
                <p className="font-bold text-lg">{data.cabang_terlaris?.pemasukan?.nama_toko || '-'}</p>
                <p className="">Rp{formatNumberWithDots(data.cabang_terlaris?.pemasukan?.jumlah)}</p>
              </div>
              <div className="flex items-center justify-center ml-4">
                <img src={getDashboardIconPath2("pemasukan")} alt="pemasukan" />
              </div>
            </div>
          </div>
    
          {/* Pengeluaran Card */}
          <div className="w-full">
            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Pengeluaran Terbanyak</p>
                <p className="font-bold text-lg">{data.cabang_terlaris?.pengeluaran?.nama_toko || '-'}</p>
                <p className="">Rp{formatNumberWithDots(data.cabang_terlaris?.pengeluaran?.jumlah)}</p>
              </div>
              <div className="flex items-center justify-center ml-4">
                <img src={getDashboardIconPath2("pengeluaran")} alt="pengeluaran" />
              </div>
            </div>
          </div>
    
          {/* Barang Custom Card */}
          <div className="w-full">
            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
              <div className="flex-1">
                <p className="text-gray-400 text-sm">
                  {isAdmin ? "Barang Terjual Terbanyak" : 
                   (isOwner || isManajer) ? "Barang Terjual Terbanyak" : 
                   "Barang Custom Terlaris"}
                </p>
                <p className="font-bold text-lg">{data.cabang_terlaris?.barang?.nama_barang || '-'}</p>
                <p className="">{formatNumberWithDots(data.cabang_terlaris?.barang?.jumlah)} Pcs</p>
              </div>
              <div className="flex items-center justify-center ml-4">
                <img src={getDashboardIconPath2("produkterjual")} alt="produk" />
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
                    <p className={`text-${themeColor} text-base font-bold`}>Overview</p>
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
                                        className={`w-full px-4 py-2 border hover:border-${themeColor} border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5`}
                                />
                        </div>
                    </div>
                </section>

                {/* cabang Terlaris */}
                <section className="mt-5">
                  {!isHeadGudang && (
                      <div className="w-full p-4 rounded-lg flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                              {tokoIcon}
                          </div>
                          <h2 className={`${colorMap[themeColor]} text-lg font-bold`}>
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
                                        {dataBarangIcon}
                                    </div>
                                    <h2 className={`text-lg font-bold text-${themeColor}`}>Produk Terlaris</h2>
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
                                  hasFilter={!isHeadGudang}
                                  onFilterClick={handleFilterClick}
                              />
                            </div>

                            <div className="w-full bg-white rounded-xl p-5">
                                <p className="font-bold">
                                  {isOwner || isManajer ? '10 Karyawan Terbaik Perusahaan' : '10 Karyawan Terbaik'}
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
    )
}