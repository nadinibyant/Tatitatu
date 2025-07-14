import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import ButtonDropdown from "../../../components/ButtonDropdown";
import FileInput from "../../../components/FileInput";
import Input from "../../../components/Input";
import { menuItems, userOptions } from "../../../data/menu";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import Gallery2 from "../../../components/Gallery2";
import InputDropdown from "../../../components/InputDropdown";
import { useNavigate } from "react-router-dom";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import AlertError from "../../../components/AlertError";
import AlertConfirm from "../../../components/AlertConfirm";

export default function TambahBarang() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdminGudang = userData?.role === 'admingudang'
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance'
  const [dataKategori, setDataKategori] = useState([]);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [galleryMaterials, setGalleryMaterials] = useState([{items: []}]);
  const [dataCabang, setDataCabang] = useState([]);
  const [dataCabangOptions, setDataCabangOptions] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [isLoading, setLoading] = useState(false)
  const [isAlertSuccess, setAlertSucc] = useState(false)
  const [isErrorAlert, setErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [biayaGudangData, setBiayaGudangData] = useState(null);
  const [biayaTokoData, setBiayaTokoData] = useState([]);
  const toko_id = userData.userId;
  // New state for confirmation dialog
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  const [searchMaterial, setSearchMaterial] = useState("");
  // Pagination state for material modal
  const [paginationMaterial, setPaginationMaterial] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });



  const themeColor = (isAdminGudang || isHeadGudang) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
      ? "hitam"
      : "primary";

  // Function to build query parameters for API calls
  const buildQueryParams = (page, limit, category, search) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (category && category !== "Semua") {
      params.append('category', category);
    }
    if (search) {
      params.append('search', search);
    }
    return params.toString();
  };

  const fetchBiayaGudang = async () => {
    try {
      const response = await api.get('/biaya-gudang');
      if (response.data.success) {
        setBiayaGudangData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching biaya gudang:', error);
    }
  };


  const fetchMaterialData2 = async () => {
    try {
      const queryParams = buildQueryParams(
        paginationMaterial.page, 
        paginationMaterial.limit, 
        "Semua", 
        searchMaterial
      );
      const response = await api.get(`/barang-mentah?${queryParams}`);
      if (response.data.success) {
        const options = response.data.data.map(item => ({
          label: item.nama_barang,
          value: item.barang_mentah_id,
          price: item.harga_satuan,
          image: item.image
        }));
        setMaterialOptions(options);
        
        const galleryItems = response.data.data.map(item => ({
          id: item.barang_mentah_id,
          code: item.barang_mentah_id,
          image: item.image.startsWith('http') 
            ? item.image 
            : `${import.meta.env.VITE_API_URL}/images-barang-mentah/${item.image}`,
          name: item.nama_barang,
          price: item.harga_satuan
        }));
        setGalleryMaterials([{ items: galleryItems }]);
        
        // Update pagination info
        if (response.data.pagination) {
          setPaginationMaterial(prev => ({
            ...prev,
            total: response.data.pagination.totalItems || 0,
            totalPages: response.data.pagination.totalPages || 1
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching material data:', error);
    }
  };

   const fetchMaterialData = async () => {
    try {
      const response = await api.get('/barang-mentah?limit=1000');
      if (response.data.success) {
        const options = response.data.data.map(item => ({
          label: item.nama_barang,
          value: item.barang_mentah_id,
          price: item.harga_satuan,
          image: item.image
        }));
        setMaterialOptions(options);
      }
    } catch (error) {
      console.error('Error fetching material data:', error);
    }
  };
 
  useEffect(() => {
    if (isAdminGudang) {
      fetchMaterialData();
      fetchMaterialData2();
      fetchBiayaGudang();
    }
  }, [isAdminGudang]);

  // Add useEffect for pagination material
  useEffect(() => {
    if (isAdminGudang) {
      fetchMaterialData2();
    }
  }, [paginationMaterial.page, paginationMaterial.limit, searchMaterial]);



  const handleMaterialModal = () => {
    setIsMaterialModalOpen(true);
  };

  const handleMaterialSelect = (item, count) => {
    setSelectedMaterial((prev) => {
      const updated = [...prev];
      const existingItem = updated.find((i) => i.id === item.id);
      if (existingItem) {
        if (count === 0) {
          return updated.filter((i) => i.id !== item.id);
        } else {
          existingItem.count = count;
        }
      } else {
        updated.push({ ...item, count });
      }
      return updated;
    });
  };

  const handleMaterialModalSubmit = () => {
    const newMaterials = selectedMaterial.map((item) => {
      const materialOption = materialOptions.find(opt => opt.value === item.id);
      if (!materialOption) return null;
  
      let imageUrl = materialOption.image;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${import.meta.env.VITE_API_URL}/images-barang-mentah/${imageUrl}`;
      }
      
      return {
        id: item.id,
        No: materials.length + 1,
        Foto: imageUrl,
        "Nama Bahan": materialOption.label,
        "Harga Satuan": materialOption.price,
        "Kuantitas": item.count,
        "Total Biaya": materialOption.price * item.count,
        selectedId: item.id,
        value: item.id,
        label: materialOption.label
      };
    }).filter(Boolean);
      
    setMaterials(prev => [...prev, ...newMaterials]);
    setIsMaterialModalOpen(false);
    setSelectedMaterial([]);
  };

  const fetchKategori = async () => {
    try {
      const endpoint = isAdminGudang ? '/kategori-barang-gudang' : `/kategori-barang?toko_id=${toko_id}`;
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const options = response.data.data.map(item => ({
          label: item.nama_kategori_barang,
          value: item.kategori_barang_id
        }));
        setDataKategori(options);
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const breadcrumbItems = [
    { label: "Daftar Barang Handmade", href: "/dataBarang/handmade" },
    { label: "Tambah", href: "" },
  ];

  const headers = [
    { label: "No", key: "No", align: "text-left" },
    { label: "Nama Biaya", key: "Nama Biaya", align: "text-left" },
    { label: "Jumlah Biaya", key: "Jumlah Biaya", align: "text-left" },
    { label: "", key: "Aksi", align: "text-left" },
  ];

  const [data, setData] = useState({
    info_barang: {
      Nomor: "",
      "Nama Barang": "",
      Kategori: "",
      "Waktu Pengerjaan": "",
      "Jumlah Minimum Stok": "",
      Foto: null,
    },
    ...(isAdminGudang ? {
      totalHPP: 0,
      hargaJualIdeal: 0,
      marginPersentase: 0,
      marginNominal: 0,
      hargaLogis: 0,
      keuntungan: 0,
      persentaseHPP: 0
    } : {
      hargaPerCabang: {}
    })
  });

  const [rincianBiayaPerCabang, setRincianBiayaPerCabang] = useState({});

  const fetchCabangAndBiayaData = async () => {
    try {
      const [cabangResponse, biayaResponse] = await Promise.all([
        api.get(`/cabang?toko_id=${toko_id}`),
        api.get('/biaya-toko'),
      ]);
  
      if (cabangResponse.data.success && biayaResponse.data.success) {
        const cabangData = cabangResponse.data.data;
        const biayaData = biayaResponse.data.success ? biayaResponse.data.data : [];
        setBiayaTokoData(biayaData);
  
        const cabangDenganBiaya = cabangData.filter((cabang) => {
          const biayaToko = biayaData.find((biaya) => biaya.cabang_id === cabang.cabang_id);
          return biayaToko;
        });
  
        setDataCabang(cabangDenganBiaya);
        
        if (cabangDenganBiaya.length > 0) {
          setSelectedCabang(cabangDenganBiaya[0].nama_cabang);
        }
  
        const options = cabangDenganBiaya.map((item) => ({
          label: item.nama_cabang,
          value: item.nama_cabang,
        }));
        setDataCabangOptions(options);
  
        const initialRincian = {};
        const initialHargaPerCabang = {};
  
        cabangDenganBiaya.forEach((cabang) => {
          const biayaToko = biayaData.find((biaya) => biaya.cabang_id === cabang.cabang_id);
  
          if (biayaToko) {
            const biayaList = [
              {
                id: Date.now(),
                "Nama Biaya": "Modal",
                "Jumlah Biaya": 0,
                isEditable: {
                  name: false, 
                  amount: true, 
                },
                isDefault: true 
              }
            ];
  
            initialRincian[cabang.nama_cabang] = biayaList;
  
            initialHargaPerCabang[cabang.nama_cabang] = {
              totalHPP: 0,
              hargaJual: 0,
              hargaJualIdeal: 0,
              marginPersentase: 0,
              marginNominal: 0,
              hargaLogis: 0,
              persentaseHPP: biayaToko.persentase || 0,
              keuntungan: 0
            };
          } else {
            initialRincian[cabang.nama_cabang] = null;
            initialHargaPerCabang[cabang.nama_cabang] = {
              totalHPP: 0,
              hargaJual: 0,
              hargaJualIdeal: 0,
              marginPersentase: 0,
              marginNominal: 0,
              hargaLogis: 0,
              persentaseHPP: 0,
              keuntungan: 0
            };
          }
        });
  
        setRincianBiayaPerCabang(initialRincian);
  
        if (cabangDenganBiaya.length > 0) {
          const firstCabang = cabangDenganBiaya[0].nama_cabang;
          setSelectedCabang(firstCabang);
          setData((prevData) => ({
            ...prevData,
            hargaPerCabang: initialHargaPerCabang,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  useEffect(() => {
    if (!isAdminGudang) {
      fetchCabangAndBiayaData();
    }
  }, [isAdminGudang]);

  useEffect(() => {
    if (isAdminGudang && biayaGudangData) {
      setData(prevData => ({
        ...prevData,
        persentaseHPP: biayaGudangData.persentase || 0
      }));
    }
  }, [isAdminGudang, biayaGudangData]);

  const updateGudangCalculations = () => {
    const materialCosts = materials.reduce((sum, item) => sum + (Number(item["Total Biaya"]) || 0), 0);
    const totalHPP = materialCosts;
    const persentaseHPP = data.persentaseHPP || 0;
    
    const hargaJualIdeal = totalHPP + (totalHPP * (persentaseHPP / 100));
    const hargaLogis = data.hargaLogis || 0;
    
    const marginPersentase = hargaJualIdeal > 0 ? Math.round((hargaLogis / hargaJualIdeal) * 100) : 0;
    const marginNominal = hargaLogis - hargaJualIdeal;
    
    setData(prevData => ({
      ...prevData,
      totalHPP,
      hargaJualIdeal,
      marginPersentase,
      marginNominal,
      keuntungan: hargaLogis - totalHPP
    }));
  };

  const updateCabangCalculations = (cabangName) => {
    const totalHPP = rincianBiayaPerCabang[cabangName]?.reduce(
      (sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0),
      0
    ) || 0;

    const cabangData = data.hargaPerCabang[cabangName] || {};
    const hargaLogis = cabangData.hargaLogis || 0;
    
    const cabang = dataCabang.find(c => c.nama_cabang === cabangName);
    const biayaToko = biayaTokoData.find(biaya => biaya.cabang_id === cabang?.cabang_id);
    const persentaseHPP = biayaToko?.persentase || 0;
    
    const hargaJualIdeal = totalHPP + (totalHPP * (persentaseHPP / 100));
    
    const marginPersentase = Math.round((hargaLogis / hargaJualIdeal) * 100) || 0;
    const marginNominal = hargaLogis - hargaJualIdeal;
    
    setData(prevData => ({
      ...prevData,
      hargaPerCabang: {
        ...prevData.hargaPerCabang,
        [cabangName]: {
          ...prevData.hargaPerCabang[cabangName],
          totalHPP,
          hargaJualIdeal,
          hargaJual: hargaJualIdeal, 
          marginPersentase,
          marginNominal,
          persentaseHPP,
          keuntungan: hargaLogis - totalHPP
        }
      }
    }));
  };

  const handleHargaLogisChange = isAdminGudang
  ? (value) => {
      const numValue = Number(value) || 0;
      const totalHPP = data.totalHPP || 0;
      const hargaJualIdeal = data.hargaJualIdeal || 0;
      
      const marginPersentase = hargaJualIdeal > 0 ? 
        Math.round((numValue / hargaJualIdeal) * 100) : 0;
      const marginNominal = numValue - hargaJualIdeal;
      
      setData(prevData => ({
        ...prevData,
        hargaLogis: numValue,
        marginPersentase,
        marginNominal,
        keuntungan: numValue - totalHPP
      }));
    }
  : (cabang, value) => {
      const numValue = Number(value) || 0;
      const totalHPP = data.hargaPerCabang[cabang]?.totalHPP || 0;
      const hargaJualIdeal = data.hargaPerCabang[cabang]?.hargaJualIdeal || 0;
      
      const marginPersentase = hargaJualIdeal > 0 ? 
        Math.round((numValue / hargaJualIdeal) * 100) : 0;
      const marginNominal = numValue - hargaJualIdeal;
      
      setData(prevData => ({
        ...prevData,
        hargaPerCabang: {
          ...prevData.hargaPerCabang,
          [cabang]: {
            ...prevData.hargaPerCabang[cabang],
            hargaLogis: numValue,
            marginPersentase,
            marginNominal,
            keuntungan: numValue - totalHPP
          }
        }
      }));
    };

  const handleInputChange = (type, rowIndex, key, value) => {
    setRincianBiayaPerCabang(prevData => {
      const cabangData = [...prevData[type]];
      cabangData[rowIndex] = {
        ...cabangData[rowIndex],
        [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value
      };
      return {
        ...prevData,
        [type]: cabangData
      };
    });

    updateCabangCalculations(type);
  };

  const handleAddRow = (type) => {
    const newRow = {
      id: Date.now(),  
      "Nama Biaya": "",
      "Jumlah Biaya": 0,
      isEditable: true
    };
    
    setRincianBiayaPerCabang((prevData) => {
      const updatedRows = [...(prevData[type] || []), newRow];
      return {
        ...prevData,
        [type]: updatedRows
      };
    });
    
    setTimeout(() => updateCabangCalculations(type), 0);
  };
  
  const handleDeleteRow = (type, rowId) => {
    setRincianBiayaPerCabang(prevData => {
      const updatedCabangData = prevData[type].filter(row => {
        if (row.isDefault) {
          return true;
        }
        return row.id !== rowId;
      });
      
      return {
        ...prevData,
        [type]: updatedCabangData
      };
    });
    
    setTimeout(() => updateCabangCalculations(type), 0);
  };

  useEffect(() => {
    // For admin gudang: update calculations when materials change
    if (isAdminGudang) {
      updateGudangCalculations();
    }
  }, [materials]);

  useEffect(() => {
    if (!isAdminGudang && selectedCabang && data.hargaPerCabang) {
      updateCabangCalculations(selectedCabang);
    }
  }, [selectedCabang, rincianBiayaPerCabang, isAdminGudang]);

  const handleInfoBarangChange = (key, value) => {
    setData((prevData) => ({
      ...prevData,
      info_barang: {
        ...prevData.info_barang,
        [key]: value,
      },
    }));
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('id-ID');
  };

  const materialHeaders = [
    { label: "No", key: "No", align: "text-left" },
    { label: "Foto Produk", key: "Foto", align: "text-center" },
    { label: "Nama Bahan", key: "Nama Bahan", align: "text-left" },
    { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
    { label: "Kuantitas", key: "Kuantitas", align: "text-left", width: '110px' },
    { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
    { label: "Aksi", key: "Aksi", align: "text-center" }
  ];

  const isHargaLogisHigherThan65Percent = (cabang) => {
    if (isAdminGudang) {
      const hargaJualIdeal = data.hargaJualIdeal || 0;
      const hargaLogis = data.hargaLogis || 0;
      
      if (hargaJualIdeal === 0) return false;
      
      const minRequiredPercentage = 65; 
      const currentPercentage = ((hargaLogis - hargaJualIdeal) / hargaJualIdeal) * 100;
      
      return currentPercentage > minRequiredPercentage;
    } else {
      const cabangData = data.hargaPerCabang[cabang];
      if (!cabangData) return false;
      
      const hargaJualIdeal = cabangData.hargaJualIdeal || 0;
      const hargaLogis = cabangData.hargaLogis || 0;
      
      if (hargaJualIdeal === 0) return false;
      
      const minRequiredPercentage = 65; 
      const currentPercentage = ((hargaLogis - hargaJualIdeal) / hargaJualIdeal) * 100;
      
      return currentPercentage > minRequiredPercentage;
    }
  };

  const getWarningMessage = () => {
    if (isAdminGudang) {
      return `Harga Logis berikut melebihi 65% dari Harga Jual Ideal. Apakah Anda yakin ingin melanjutkan?`;
    } else {
      const overPricedCabang = [];
      
      Object.entries(data.hargaPerCabang).forEach(([cabangName, cabangData]) => {
        const hargaJualIdeal = cabangData.hargaJualIdeal || 0;
        const hargaLogis = cabangData.hargaLogis || 0;
        
        if (hargaJualIdeal > 0) {
          const currentPercentage = ((hargaLogis - hargaJualIdeal) / hargaJualIdeal) * 100;
          if (currentPercentage > 65) {
            overPricedCabang.push({
              name: cabangName,
              percentage: Math.round(currentPercentage)
            });
          }
        }
      });
      
      if (overPricedCabang.length > 0) {
        let message = "Harga Logis di cabang berikut melebihi 65% dari Harga Jual Ideal:\n";
        overPricedCabang.forEach(cabang => {
          message += `- ${cabang.name}: ${cabang.percentage}%\n`;
        });
        message += "\nApakah Anda yakin ingin melanjutkan?";
        return message;
      }
      
      return "";
    }
  };

  const processFormSubmission = async (formDataToSubmit) => {
    try {
      setLoading(true);

      const endpoint = isAdminGudang ? '/barang-handmade-gudang' : '/barang-handmade';
      
      const response = await api.post(endpoint, formDataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setAlertSucc(true);
        setTimeout(() => {
          navigate('/dataBarang/handmade');
        }, 2000);
      } else {
        setErrorMessage(response.data.message);
        setErrorAlert(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (!data.info_barang.Foto) {
        setErrorMessage("Foto barang belum dipilih. Harap unggah foto terlebih dahulu.");
        setErrorAlert(true);
        return;
      }
  
      if (!data.info_barang["Nama Barang"]) {
        setErrorMessage("Nama barang harus diisi");
        setErrorAlert(true);
        return;
      }
  
      if (!data.info_barang.Kategori) {
        setErrorMessage("Kategori harus dipilih");
        setErrorAlert(true);
        return;
      }
  
      if (!data.info_barang["Jumlah Minimum Stok"]) {
        setErrorMessage("Jumlah minimum stok harus diisi");
        setErrorAlert(true);
        return;
      }
  
      const formDataToSubmit = new FormData();
      
      if (isAdminGudang) {
        if (!data.info_barang["Waktu Pengerjaan"]) {
          setErrorMessage("Waktu pengerjaan harus diisi");
          setErrorAlert(true);
          return;
        }
  
        if (!data.hargaLogis || data.hargaLogis <= 0) {
          setErrorMessage("Harga logis harus diisi");
          setErrorAlert(true);
          return;
        }
        
        if (materials.length === 0) {
          setErrorMessage("Minimal harus memilih 1 bahan mentah");
          setErrorAlert(true);
          return;
        }
  
        formDataToSubmit.append('image', data.info_barang.Foto);
        formDataToSubmit.append('nama_barang', data.info_barang["Nama Barang"]);
        formDataToSubmit.append('kategori_barang_id', data.info_barang.Kategori);
        formDataToSubmit.append('jumlah_minimum_stok', data.info_barang["Jumlah Minimum Stok"]);
        formDataToSubmit.append('waktu_pengerjaan', data.info_barang["Waktu Pengerjaan"]);
        formDataToSubmit.append('keuntungan', data.keuntungan);
        formDataToSubmit.append('harga_jual', data.hargaJualIdeal); 
        formDataToSubmit.append('total_hpp', data.totalHPP);
        formDataToSubmit.append('harga_jual_ideal', data.hargaJualIdeal);
        formDataToSubmit.append('margin_persentase', data.marginPersentase);
        formDataToSubmit.append('margin_nominal', data.marginNominal);
        formDataToSubmit.append('harga_logis', data.hargaLogis);
  
        materials.forEach((material, index) => {
          formDataToSubmit.append(`rincian_bahan[${index}][barang_mentah_id]`, material.id);
          formDataToSubmit.append(`rincian_bahan[${index}][harga_satuan]`, material["Harga Satuan"]);
          formDataToSubmit.append(`rincian_bahan[${index}][kuantitas]`, material["Kuantitas"]);
          formDataToSubmit.append(`rincian_bahan[${index}][total_biaya]`, material["Total Biaya"]);
        });
  
      } else {
formDataToSubmit.append('image', data.info_barang.Foto);
        formDataToSubmit.append('kategori_barang_id', data.info_barang.Kategori);
        formDataToSubmit.append('nama_barang', data.info_barang["Nama Barang"]);
        formDataToSubmit.append('jumlah_minimum_stok', data.info_barang["Jumlah Minimum Stok"]);
        formDataToSubmit.append('toko_id', toko_id)
  
        const rincianBiayaData = [];
        let hasError = false;
      
        Object.entries(data.hargaPerCabang).forEach(([cabangName, cabangData]) => {
          const cabang = dataCabang.find((c) => c.nama_cabang === cabangName);
          const rincianBiaya = rincianBiayaPerCabang[cabangName];
      
          if (!rincianBiaya) {
            hasError = true;
            return;
          }
      
          if (!cabangData.hargaLogis || cabangData.hargaLogis <= 0) {
            hasError = true;
            setErrorMessage(`Harga logis pada cabang "${cabangName}" belum diisi.`);
            setErrorAlert(true);
            return;
          }
      
          if (cabang && cabang.cabang_id) {
            const rincianData = {
              cabang_id: cabang.cabang_id,
              total_hpp: cabangData.totalHPP || 0,
              keuntungan: cabangData.keuntungan || 0,
              harga_jual: cabangData.hargaJualIdeal || 0,
              harga_jual_ideal: cabangData.hargaJualIdeal || 0,
              margin_persentase: cabangData.marginPersentase || 0,
              margin_nominal: cabangData.marginNominal || 0,
              harga_logis: cabangData.hargaLogis || 0,
              detail_rincian_biaya: rincianBiaya.map(item => ({
                nama_biaya: item["Nama Biaya"],
                jumlah_biaya: item["Jumlah Biaya"] || 0
              }))
            };
      
            rincianBiayaData.push(rincianData);
          }
        });
      
        if (hasError) {
          setLoading(false);
          return;
        }
      
        rincianBiayaData.forEach((biaya, index) => {
          formDataToSubmit.append(`rincian_biaya[${index}][cabang_id]`, biaya.cabang_id);
          formDataToSubmit.append(`rincian_biaya[${index}][total_hpp]`, biaya.total_hpp);
          formDataToSubmit.append(`rincian_biaya[${index}][keuntungan]`, biaya.keuntungan);
          formDataToSubmit.append(`rincian_biaya[${index}][harga_jual]`, biaya.harga_jual);
          formDataToSubmit.append(`rincian_biaya[${index}][harga_jual_ideal]`, biaya.harga_jual_ideal);
          formDataToSubmit.append(`rincian_biaya[${index}][margin_persentase]`, biaya.margin_persentase);
          formDataToSubmit.append(`rincian_biaya[${index}][margin_nominal]`, biaya.margin_nominal);
          formDataToSubmit.append(`rincian_biaya[${index}][harga_logis]`, biaya.harga_logis);
        
          biaya.detail_rincian_biaya.forEach((detail, detailIndex) => {
            formDataToSubmit.append(
              `rincian_biaya[${index}][detail_rincian_biaya][${detailIndex}][nama_biaya]`,
              detail.nama_biaya
            );
            formDataToSubmit.append(
              `rincian_biaya[${index}][detail_rincian_biaya][${detailIndex}][jumlah_biaya]`,
              detail.jumlah_biaya
            );
          });
        });
      }

      let needConfirmation = false;
      
      if (isAdminGudang) {
        needConfirmation = isHargaLogisHigherThan65Percent();
      } else {
        Object.keys(data.hargaPerCabang).forEach(cabangName => {
          if (isHargaLogisHigherThan65Percent(cabangName)) {
            needConfirmation = true;
          }
        });
      }
      
      if (needConfirmation) {
        setFormData(formDataToSubmit);
        setConfirmDialogOpen(true);
      } else {
        await processFormSubmission(formDataToSubmit);
      }
  
    } catch (error) {
      console.error('Error preparing form:', error);
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat memproses data');
      setErrorAlert(true);
      setLoading(false);
    }
  };

  const handleConfirmHargaLogis = async () => {
    setConfirmDialogOpen(false);
    
    if (formData) {
      await processFormSubmission(formData);
    }
  };
  
  const handleCancelHargaLogis = () => {
    setConfirmDialogOpen(false);
    setFormData(null);
  };

  const navigate = useNavigate()
  const handleBtnCancel = () => {
    navigate('/dataBarang/handmade')
  }



  return (
    <LayoutWithNav
      menuItems={menuItems}
      userOptions={userOptions}
      label={"Tambah Data Barang Handmade"}
    >
      <div className="p-5">
        <Breadcrumbs items={breadcrumbItems} />

        <section className="mt-5 bg-white rounded-xl">
          <div className="pt-5 px-5">
            <form onSubmit={handleSubmit}>
              <div>
                <p className="pb-5 font-bold">Masukan Foto Barang</p>
                <FileInput 
                  label={"Masukan Foto Barang"}
                  onFileChange={(file) => handleInfoBarangChange("Foto", file)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                <Input 
                  label={"Nomor"} 
                  disabled={true}
                  onChange={(value) => handleInfoBarangChange("Nomor", value)}
                />
                <Input
                  label={"Nama Barang"}
                  required={true}
                  placeholder="Masukan Nama Barang"
                  value={data.info_barang["Nama Barang"]}
                  onChange={(value) => handleInfoBarangChange("Nama Barang", value)}
                />
                <div>
                  <p className="text-gray-700 font-medium">
                    Kategori<span className="text-red-500">*</span>
                  </p>
                  <InputDropdown
                    showRequired={false}
                    options={dataKategori}
                    onSelect={(selectedOption) => handleInfoBarangChange("Kategori", selectedOption.value)}
                    value={data.info_barang.Kategori}
                  />
                </div>
                {isAdminGudang && (
                  <Input
                    label={"Waktu Pengerjaan"}
                    type={"number"}
                    required={true}
                    value={data.info_barang["Waktu Pengerjaan"]}
                    placeholder="Masukan Durasi Pengerjaan (Dalam Hitungan Menit)"
                    onChange={(value) => handleInfoBarangChange("Waktu Pengerjaan", value)}
                  />
                )}
                <Input
                  label={"Jumlah Minimum Stok"}
                  type={"number"}
                  required={true}
                  value={data.info_barang["Jumlah Minimum Stok"]}
                  placeholder="Masukan Jumlah Minimum Stok Untuk mendapatkan Notifikasi"
                  onChange={(value) => handleInfoBarangChange("Jumlah Minimum Stok", value)}
                />
              </div>

              {isAdminGudang ? (
                <>
                  <section className="pt-5">
                    <p className="font-bold">Rincian Jumlah dan Bahan</p>
                    <div className="pt-3">
                      <Table
                        headers={materialHeaders}
                        data={materials.map((row, index) => ({
                          No: index + 1,
                          "Foto": (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                              {row.Foto ? (
                                <img 
                                  src={row.Foto}
                                  alt={row["Nama Bahan"] || 'Product'} 
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    console.error("Image load error for:", row.Foto);
                                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full text-gray-400">No Image</div>';
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>
                          ),
                          "Nama Bahan": (
                            <InputDropdown
                              showRequired={false}
                              options={materialOptions}
                              value={row.selectedId}
                              onSelect={(selectedOption) => {
                                const updatedMaterials = [...materials];
                                let imageUrl = selectedOption.image;
                                
                                if (imageUrl && !imageUrl.startsWith('http')) {
                                  imageUrl = `${import.meta.env.VITE_API_URL}/images-barang-mentah/${imageUrl}`;
                                }
                                
                                updatedMaterials[index] = {
                                  ...updatedMaterials[index],
                                  id: selectedOption.value,
                                  selectedId: selectedOption.value,
                                  "Nama Bahan": selectedOption.label,
                                  "Harga Satuan": selectedOption.price,
                                  "Total Biaya": selectedOption.price * (updatedMaterials[index]["Kuantitas"] || 0),
                                  Foto: imageUrl,
                                  value: selectedOption.value,
                                  label: selectedOption.label
                                };
                                setMaterials(updatedMaterials);
                              }}
                            />
                          ),
                          "Harga Satuan": `Rp${formatCurrency(row["Harga Satuan"] || 0)}`,
                          "Kuantitas": (
                            <Input
                              showRequired={false}
                              type="number" 
                              value={row["Kuantitas"]}
                              onChange={(value) => {
                                const updatedMaterials = [...materials];
                                const numValue = Number(value) || 0;
                                updatedMaterials[index] = {
                                  ...updatedMaterials[index],
                                  "Kuantitas": numValue,
                                  "Total Biaya": (updatedMaterials[index]["Harga Satuan"] || 0) * numValue
                                };
                                setMaterials(updatedMaterials);
                              }}
                            />
                          ),
                          "Total Biaya": `Rp${formatCurrency(row["Total Biaya"] || 0)}`,
                          "Aksi": (
                            <Button
                              label="Hapus"
                              bgColor=""
                              textColor="text-red-600"
                              hoverColor="hover:text-red-800"
                              onClick={() => {
                                const updatedMaterials = materials.filter((_, idx) => idx !== index);
                                setMaterials(updatedMaterials);
                              }}
                            />
                          )
                        }))}
                      />
                      <Button
                        label="Tambah Baris"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        }
                        bgColor={`focus:ring-${themeColor}`}
                        hoverColor={`hover:border-${themeColor} hover:border`}
                        textColor={`text-${themeColor}`}
                        onClick={handleMaterialModal}
                      />
                    </div>
                  </section>

                  <section className="mt-8 flex justify-end">
                    <div className="px-5 space-y-2">
                      <div className="flex justify-between items-center border-b pb-2">
                        <p className="text-md font-bold">Total HPP</p>
                        <p className="text-md">Rp{formatCurrency(data.totalHPP)}</p>
                      </div>
                      
                      <div className="flex justify-between items-center border-b pb-2">
                        <p className="text-md font-bold">Harga Jual Ideal</p>
                        <p className="text-md">Rp{formatCurrency(data.hargaJualIdeal)}</p>
                      </div>
                      
                      <div className="flex justify-between items-center border-b pb-2">
                        <p className="text-md font-bold">Margin Persentase</p>
                        <p className="text-md">{data.marginPersentase}%</p>
                      </div>
                      
                      <div className="flex justify-between items-center border-b pb-2">
                        <p className="text-md font-bold">Margin Nominal</p>
                        <p className="text-md">Rp{formatCurrency(data.marginNominal)}</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-1">
                        <div>
                          <p className="text-md text-red-600 font-bold">Harga Logis (Harga Jual Akhir)</p>
                        </div>
                        <div className="ps-10">
                          <Input
                            showRequired={false}
                            type="number"
                            width="w-40"
                            value={data.hargaLogis}
                            onChange={(value) => handleHargaLogisChange(value)}
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <p className={`font-bold text-base text-${themeColor}`}>Rincian Berdasarkan Cabang</p>
                      <div className="w-60">
                        <ButtonDropdown
                          label={selectedCabang}
                          options={dataCabangOptions}
                          onSelect={setSelectedCabang}
                          selectedStore={selectedCabang}
                          icon={
                            <svg className={`w-6 h-6 text-${themeColor}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                            </svg>
                          }
                        />
                      </div>
                    </div>
                  </section>

                  {selectedCabang && data.hargaPerCabang && data.hargaPerCabang[selectedCabang] && (
                    <>
                     <section className="pt-5">
                        <p className="font-bold">Rincian Harga Pokok Penjualan (HPP)</p>
                        <div className="pt-3">
                          <Table
                            headers={headers}
                            data={(rincianBiayaPerCabang[selectedCabang] || []).map((row, index) => ({
                              No: index + 1,
                              "Nama Biaya": row.isDefault ? (
                                row["Nama Biaya"]
                              ) : (
                                <Input
                                  showRequired={false}
                                  className="w-full"
                                  value={row["Nama Biaya"]}
                                  onChange={(value) =>
                                    handleInputChange(selectedCabang, index, "Nama Biaya", value)
                                  }
                                />
                              ),
                              "Jumlah Biaya": (
                                <Input
                                  showRequired={false}
                                  type="number"
                                  width="w-full"
                                  value={row["Jumlah Biaya"]}
                                  onChange={(value) =>
                                    handleInputChange(selectedCabang, index, "Jumlah Biaya", value)
                                  }
                                />
                              ),
                              Aksi: !row.isDefault ? (
                                <Button
                                  label="Hapus"
                                  bgColor=""
                                  textColor="text-red-600"
                                  hoverColor="hover:text-red-800"
                                  onClick={() => handleDeleteRow(selectedCabang, row.id)}
                                />
                              ) : null,
                            }))}
                          />
                          <Button
                            label="Tambah Baris"
                            icon={
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            }
                            bgColor={`focus:ring-${themeColor}`}
                            hoverColor={`hover:border-${themeColor} hover:border`}
                            textColor={`text-${themeColor}`}
                            onClick={() => handleAddRow(selectedCabang)}
                          />
                        </div>
                      </section>

                      <section className="mt-8 flex justify-end">
                        <div className="px-5 space-y-2">
                          <div className="flex justify-between items-center border-b pb-2">
                            <p className="text-md font-bold">Total HPP</p>
                            <p className="text-md">Rp{formatCurrency(data.hargaPerCabang[selectedCabang].totalHPP)}</p>
                          </div>
                          
                          <div className="flex justify-between items-center border-b pb-2">
                            <p className="text-md font-bold">Harga Jual Ideal</p>
                            <p className="text-md">Rp{formatCurrency(data.hargaPerCabang[selectedCabang].hargaJualIdeal)}</p>
                          </div>
                          
                          <div className="flex justify-between items-center border-b pb-2">
                            <p className="text-md font-bold">Margin Persentase</p>
                            <p className="text-md">{data.hargaPerCabang[selectedCabang].marginPersentase}%</p>
                          </div>
                          
                          <div className="flex justify-between items-center border-b pb-2">
                            <p className="text-md font-bold">Margin Nominal</p>
                            <p className="text-md">Rp{formatCurrency(data.hargaPerCabang[selectedCabang].marginNominal)}</p>
                          </div>
                          
                          <div className="flex justify-between items-center pt-1">
                            <div>
                              <p className="text-md text-red-600 font-bold">Harga Logis (Harga Jual Akhir)</p>
                            </div>
                            <div className="ps-10">
                              <Input
                                showRequired={false}
                                type="number"
                                width="w-40"
                                value={data.hargaPerCabang[selectedCabang].hargaLogis}
                                onChange={(value) => handleHargaLogisChange(selectedCabang, value)}
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    </>
                  )}
                  
                  <section className="px-5 mt-8">
                    <p className="font-bold text-base mb-4">Ringkasan Harga Jual Seluruh Cabang</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(data.hargaPerCabang).map(([cabangName, cabangData]) => (
                        <div 
                          key={cabangName} 
                          className="border border-gray-300 bg-[#F9F9F9] rounded-lg p-4"
                        >
                          <h3 className={`text-${themeColor} mb-3 font-medium`}>Cabang {cabangName}</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-gray-700 text-sm">Harga Ideal</p>
                              <p className="font-medium">Rp{formatCurrency(cabangData.hargaJualIdeal)}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-gray-700 text-sm">Harga Logis</p>
                              <p className="font-medium">Rp{formatCurrency(cabangData.hargaLogis)}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-gray-700 text-sm">Margin Persentase</p>
                              <p className="font-medium">{cabangData.marginPersentase}%</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-gray-700 text-sm">Margin Nominal</p>
                              <p className="font-medium">Rp{formatCurrency(cabangData.marginNominal)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {isMaterialModalOpen && (
                <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                  <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-auto flex flex-col`}>
                    <div className="flex flex-col space-y-4 mb-4">
                      {/* Top row: Search and clear button */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="relative w-full sm:max-w-md">
                          <span className="absolute inset-y-0 left-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.707 19.293l-4.054-4.054A7.948 7.948 0 0016 9.5 8 8 0 108 17.5c1.947 0 3.727-.701 5.239-1.865l4.054 4.054a1 1 0 001.414-1.414zM10 15.5A6.5 6.5 0 1110 2a6.5 6.5 0 010 13.5z" />
                            </svg>
                          </span>
                          <input
                            type="text"
                            placeholder="Cari bahan mentah"
                            value={searchMaterial}
                            onChange={(e) => setSearchMaterial(e.target.value)}
                            className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                        </div>

                        <div className="flex items-center space-x-4 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchMaterial("");
                              setSelectedMaterial([]);
                            }}
                            className="text-gray-400 hover:text-gray-700 focus:outline-none"
                            title="Hapus data terpilih"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <p className={`text-${themeColor} font-semibold`}>
                            Terpilih {selectedMaterial.reduce((sum, item) => sum + item.count, 0)}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row: Action buttons */}
                      <div className="flex justify-end gap-4">
                        <Button
                          label="Batal"
                          bgColor="border border-secondary"
                          hoverColor="hover:bg-gray-100"
                          textColor="text-black"
                          onClick={() => setIsMaterialModalOpen(false)}
                        />
                        <Button
                          label="Pilih"
                          bgColor={`bg-${themeColor}`}
                          hoverColor="hover:bg-opacity-90"
                          textColor="text-white"
                          onClick={handleMaterialModalSubmit}
                        />
                      </div>
                    </div>



                    {/* Items per page dropdown */}
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-sm text-gray-600">Items per page:</span>
                      <select
                        value={paginationMaterial.limit}
                        onChange={(e) => {
                          const newLimit = Number(e.target.value);
                          setPaginationMaterial(prev => ({ ...prev, page: 1, limit: newLimit }));
                        }}
                        className={`border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-${themeColor}`}
                      >
                        {[12, 24, 48, 96].map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Gallery */}
                    <div className="mt-6 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                      <Gallery2
                        items={galleryMaterials[0].items}
                        onSelect={handleMaterialSelect}
                        selectedItems={selectedMaterial}
                        enableStockValidation={true}
                        showPagination={true}
                        currentPage={paginationMaterial.page}
                        totalPages={paginationMaterial.totalPages}
                        totalItems={paginationMaterial.total}
                        itemsPerPage={paginationMaterial.limit}
                        onPageChange={(newPage) => {
                          setPaginationMaterial(prev => ({ ...prev, page: newPage }));
                        }}
                        onItemsPerPageChange={() => {}} // Disabled because we moved it to top
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Action Buttons */}
              <section className="p-5">
                <div className="flex w-full justify-end gap-4">
                  <Button 
                    label={'Batal'} 
                    bgColor="bg-white border border-secondary" 
                    textColor="text-gray-600"
                    className="border border-gray-300"
                    onClick={handleBtnCancel}
                  />
                  <Button 
                    label={'Simpan'} 
                    bgColor={`bg-${themeColor}`} 
                    textColor="text-white" 
                    type="submit"
                  />
                </div>
              </section>
            </form>
          </div>
        </section>
      </div>
      {isAlertSuccess && (
        <AlertSuccess
          title="Berhasil!!"
          description="Data Berhasil Ditambahkan"
          confirmLabel="Ok"
          onConfirm={() => setAlertSucc(false)}
        />
      )}

      {isLoading && (
        <Spinner/>
      )}

      {isErrorAlert && (
        <AlertError
          title="Gagal!!"
          description={errorMessage}
          confirmLabel="Ok"
          onConfirm={() => setErrorAlert(false)}
        />
      )}  
      
      {/* konfirmasi harga logis besar dari 65 */}
      {isConfirmDialogOpen && (
        <AlertConfirm
          title="Konfirmasi Harga Logis"
          description={getWarningMessage()}
          confirmLabel="Ya, Saya Yakin"
          cancelLabel="Batal"
          onConfirm={handleConfirmHargaLogis}
          onCancel={handleCancelHargaLogis}
        />
      )}
    </LayoutWithNav>
  );
}