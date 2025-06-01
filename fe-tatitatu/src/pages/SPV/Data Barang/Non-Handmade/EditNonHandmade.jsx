import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../utils/api";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import FileInput from "../../../../components/FileInput";
import Input from "../../../../components/Input";
import InputDropdown from "../../../../components/InputDropdown";
import Table from "../../../../components/Table";
import ButtonDropdown from "../../../../components/ButtonDropdown";
import Button from "../../../../components/Button";
import Gallery2 from "../../../../components/Gallery2";
import AlertSuccess from "../../../../components/AlertSuccess";
import Spinner from "../../../../components/Spinner";
import AlertError from "../../../../components/AlertError";
import { menuItems, userOptions } from "../../../../data/menu";

// edit barang non handmade
export default function EditBarang() {
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
  const [searchTerm, setSearchTerm] = useState("");
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
  const { id } = useParams();
  const toko_id = userData.userId

  const themeColor = (isAdminGudang || isHeadGudang) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
      ? "hitam"
      : "primary";

  const fetchDetailBarang = async () => {
    try {
      setLoading(true);
      
      if (isAdminGudang) {
        // Khusus untuk admin gudang
        const [detailResponse, biayaGudangResponse, kategoriResponse] = await Promise.all([
          api.get(`/barang-nonhandmade-gudang/${id}`),
          api.get('/biaya-gudang'),
          api.get('/kategori-barang-gudang')
        ]);
  
        if (detailResponse.data.success) {
          const itemData = detailResponse.data.data;
          const biayaGudangData = biayaGudangResponse.data.success ? biayaGudangResponse.data.data : null;
          setBiayaGudangData(biayaGudangData);

          const kategoriList = kategoriResponse.data.success ? kategoriResponse.data.data : [];
          const kategoriId = kategoriList.find(k => 
            k.nama_kategori_barang === itemData.kategori.nama_kategori_barang
          )?.kategori_barang_id;
  
          // Map rincian biaya from API
          const rincianBiayaList = itemData.rincian_biaya ? itemData.rincian_biaya.map((item, index) => ({
            id: item.rincian_biaya_id || index,
            "Nama Biaya": item.nama_biaya,
            "Jumlah Biaya": item.jumlah_biaya,
            isEditable: true
          })) : [];
  
          setData({
            info_barang: {
              Nomor: itemData.barang_nonhandmade_id,
              "Nama Barang": itemData.nama_barang,
              "Kategori": kategoriId,
              "Jumlah Minimum Stok": itemData.jumlah_minimum_stok,
              "Foto": itemData.image
            },
            totalHPP: itemData.total_hpp,
            hargaJualIdeal: itemData.harga_jual_ideal || itemData.harga_jual,
            marginPersentase: itemData.margin_persentase || 0,
            marginNominal: itemData.margin_nominal || 0,
            hargaLogis: itemData.harga_logis || itemData.harga_jual,
            keuntungan: itemData.keuntungan,
            rincianBiaya: rincianBiayaList
          });
        }
      } else {
        const [detailResponse, biayaTokoResponse] = await Promise.all([
          api.get(`/barang-non-handmade/${id}`),
          api.get('/biaya-toko')
        ]);
  
        if (detailResponse.data.success) {
          const detailData = detailResponse.data.data;
          const biayaTokoData = biayaTokoResponse.data.success ? biayaTokoResponse.data.data : [];
          setBiayaTokoData(biayaTokoData);
  
          const initialHargaPerCabang = {};
          const initialRincianBiaya = {};
  
          detailData.rincian_biaya.forEach(rincian => {
            const cabangData = dataCabang.find(c => c.cabang_id === rincian.cabang_id);
            if (cabangData) {
              const biayaToko = biayaTokoData.find(bt => bt.cabang_id === rincian.cabang_id);
              const persentaseHPP = biayaToko?.persentase || 0;
              
              initialHargaPerCabang[cabangData.nama_cabang] = {
                totalHPP: rincian.total_hpp || 0,
                keuntungan: rincian.keuntungan || 0,
                hargaJual: rincian.harga_jual || 0,
                hargaJualIdeal: rincian.harga_jual_ideal || rincian.harga_jual || 0,
                marginPersentase: rincian.margin_persentase || 0,
                marginNominal: rincian.margin_nominal || 0,
                hargaLogis: rincian.harga_logis || 0,
                persentaseHPP: persentaseHPP
              };
  
              const biayaList = [];
              
              // Check if Modal exists
              let hasModal = false;
              
              if (rincian.detail_rincian_biaya && rincian.detail_rincian_biaya.length > 0) {
                rincian.detail_rincian_biaya.forEach(detail => {
                  if (detail.nama_biaya === "Modal") {
                    hasModal = true;
                    biayaList.push({
                      id: detail.detail_rincian_biaya_id || 'modal',
                      "Nama Biaya": "Modal",
                      "Jumlah Biaya": detail.jumlah_biaya,
                      isEditable: {
                        name: false,
                        amount: true
                      },
                      isDefault: true
                    });
                  } 
                  else if (!detail.biaya_toko_id) {
                    biayaList.push({
                      id: detail.detail_rincian_biaya_id,
                      "Nama Biaya": detail.nama_biaya,
                      "Jumlah Biaya": detail.jumlah_biaya,
                      isEditable: true
                    });
                  }
                });
              }

              if (!hasModal) {
                biayaList.unshift({
                  id: 'modal',
                  "Nama Biaya": "Modal",
                  "Jumlah Biaya": 0,
                  isEditable: {
                    name: false,
                    amount: true
                  },
                  isDefault: true
                });
              }
  
              initialRincianBiaya[cabangData.nama_cabang] = biayaList;
            }
          });
  
          setRincianBiayaPerCabang(initialRincianBiaya);
          setData(prevData => ({
            ...prevData,
            info_barang: {
              Nomor: detailData.barang_non_handmade_id,
              "Nama Barang": detailData.nama_barang,
              "Kategori": detailData.kategori_barang_id,
              "Jumlah Minimum Stok": detailData.jumlah_minimum_stok,
              "Foto": detailData.image
            },
            hargaPerCabang: initialHargaPerCabang
          }));

          // Set first cabang as selected
          if (detailData.rincian_biaya.length > 0) {
            const firstCabang = dataCabang.find(c => c.cabang_id === detailData.rincian_biaya[0].cabang_id);
            if (firstCabang) {
              setSelectedCabang(firstCabang.nama_cabang);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
      setErrorMessage('Gagal mengambil detail barang');
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialData2 = async () => {
    try {
      const response = await api.get('/barang-mentah');
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
          image: item.image,
          name: item.nama_barang,
          price: item.harga_satuan
        }));
        setGalleryMaterials([{ items: galleryItems }]);
      }
    } catch (error) {
      console.error('Error fetching material data:', error);
    }
  };

   const fetchMaterialData = async () => {
    try {
      const response = await api.get('/barang-mentah');
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
      fetchMaterialData2()
    }
  }, [isAdminGudang]);


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
        "Nama Bahan": item.name,
        "Harga Satuan": item.price,
        "Kuantitas": item.count,
        "Total Biaya": item.price * item.count,
        selectedId: item.id,
        value: item.id,
        label: item.name
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
    { label: "Daftar Barang Non Handmade", href: "/dataBarang/non-handmade" },
    { label: "edit", href: "" },
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
      "Jumlah Minimum Stok": "",
      Foto: null,
    },
    ...(isAdminGudang ? {
      rincianBiaya: [],
      totalHPP: 0,
      hargaJualIdeal: 0,
      marginPersentase: 0,
      marginNominal: 0,
      hargaLogis: 0,
      keuntungan: 0
    } : {
      hargaPerCabang: {} 
    })
  });

  const [rincianBiayaPerCabang, setRincianBiayaPerCabang] = useState({});

  const fetchCabangAndBiayaData = async () => {
    try {
      const [cabangResponse, biayaResponse] = await Promise.all([
        api.get('/cabang'),
        api.get('/biaya-toko'),
      ]);
  
      if (cabangResponse.data.success) {
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

  const updateGudangCalculations = () => {
    const totalHPP = data.rincianBiaya.reduce(
      (sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0),
      0
    );

    // Using a fixed percentage for harga jual ideal calculation (similar to cabang)
    const persentaseHPP = 20; // Example percentage, adjust as needed
    const hargaJualIdeal = totalHPP + (totalHPP * (persentaseHPP / 100));
    
    const hargaLogis = data.hargaLogis || 0;
    const marginPersentase = hargaJualIdeal > 0 ? 
      Math.round((hargaLogis / hargaJualIdeal) * 100) : 0;
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
    if (!rincianBiayaPerCabang[cabangName]) return;
    
    const totalHPP = rincianBiayaPerCabang[cabangName].reduce(
      (sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0),
      0
    );

    const cabangData = data.hargaPerCabang[cabangName] || {};
    const hargaLogis = cabangData.hargaLogis || 0;
    
    const cabang = dataCabang.find(c => c.nama_cabang === cabangName);
    const biayaToko = biayaTokoData.find(biaya => biaya.cabang_id === cabang?.cabang_id);
    const persentaseHPP = biayaToko?.persentase || 0;
    
    const hargaJualIdeal = totalHPP + (totalHPP * (persentaseHPP / 100));
    
    const marginPersentase = hargaJualIdeal > 0 ? Math.round((hargaLogis / hargaJualIdeal) * 100) : 0;
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

  const handleInputChange = (type, rowIndex, key, value) => {
    if (type === 'gudang') {
      setData(prevData => {
        const updatedRincianBiaya = prevData.rincianBiaya.map((row, index) =>
          index === rowIndex ? { 
            ...row, 
            [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value 
          } : row
        );
        
        return {
          ...prevData,
          rincianBiaya: updatedRincianBiaya,
        };
      });
      
      setTimeout(() => updateGudangCalculations(), 0);
    } else {
      setRincianBiayaPerCabang(prevData => {
        const cabangData = [...prevData[type]];
        const currentRow = cabangData[rowIndex];
        
        // Check if it's the modal row and trying to change name
        if (currentRow.isDefault && key === "Nama Biaya") {
          return prevData; // Don't allow changing Modal name
        }
        
        cabangData[rowIndex] = {
          ...cabangData[rowIndex],
          [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value
        };
        
        return {
          ...prevData,
          [type]: cabangData
        };
      });

      // Update calculations when any value changes
      setTimeout(() => updateCabangCalculations(type), 0);
    }
  };

  const handleDeleteRow = (type, rowId) => {
    if (type === 'gudang') {
      setData(prevData => ({
        ...prevData,
        rincianBiaya: prevData.rincianBiaya.filter(row => row.id !== rowId)
      }));
      
      setTimeout(() => updateGudangCalculations(), 0);
    } else {
      setRincianBiayaPerCabang(prevData => {
        if (!prevData[type]) {
          return prevData;
        }
        
        const updatedCabangData = prevData[type].filter(row => {
          // Never delete Modal or non-editable rows
          if (!row) return false;
          if (row.isDefault || !row.isEditable) return true;
          return row.id !== rowId;
        });
        
        return {
          ...prevData,
          [type]: updatedCabangData
        };
      });
      
      setTimeout(() => updateCabangCalculations(type), 0);
    }
  };

  const handleAddRow = (type) => {
    const newRow = {
      id: Date.now(),
      "Nama Biaya": "",
      "Jumlah Biaya": 0,
      isEditable: true
    };
  
    if (type === 'gudang') {
      setData((prevData) => ({
        ...prevData,
        rincianBiaya: [...(prevData.rincianBiaya || []), newRow],
      }));
      
      setTimeout(() => updateGudangCalculations(), 0);
    } else {
      setRincianBiayaPerCabang((prevData) => {
        const currentArray = prevData[type] || [];
        
        return {
          ...prevData,
          [type]: [...currentArray, newRow],
        };
      });
      
      setTimeout(() => updateCabangCalculations(type), 0);
    }
  };
  
  const calculateTotalHPP = (cabang) => {
    return rincianBiayaPerCabang[cabang]?.reduce(
      (sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0),
      0
    ) || 0;
  };

  const calculateKeuntungan = (hargaJual, totalHPP) => {
    const harga = Number(hargaJual) || 0;
    const hpp = Number(totalHPP) || 0;
    return harga - hpp;
  };

  useEffect(() => {
    if (!isAdminGudang && selectedCabang && data.hargaPerCabang) {
      if (data.hargaPerCabang[selectedCabang]) {
        updateCabangCalculations(selectedCabang);
      }
    }
  }, [selectedCabang, rincianBiayaPerCabang, isAdminGudang, data.hargaPerCabang]);

  useEffect(() => {
    if (isAdminGudang && data.rincianBiaya) {
      updateGudangCalculations();
    }
  }, [isAdminGudang, data.rincianBiaya]);

  const handleInfoBarangChange = (key, value) => {
    setData((prevData) => ({
      ...prevData,
      info_barang: {
        ...prevData.info_barang,
        [key]: value,
      },
    }));
  };

  const handleHargaLogisChange = (value) => {
    if (isAdminGudang) {
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
    } else {
      const cabang = selectedCabang;
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
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('id-ID');
  };

  const materialHeaders = [
    { label: "No", key: "No", align: "text-left" },
    { label: "Foto Produk", key: "Foto", align: "text-left" },
    { label: "Nama Bahan", key: "Nama Bahan", align: "text-left" },
    { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
    { label: "Kuantitas", key: "Kuantitas", align: "text-left", width:'110px' },
    { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
  ];

  // Check if harga logis is at least 65% higher than harga jual ideal
  const isHargaLogisValid = (cabang) => {
    if (isAdminGudang) {
      const hargaJualIdeal = data.hargaJualIdeal || 0;
      const hargaLogis = data.hargaLogis || 0;
      
      if (hargaJualIdeal === 0) return { isValid: true, message: "" };
      
      const minRequiredPercentage = 65; // 65% higher than harga jual ideal
      const currentPercentage = ((hargaLogis - hargaJualIdeal) / hargaJualIdeal) * 100;
      
      if (currentPercentage < minRequiredPercentage) {
        return { 
          isValid: false, 
          message: `*Harga Logis Minimal ${minRequiredPercentage}% lebih tinggi dari harga jual ideal` 
        };
      }
      
      return { isValid: true, message: "" };
    } else {
      const cabangData = data.hargaPerCabang[cabang];
      if (!cabangData) return { isValid: true, message: "" };
      
      const hargaJualIdeal = cabangData.hargaJualIdeal || 0;
      const hargaLogis = cabangData.hargaLogis || 0;
      
      if (hargaJualIdeal === 0) return { isValid: true, message: "" };
      
      const minRequiredPercentage = 65; // 65% higher than harga jual ideal
      const currentPercentage = ((hargaLogis - hargaJualIdeal) / hargaJualIdeal) * 100;
      
      if (currentPercentage < minRequiredPercentage) {
        return { 
          isValid: false, 
          message: `*Harga Logis Minimal ${minRequiredPercentage}% lebih tinggi dari harga jual ideal` 
        };
      }
      
      return { isValid: true, message: "" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      const formData = new FormData();
  
      // Validasi data wajib untuk semua role
      if (!data.info_barang.Kategori) {
        setErrorMessage("Kategori harus dipilih");
        setErrorAlert(true);
        setLoading(false);
        return;
      }
  
if (!data.info_barang["Nama Barang"]) {
        setErrorMessage("Nama barang harus diisi");
        setErrorAlert(true);
        setLoading(false);
        return;
      }
  
      if (!data.info_barang["Jumlah Minimum Stok"]) {
        setErrorMessage("Jumlah minimum stok harus diisi");
        setErrorAlert(true);
        setLoading(false);
        return;
      }
  
      if (isAdminGudang) {
        // Validasi harga logis untuk admin gudang
        if (!data.hargaLogis) {
          setErrorMessage("Harga logis harus diisi");
          setErrorAlert(true);
          setLoading(false);
          return;
        }
        
        // Data untuk admin gudang
        formData.append('nama_barang', data.info_barang["Nama Barang"]);
        formData.append('kategori_barang_id', data.info_barang.Kategori);
        formData.append('jumlah_minimum_stok', data.info_barang["Jumlah Minimum Stok"]);
        formData.append('keuntungan', data.keuntungan);
        formData.append('harga_jual', data.hargaJualIdeal);
        formData.append('harga_jual_ideal', data.hargaJualIdeal);
        formData.append('margin_persentase', data.marginPersentase);
        formData.append('margin_nominal', data.marginNominal);
        formData.append('harga_logis', data.hargaLogis);
        formData.append('total_hpp', data.totalHPP);
  
        // Handle image upload
        if (data.info_barang.Foto instanceof File) {
          formData.append('image', data.info_barang.Foto);
        }
  
        // Append all rincian biaya
        data.rincianBiaya.forEach((biaya, index) => {
          formData.append(`rincian_biaya[${index}][nama_biaya]`, biaya["Nama Biaya"]);
          formData.append(`rincian_biaya[${index}][jumlah_biaya]`, biaya["Jumlah Biaya"]);
        });

        // For debugging - log formData entries
        console.log("FormData for admin gudang:");
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
  
        // Submit to API admin gudang
        const response = await api.put(`/barang-nonhandmade-gudang/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.data.success) {
          setAlertSucc(true);
          setTimeout(() => {
            navigate('/dataBarang/non-handmade');
          }, 2000);
        }
      } else {
        // Data untuk non-admin gudang 
        if (Object.keys(data.hargaPerCabang).length === 0) {
          setErrorMessage("Data cabang belum lengkap");
          setErrorAlert(true);
          setLoading(false);
          return;
        }

        // Check if all cabang have valid harga logis
        let cabangBelumLengkap = [];
        Object.keys(data.hargaPerCabang).forEach(cabangName => {
          const hargaLogis = data.hargaPerCabang[cabangName]?.hargaLogis;

          if (!hargaLogis || hargaLogis <= 0) {
            cabangBelumLengkap.push(cabangName);
          }

          const hargaLogisValidation = isHargaLogisValid(cabangName);
          if (!hargaLogisValidation.isValid) {
            cabangBelumLengkap.push(cabangName + " (harga logis belum valid)");
          }
        });

        if (cabangBelumLengkap.length > 0) {
          setErrorMessage(`Harga logis pada cabang ${cabangBelumLengkap.join(', ')} belum valid. Mohon lengkapi data tersebut.`);
          setErrorAlert(true);
          setLoading(false);
          return;
        }

        formData.append('kategori_barang_id', data.info_barang.Kategori);
        formData.append('nama_barang', data.info_barang["Nama Barang"]);
        formData.append('jumlah_minimum_stok', data.info_barang["Jumlah Minimum Stok"]);
  
        if (data.info_barang.Foto instanceof File) {
          formData.append('image', data.info_barang.Foto);
        }
  
        const rincianBiayaData = [];
        let hasError = false;
        let cabangError = "";
      
        Object.entries(data.hargaPerCabang).forEach(([cabangName, cabangData]) => {
          const cabang = dataCabang.find((c) => c.nama_cabang === cabangName);
          const rincianBiaya = rincianBiayaPerCabang[cabangName];
      
          if (!rincianBiaya) {
            hasError = true;
            cabangError = cabangName;
            return;
          }
      
          if (cabang && cabang.cabang_id) {
            const rincianData = {
              cabang_id: cabang.cabang_id,
              total_hpp: cabangData.totalHPP || 0,
              keuntungan: cabangData.keuntungan || 0,
              harga_jual: cabangData.hargaJualIdeal || 0, // Set to hargaJualIdeal as per requirement
              harga_jual_ideal: cabangData.hargaJualIdeal || 0,
              margin_persentase: cabangData.marginPersentase || 0,
              margin_nominal: cabangData.marginNominal || 0,
              harga_logis: cabangData.hargaLogis || 0,
              detail_rincian_biaya: rincianBiaya.map(item => {
                if (!item) return null;
                
                if (item.isEditable) {
                  return {
                    nama_biaya: item["Nama Biaya"] || "",
                    jumlah_biaya: Number(item["Jumlah Biaya"]) || 0
                  };
                } else {
                  return {
                    biaya_toko_id: item.id,
                    nama_biaya: null,
                    jumlah_biaya: null
                  };
                }
              }).filter(Boolean)
            };
      
            rincianBiayaData.push(rincianData);
          }
        });
      
        if (hasError) {
          setErrorMessage(`Data rincian biaya pada cabang ${cabangError} belum lengkap`);
          setErrorAlert(true);
          setLoading(false);
          return;
        }
      
        rincianBiayaData.forEach((biaya, index) => {
          formData.append(`rincian_biaya[${index}][cabang_id]`, biaya.cabang_id);
          formData.append(`rincian_biaya[${index}][total_hpp]`, biaya.total_hpp);
          formData.append(`rincian_biaya[${index}][keuntungan]`, biaya.keuntungan);
          formData.append(`rincian_biaya[${index}][harga_jual]`, biaya.harga_jual);
          formData.append(`rincian_biaya[${index}][harga_jual_ideal]`, biaya.harga_jual_ideal);
          formData.append(`rincian_biaya[${index}][margin_persentase]`, biaya.margin_persentase);
          formData.append(`rincian_biaya[${index}][margin_nominal]`, biaya.margin_nominal);
          formData.append(`rincian_biaya[${index}][harga_logis]`, biaya.harga_logis);
        
          biaya.detail_rincian_biaya.forEach((detail, detailIndex) => {
            if (detail.biaya_toko_id) {
              formData.append(
                `rincian_biaya[${index}][detail_rincian_biaya][${detailIndex}][biaya_toko_id]`,
                detail.biaya_toko_id
              );
            } else {
              formData.append(
                `rincian_biaya[${index}][detail_rincian_biaya][${detailIndex}][nama_biaya]`,
                detail.nama_biaya || ""
              );
              formData.append(
                `rincian_biaya[${index}][detail_rincian_biaya][${detailIndex}][jumlah_biaya]`,
                detail.jumlah_biaya || 0
              );
            }
          });
        });
  
        // Submit to API non-admin gudang
        const response = await api.put(`/barang-non-handmade/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.data.success) {
          setAlertSucc(true);
          setTimeout(() => {
            navigate('/dataBarang/non-handmade');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengubah data');
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };
  
  const navigate = useNavigate()
  const handleBtnCancel = () => {
    navigate('/dataBarang/non-handmade')
  }

  useEffect(() => {
    if (id && (isAdminGudang || dataCabang.length > 0)) {
      fetchDetailBarang();
    }
  }, [id, dataCabang, isAdminGudang]);

  return (
    <LayoutWithNav
      menuItems={menuItems}
      userOptions={userOptions}
      label={"Edit Data Barang Non Handmade"}
    >
      <div className="p-5">
        <Breadcrumbs items={breadcrumbItems} />

        <section className="mt-5 bg-white rounded-xl">
          <div className="pt-5 px-5">
            <form onSubmit={handleSubmit}>
              <div>
                <p className="pb-5 font-bold">Masukan Foto Barang</p>
                {data.info_barang.Foto && !(data.info_barang.Foto instanceof File) ? (
                  <div className="mb-4">
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/${isAdminGudang ? 'images-barang-non-handmade-gudang' : 'images-barang-non-handmade'}/${data.info_barang.Foto}`}
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                ) : data.info_barang.Foto instanceof File ? (
                  <div className="mb-4">
                    <img 
                      src={URL.createObjectURL(data.info_barang.Foto)}
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                ) : null}
                <FileInput 
                  label={"Masukan Foto Barang"}
                  onFileChange={(file) => handleInfoBarangChange("Foto", file)}
                />
              </div>

              {/* Basic Info Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                <Input 
                  label={"Nomor"} 
                  disabled={true}
                  onChange={(value) => handleInfoBarangChange("Nomor", value)}
                  value={data.info_barang.Nomor}
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
                <section className="pt-5">
                <p className="font-bold">Rincian Biaya</p>
                <div className="pt-3">
                  <Table
                    headers={headers}
                    data={data.rincianBiaya.map((row, index) => ({
                      No: index + 1,
                      "Nama Biaya": (
                        <Input
                          showRequired={false}
                          className="w-full max-w-xs sm:max-w-sm"
                          value={row["Nama Biaya"]}
                          onChange={(value) =>
                            handleInputChange('gudang', index, "Nama Biaya", value)
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
                            handleInputChange('gudang', index, "Jumlah Biaya", value)
                          }
                        />
                      ),
                      Aksi: (
                        <Button
                          label="Hapus"
                          bgColor=""
                          textColor="text-red-600"
                          hoverColor="hover:text-red-800"
                          onClick={() => handleDeleteRow('gudang', row.id)}
                        />
                      ),
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
                    onClick={() => handleAddRow('gudang')}
                  />
                </div>

                {/* Modified Totals Section for admin gudang - Matching the non-admin layout */}
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
                        {!isHargaLogisValid().isValid && (
                          <p className="text-red-500 text-sm">{isHargaLogisValid().message}</p>
                        )}
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
              </section>
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

                  {selectedCabang && rincianBiayaPerCabang[selectedCabang] && (
                    <>
                      <section className="pt-5">
                        <p className="font-bold">Rincian Harga Pokok Penjualan (HPP)</p>
                        <div className="pt-3">
                          <Table
                            headers={headers}
                            data={(rincianBiayaPerCabang[selectedCabang] || []).map((row, index) => {
                              if (!row) return null;
                              
                              const isModal = row.isDefault;
                              return {
                                No: index + 1,
                                "Nama Biaya": row.isEditable && !isModal ? (
                                  <Input
                                    showRequired={false}
                                    className="w-full max-w-xs sm:max-w-sm"
                                    value={row["Nama Biaya"]}
                                    onChange={(value) =>
                                      handleInputChange(selectedCabang, index, "Nama Biaya", value)
                                    }
                                    disabled={isModal}
                                  />
                                ) : (
                                  row["Nama Biaya"]
                                ),
                                "Jumlah Biaya": row.isEditable ? (
                                  <Input
                                    showRequired={false}
                                    type="number"
                                    width="w-full"
                                    value={row["Jumlah Biaya"]}
                                    onChange={(value) =>
                                      handleInputChange(selectedCabang, index, "Jumlah Biaya", value)
                                    }
                                  />
                                ) : (
                                  `Rp${formatCurrency(row["Jumlah Biaya"])}`
                                ),
                                Aksi: row.isEditable && !isModal ? (
                                  <Button
                                    label="Hapus"
                                    bgColor=""
                                    textColor="text-red-600"
                                    hoverColor="hover:text-red-800"
                                    onClick={() => handleDeleteRow(selectedCabang, row.id)}
                                  />
                                ) : null,
                              };
                            }).filter(Boolean)}
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
                            <p className="text-md">Rp{formatCurrency(data.hargaPerCabang[selectedCabang]?.totalHPP)}</p>
                          </div>
                          
                          <div className="flex justify-between items-center border-b pb-2">
                            <p className="text-md font-bold">Harga Jual Ideal</p>
                            <p className="text-md">Rp{formatCurrency(data.hargaPerCabang[selectedCabang]?.hargaJualIdeal)}</p>
                          </div>
                          
                          <div className="flex justify-between items-center border-b pb-2">
                            <p className="text-md font-bold">Margin Persentase</p>
                            <p className="text-md">{data.hargaPerCabang[selectedCabang]?.marginPersentase}%</p>
                          </div>
                          
                          <div className="flex justify-between items-center border-b pb-2">
                            <p className="text-md font-bold">Margin Nominal</p>
                            <p className="text-md">Rp{formatCurrency(data.hargaPerCabang[selectedCabang]?.marginNominal)}</p>
                          </div>
                          
                          <div className="flex justify-between items-center pt-1">
                            <div>
                              <p className="text-md text-red-600 font-bold">Harga Logis (Harga Jual Akhir)</p>
                              {!isHargaLogisValid(selectedCabang).isValid && (
                                <p className="text-red-500 text-sm">{isHargaLogisValid(selectedCabang).message}</p>
                              )}
                            </div>
                            <div className="ps-10">
                              <Input
                                showRequired={false}
                                type="number"
                                width="w-40"
                                value={data.hargaPerCabang[selectedCabang]?.hargaLogis}
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
                  <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden`}>
                    <div className="flex flex-wrap md:flex-nowrap items-center justify-between mb-4 gap-4">
                      {/* Search input */}
                      <div className="relative w-full max-w-md flex-shrink-0">
                        <span className="absolute inset-y-0 left-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.707 19.293l-4.054-4.054A7.948 7.948 0 0016 9.5 8 8 0 108 17.5c1.947 0 3.727-.701 5.239-1.865l4.054 4.054a1 1 0 001.414-1.414zM10 15.5A6.5 6.5 0 1110 2a6.5 6.5 0 010 13.5z" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          placeholder="Cari bahan mentah"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </div>

                      {/* Selected count */}
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-${themeColor} font-semibold`}>
                            Terpilih {selectedMaterial.reduce((sum, item) => sum + item.count, 0)}
                          </p>
                          {selectedMaterial.length > 0 && (
                            <button 
                              onClick={() => setSelectedMaterial([])} 
                              className="hover:bg-gray-100 p-1 rounded-full"
                            >
                              <svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                              </button>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-4">
                        <Button
                          label="Batal"
                          textColor="text-black"
                          bgColor="border border-secondary"
                          onClick={() => setIsMaterialModalOpen(false)}
                        />
                        <Button
                          label="Pilih"
                          bgColor={`bg-${themeColor}`}
                          textColor="text-white"
                          onClick={handleMaterialModalSubmit}
                        />
                      </div>
                    </div>

                    {/* Gallery */}
                    <div className="mt-6 h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
                      <Gallery2
                        items={galleryMaterials[0].items.filter(item => 
                          item.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )}
                        onSelect={handleMaterialSelect}
                        selectedItems={selectedMaterial}
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
            description="Data Berhasil Diperbaharui"
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
    </LayoutWithNav>
  );
}