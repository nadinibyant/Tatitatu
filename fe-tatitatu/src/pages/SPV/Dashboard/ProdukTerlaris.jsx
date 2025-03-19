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
  const isAdmin = userData?.role === 'admin'
  const isFinance = userData?.role === 'finance'
  const toko_id = userData?.userId
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


  const iconToko = (isManajer || isOwner || isFinance) 
  ? '/Icon Warna/toko_non.svg' 
  : '/icon/toko.svg';

  const themeColor = (isAdminGudang || isHeadGudang) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
      ? "hitam"
      : "primary";

  const fetchCabangData = async () => {
    try {
      if (isAdmin && toko_id) {
        const response = await api.get(`/cabang?toko_id=${toko_id}`);
        
        if (response.data.success) {
          const cabangOptions = [
            { label: 'Semua', value: 'Semua', icon: iconToko, id: null },
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
        { label: 'Semua', value: 'Semua', icon: iconToko, id: null }
      ]);
    }
  };

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
      if (isManajer || isOwner) { 
        const response = await api.get('/toko');
        
        if (response.data.success) {
          const stores = [
            { label: 'Semua', value: 'Semua', icon: iconToko, id: null },
            ...response.data.data.map(store => ({
              label: store.nama_toko,
              value: store.nama_toko,
              icon: iconToko,
              id: store.toko_id 
            }))
          ];
          setStoreData(stores);
        }
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
      setStoreData([
        { label: 'Semua', value: 'Semua', icon: iconToko, id: null }
      ]);
    }
  };
  
  useEffect(() => {
    if (isAdminGudang || isHeadGudang || isManajer) {
      fetchKategoriBarang();
    }
  
    if (isManajer || isOwner) { 
      fetchStoreData();
    }
    
    if (isAdmin) {
      fetchCabangData();
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

    if (isHeadGudang) {
      console.log("Applying filters:", { selectedJenis, selectedKategori });
      
      // Force refresh data with the selected filters
      setTimeout(() => {
        fetchProductData();
      }, 100);
    }
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
    if (isAdminGudang || isHeadGudang) {
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

  const fetchAdminDashboardData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      const tokoId = userData?.userId;
      console.log(selectedStore)
      let endpoint;
      if (selectedStore === "Semua") {
        endpoint = `/produk-penjualan/toko/kategori?toko_id=${tokoId}&startDate=${startDate}&endDate=${endDate}`;
      } else {
        const selectedCabang = storeData.find(store => store.value === selectedStore);
        if (selectedCabang && selectedCabang.id) {
          endpoint = `/produk-penjualan/cabang/kategori?cabang_id=${selectedCabang.id}&startDate=${startDate}&endDate=${endDate}`;
        } else {
          console.error('Invalid cabang selection');
          return;
        }
      }
  
      console.log("Fetching admin dashboard data with endpoint:", endpoint);
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const data = response.data.data;

        const dashboardObj = {
          barang_handmade: { 
            nama: data.handmade?.nama || '-', 
            jumlah: data.handmade?.total_terjual || 0,
            image: data.handmade?.image || null
          },
          barang_non_handmade: { 
            nama: data.nonhandmade?.nama || '-', 
            jumlah: data.nonhandmade?.total_terjual || 0,
            image: data.nonhandmade?.image || null
          },
          packging: { 
            nama: data.packaging?.nama || '-', 
            jumlah: data.packaging?.total_terjual || 0,
            image: data.packaging?.image || null
          },
          barang_custom: { 
            nama: data.custom?.nama || '-', 
            jumlah: data.custom?.total_terjual || 0,
            image: data.custom?.image || null
          }
        };
        
        setDashboardData(dashboardObj);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setDashboardData({
        barang_handmade: { nama: '-', jumlah: 0 },
        barang_non_handmade: { nama: '-', jumlah: 0 },
        packging: { nama: '-', jumlah: 0 },
        barang_custom: { nama: '-', jumlah: 0 }
      });
    }
  };

  const mapKategoriToJenis = (kategori) => {
    if (!kategori) return '-';
    
    const normalizedKategori = kategori.toLowerCase();
    
    if (isHeadGudang || isAdminGudang) {
      if (normalizedKategori.includes('handmade')) {
        return "Barang Handmade";
      } else if (normalizedKategori.includes('non') && normalizedKategori.includes('handmade')) {
        return "Barang Non-Handmade";
      } else if (normalizedKategori.includes('mentah') || normalizedKategori.includes('bahan')) {
        return "Barang Mentah"; 
      } else if (normalizedKategori.includes('packaging')) {
        return "Packaging";
      } else {
        return kategori; // Return as is if no match
      }
    } else {
      if (normalizedKategori.includes('handmade')) {
        return "Barang Handmade";
      } else if (normalizedKategori.includes('non') && normalizedKategori.includes('handmade')) {
        return "Barang Non-Handmade";
      } else if (normalizedKategori.includes('custom')) {
        return "Barang Custom"; 
      } else if (normalizedKategori.includes('packaging')) {
        return "Packaging";
      } else if (normalizedKategori.includes('mentah') || normalizedKategori.includes('bahan')) {
        return "Barang Mentah"; 
      } else {
        return kategori; // Return as is if no match
      }
    }
  };

  const fetchAdminProductData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      const tokoId = userData?.userId;

      let endpoint;
      if (selectedStore === "Semua") {
        endpoint = `/produk-penjualan/toko/terlaris?toko_id=${tokoId}&startDate=${startDate}&endDate=${endDate}`;
      } else {
        const selectedCabang = storeData.find(store => store.value === selectedStore);
        if (selectedCabang && selectedCabang.id) {
          endpoint = `/produk-penjualan/cabang/terlaris?cabang_id=${selectedCabang.id}&startDate=${startDate}&endDate=${endDate}`;
        } else {
          console.error('Invalid cabang selection');
          return;
        }
      }
      
      console.log("Fetching admin product data with endpoint:", endpoint);
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const tableData = response.data.data.map((item, index) => ({
          nomor: index + 1,
          id: item.id,
          Nama: item.nama || item.name || '-',
          Kategori: item.kategori,
          Jenis: mapKategoriToJenis ? mapKategoriToJenis(item.kategori) : item.kategori,
          Terjual: item.total_terjual,
          image: item.image ? `${import.meta.env.VITE_API_URL}/${getImagePath(item.kategori)}/${item.image}` : null
        }));
        
        setProductData(tableData);
      }
    } catch (error) {
      console.error('Error fetching admin product data:', error);
      setProductData([]);
    }
  };

  const fetchProductData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      
      if (isAdminGudang || isHeadGudang) {
        const tokoId = userData?.userId;
        let endpoint = `/produk-penjualan/toko/terlaris?toko_id=${tokoId}&startDate=${startDate}&endDate=${endDate}`;
        
        if (selectedJenis !== "Semua") {
          endpoint += `&jenis=${encodeURIComponent(selectedJenis)}`;
        }
        
        if (selectedKategori !== "Semua") {
          endpoint += `&kategori=${encodeURIComponent(selectedKategori)}`;
        }
        
        console.log("Fetching with endpoint:", endpoint);
        
        const response = await api.get(endpoint);
        
        if (response.data.success) {
          let filteredData = response.data.data;

          if (selectedJenis !== "Semua") {
            filteredData = filteredData.filter(item => 
              item.kategori.toLowerCase() === selectedJenis.toLowerCase());
          }
          
          if (selectedKategori !== "Semua") {
            filteredData = filteredData.filter(item => 
              item.kategori.toLowerCase() === selectedKategori.toLowerCase());
          }
          
          const tableData = filteredData.map((item, index) => ({
            nomor: index + 1,
            Nama: item.name,
            Kategori: item.kategori,
            Jenis: item.kategori, 
            Terjual: item.total_terjual
          }));
          
          setProductData(tableData);
          console.log("Updated product data:", tableData);
        }
      } else {
        const endpoint = `/produk-penjualan-gudang/terlaris?startDate=${startDate}&endDate=${endDate}`;
        
        const response = await api.get(endpoint);
        
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
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      setProductData([]);
    }
  };

  const fetchBarangTerlaris = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      const tokoId = userData?.userId;
      const response = await api.get(`/produk-penjualan/toko/topten?toko_id=${tokoId}&startDate=${startDate}&endDate=${endDate}`);
      
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
      const tokoId = userData?.userId;
      const response = await api.get(`/produk-penjualan/toko/kategori?toko_id=${tokoId}&startDate=${startDate}&endDate=${endDate}`);
      
      if (response.data.success) {
        const data = response.data.data;
        
        const dashboardObj = {
          barang_handmade: { 
            nama: data.handmade?.nama || '-', 
            jumlah: data.handmade?.total_terjual || 0,
            image: data.handmade?.image || null
          },
          barang_non_handmade: { 
            nama: data.nonhandmade?.nama || '-', 
            jumlah: data.nonhandmade?.total_terjual || 0,
            image: data.nonhandmade?.image || null
          },
          packging: { 
            nama: data.packaging?.nama || '-', 
            jumlah: data.packaging?.total_terjual || 0,
            image: data.packaging?.image || null
          },
          barang_custom: { 
            nama: data.mentah?.nama || '-', 
            jumlah: data.mentah?.total_terjual || 0,
            image: data.mentah?.image || null
          }
        };
        
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


  const fetchAdminTopProducts = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      const tokoId = userData?.userId;
      let endpoint;
      if (selectedStore === "Semua") {
        endpoint = `/produk-penjualan/toko/topten?toko_id=${tokoId}&startDate=${startDate}&endDate=${endDate}`;
      } else {
        const selectedCabang = storeData.find(store => store.value === selectedStore);
        if (selectedCabang && selectedCabang.id) {
          endpoint = `/produk-penjualan/cabang/topten?cabang_id=${selectedCabang.id}&startDate=${startDate}&endDate=${endDate}`;
        } else {
          console.error('Invalid cabang selection');
          return;
        }
      }
      
      console.log("Fetching admin top products with endpoint:", endpoint);
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const top10Products = response.data.data.slice(0, 10);
        
        const formattedData = top10Products.map((item, index) => ({
          nomor: index + 1,
          "Foto": (
            <img 
              src={`${import.meta.env.VITE_API_URL}/${getImagePath(item.kategori)}/${item.image}`}
              className="w-8 h-8 object-cover rounded-lg"
              onError={(e) => {

                const alternativePath = `${import.meta.env.VITE_API_URL}/${getImagePath(item.kategori)}-gudang/${item.image}`;
                e.target.src = alternativePath;
                
                e.target.onerror = () => {
                  e.target.src = "/api/placeholder/64/64";
                  e.target.onerror = null;
                };
              }}
            />
          ),
          "Nama Barang": item.nama,
          "Terjual": `${formatNumberWithDots(item.total_terjual)} Pcs`
        }));
        
        setBarangTerlaris(formattedData);
      }
    } catch (error) {
      console.error('Error fetching admin top products:', error);
      setBarangTerlaris([]);
    }
  };

  const fetchOwnerDashboardData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
      
      let endpoint = `/produk-penjualan/toko/kategori?startDate=${startDate}&endDate=${endDate}`;
      let isRumahProduksi = false;

      if (selectedStore !== "Semua") {
        const selectedStoreObj = storeData.find(store => store.value === selectedStore);
        if (selectedStoreObj && selectedStoreObj.id) {
          endpoint += `&toko_id=${selectedStoreObj.id}`;
          isRumahProduksi = selectedStoreObj.id === 1;
        }
      }
      
      console.log("Fetching owner dashboard data with endpoint:", endpoint);
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const data = response.data.data;

        const dashboardObj = {
          barang_handmade: { 
            nama: data.handmade?.nama || '-', 
            jumlah: data.handmade?.total_terjual || 0,
            image: data.handmade?.image || null
          },
          barang_non_handmade: { 
            nama: data.nonhandmade?.nama || '-', 
            jumlah: data.nonhandmade?.total_terjual || 0,
            image: data.nonhandmade?.image || null
          },
          packging: { 
            nama: data.packaging?.nama || '-', 
            jumlah: data.packaging?.total_terjual || 0,
            image: data.packaging?.image || null
          },
          barang_custom: { 
            nama: isRumahProduksi ? (data.mentah?.nama || '-') : (data.custom?.nama || '-'), 
            jumlah: isRumahProduksi ? (data.mentah?.total_terjual || 0) : (data.custom?.total_terjual || 0),
            image: isRumahProduksi ? (data.mentah?.image || null) : (data.custom?.image || null),
            isMentah: isRumahProduksi
          }
        };
        
        setDashboardData(dashboardObj);
      }
    } catch (error) {
      console.error('Error fetching owner dashboard data:', error);
      setDashboardData({
        barang_handmade: { nama: '-', jumlah: 0 },
        barang_non_handmade: { nama: '-', jumlah: 0 },
        packging: { nama: '-', jumlah: 0 },
        barang_custom: { nama: '-', jumlah: 0, isMentah: false }
      });
    }
  };

  const fetchOwnerProductData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);

      let endpoint = `/produk-penjualan/toko/terlaris?startDate=${startDate}&endDate=${endDate}`;

      if (selectedStore !== "Semua") {
        const selectedStoreObj = storeData.find(store => store.value === selectedStore);
        if (selectedStoreObj && selectedStoreObj.id) {
          endpoint += `&toko_id=${selectedStoreObj.id}`;
        }
      }
      
      console.log("Fetching owner product data with endpoint:", endpoint);
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const tableData = response.data.data.map((item, index) => ({
          nomor: index + 1,
          id: item.id,
          Nama: item.nama || item.name || '-',
          Kategori: item.kategori,
          Jenis: mapKategoriToJenis(item.kategori),
          Terjual: item.total_terjual,
          image: item.image ? `${import.meta.env.VITE_API_URL}/${getImagePath(item.kategori)}/${item.image}` : null
        }));
        
        setProductData(tableData);
      }
    } catch (error) {
      console.error('Error fetching owner product data:', error);
      setProductData([]);
    }
  };

  const handleImageError = (e, kategori, imageFileName) => {
    const path = getImagePath(kategori);
    const imagePath = `${import.meta.env.VITE_API_URL}/${path}-gudang/${imageFileName}`;
    
    e.target.src = imagePath;

    e.target.onerror = () => {
      e.target.src = "/api/placeholder/64/64";
      e.target.onerror = null; 
    };
  };

  const fetchOwnerTopProducts = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);

      let endpoint = `/produk-penjualan/toko/topten?startDate=${startDate}&endDate=${endDate}`;

      if (selectedStore !== "Semua") {
        const selectedStoreObj = storeData.find(store => store.value === selectedStore);
        if (selectedStoreObj && selectedStoreObj.id) {
          endpoint += `&toko_id=${selectedStoreObj.id}`;
        }
      }
      
      console.log("Fetching owner top products with endpoint:", endpoint);
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const top10Products = response.data.data.slice(0, 10);
        
        const formattedData = top10Products.map((item, index) => ({
          nomor: index + 1,
          "Foto": (
            <img 
              src={`${import.meta.env.VITE_API_URL}/${getImagePath(item.kategori)}/${item.image}`}
              className="w-8 h-8 object-cover rounded-lg"
              onError={(e) => {
                const alternatePath = `${import.meta.env.VITE_API_URL}/${getImagePath(item.kategori)}-gudang/${item.image}`;
                e.target.src = alternatePath;
                
                e.target.onerror = () => {
                  e.target.src = "/api/placeholder/64/64";
                  e.target.onerror = null;
                };
              }}
            />
          ),
          "Nama Barang": item.nama || item.name,
          "Terjual": `${formatNumberWithDots(item.total_terjual)} Pcs`
        }));
        
        setTopBarangTerlaris(formattedData);
      }
    } catch (error) {
      console.error('Error fetching owner top products:', error);
      setTopBarangTerlaris([]);
    }
  };
  

  useEffect(() => {
    if (isAdminGudang || isHeadGudang) {
      fetchDashboardData();
      fetchBarangTerlaris();
      fetchProductData();
    }
    
    if (isOwner || isManajer) {
      fetchOwnerDashboardData();
      fetchOwnerProductData(); 
      fetchOwnerTopProducts(); 
    }
    
    if (isAdmin) {
      fetchAdminDashboardData();
      fetchAdminProductData();
      fetchAdminTopProducts();
    }
  }, [selectedMonth, selectedYear, selectedJenis, selectedKategori, selectedStore]);

  const defaultStoreCabang = [
    { label: 'Semua', value: 'Semua', icon: iconToko },
  ];

  const dataCabang = isAdmin && storeData.length > 0 
  ? storeData 
  : (isManajer || isOwner) && storeData.length > 0 
    ? storeData 
    : defaultStoreCabang;

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

  const filterFields = (isOwner || isManajer) ? [
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
        { label: "Bahan Mentah", value: "Bahan Mentah" },
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

  const getDashboardIconPath = (baseIconName) => {
    const iconName = baseIconName === "mentah" ? "custom" : baseIconName;
    
    if (isAdminGudang || isHeadGudang) {
      return `/Dashboard Produk/${iconName}_gudang.svg`;
    } else if(isManajer || isOwner || isFinance){
      return `/Dashboard Produk/${iconName}_non.svg`;
    }
    return `/Dashboard Produk/${iconName}.svg`;
  };

  return (
    <>
      <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
        <div className="p-5">
          <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
            <div className="left w-full md:w-auto">
              <p className={`text-${themeColor} text-base font-bold`}>
                  {isOwner || isManajer ? 'Produk Terlaris Perusahaan' : 'Produk Terlaris'}
              </p>
            </div>

            <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
              {/* ButtonDropdown for stores visible for manager or roles that aren't headgudang or admingudang */}
              {(isOwner || isManajer || isAdmin) && (
                <div className="w-full md:w-auto">
                  <ButtonDropdown 
                    selectedIcon={iconToko} 
                    options={isAdmin ? storeData : dataCabang} 
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
                                        className={`w-full px-4 py-2 border hover:border-${themeColor} border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5`}
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
                      className={`px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-${themeColor} hover:text-white`}
                    >
                      Hari Ini
                    </button>
                    <button
                      onClick={handleLast7Days}
                      className={`px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-${themeColor} hover:text-white`}
                    >
                      7 Hari Terakhir
                    </button>
                    <button
                      onClick={handleThisMonth}
                      className={`px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-${themeColor} hover:text-white`}
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
                    <img src={getDashboardIconPath("handmade")} alt="handmade" className="w-12 h-12" />
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
                    <img src={getDashboardIconPath("nonhandmade")} alt="nonhandmade" className="w-12 h-12" />
                  </div>
                </div>
              </div>

              {/* packaging */}
              <div className="w-full">
                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-sm">Packaging Terlaris</p>
                    <p className="font-bold text-lg truncate">{dashboardData.packging.nama}</p>
                    <p>{formatNumberWithDots(dashboardData.packging.jumlah)} Pcs</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <img src={getDashboardIconPath("packaging")} alt="packaging" className="w-12 h-12" />
                  </div>
                </div>
              </div>

              {/* mentah or custom - the fourth item */}
              <div className="w-full">
                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-sm">
                      {/* Dynamic title based on the store type */}
                      {(isOwner || isManajer) && dashboardData.barang_custom.isMentah
                        ? 'Barang Mentah Terlaris'
                        : 'Barang Custom Terlaris'}
                    </p>
                    <p className="font-bold text-lg truncate">{dashboardData.barang_custom.nama}</p>
                    <p>{formatNumberWithDots(dashboardData.barang_custom.jumlah)} Pcs</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <img 
                      src={getDashboardIconPath((isOwner || isManajer) && dashboardData.barang_custom.isMentah ? "mentah" : "custom")} 
                      alt={(isOwner || isManajer) && dashboardData.barang_custom.isMentah ? "Mentah" : "Custom"} 
                      className="w-12 h-12" 
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </section>


        <section className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">
                  {isAdmin ? `Produk Terlaris ${selectedStore === 'Semua' ? 'di Semua Cabang' : `di ${selectedStore}`}` : 
                  'Produk Terlaris'}
                </h3>
              </div>
                <Table
                  headers={headers}
                  data={(() => {
                    if (isAdminGudang || isHeadGudang || isOwner || isManajer) {
                      return productData.map(item => ({
                        ...item,
                        Terjual: `${formatNumberWithDots(item.Terjual)} Pcs`,
                      }));
                    } 
                    else if (isAdmin) {
                      // Admin-specific rendering
                      return productData.map(item => {
                        return {
                          ...item,
                          image: item.image ? (
                            <div className="w-12 h-12 flex items-center justify-center">
                              <img 
                                src={item.image}
                                alt={item.Nama}
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  // Try alternative paths if main one fails
                                  const alternatePath = `${import.meta.env.VITE_API_URL}/${getImagePath(item.Kategori)}-gudang/${item.image.split('/').pop()}`;
                                  e.target.src = alternatePath;
                                  
                                  e.target.onerror = () => {
                                    e.target.src = '/api/placeholder/64/64';
                                    e.target.onerror = null;
                                  };
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          ),
                          Terjual: `${formatNumberWithDots(item.Terjual)} Pcs`,
                        };
                      });
                    } 
                    else {
                      // Regular user rendering
                      return selectedData.map((item, index) => ({
                        ...item,
                        nomor: index + 1,
                        Terjual: `${item.Terjual} Pcs`,
                      }));
                    }
                  })()}
                />
            </div>

            <div className="bg-white rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">
                  {isOwner || isManajer ? '10 Barang Terlaris di Perusahaan' : 
                  isAdminGudang ? '10 Barang Terlaris' : 
                  isAdmin ? `10 Barang Terlaris ${selectedStore === 'Semua' ? 'di Semua Cabang' : `di ${selectedStore}`}` :
                  '10 Barang Terlaris di Toko'}
                </h3>
              </div>
              <Table
                headers={headers2}
                data={(isAdminGudang || isHeadGudang) ? barangTerlaris : 
                      (isOwner || isManajer) ? topBarangTerlaris : 
                      isAdmin ? barangTerlaris : 
                      data.barang_terlaris.map((item, index) => ({
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