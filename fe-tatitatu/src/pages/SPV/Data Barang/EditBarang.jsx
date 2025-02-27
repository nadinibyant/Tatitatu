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
import { useNavigate, useParams } from "react-router-dom";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import AlertError from "../../../components/AlertError";

export default function EditBarang() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdminGudang = userData?.role === 'admingudang';
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
  const toko_id = userData.userId
  const { id } = useParams();

  const [biayaGudangData, setBiayaGudangData] = useState(null);
  
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

  useEffect(() => {
    if (isAdminGudang) {
      fetchBiayaGudang();
    }
  }, [isAdminGudang]);


  useEffect(() => {
    if (!isAdminGudang) {
      fetchCabangAndBiayaData();
    }
  }, [isAdminGudang]);

  const fetchDetailBarang = async () => {
    try {
      setLoading(true);
      
      const detailResponse = isAdminGudang 
        ? await api.get(`/barang-handmade-gudang/${id}`)
        : await Promise.all([
            api.get(`/barang-handmade/${id}`),
            api.get('/biaya-toko')
          ]);
  
      if (isAdminGudang) {
        if (detailResponse.data.success) {
          const detailData = detailResponse.data.data;
          setData(prevData => ({
            ...prevData,
            info_barang: {
              ...prevData.info_barang,
              Nomor: detailData.barang_handmade_id,
              "Nama Barang": detailData.nama_barang,
              "Kategori": detailData.kategori_barang_id,
              "Waktu Pengerjaan": detailData.waktu_pengerjaan,
              "Jumlah Minimum Stok": detailData.jumlah_minimum_stok,
              "Foto": detailData.image
            },
            totalHPP: detailData.total_hpp,
            keuntungan: detailData.keuntungan,
            hargaJual: detailData.harga_jual,
            rincianBiaya: detailData.rincian_biaya.map((biaya, index) => ({
              id: index + 1,
              "Nama Biaya": biaya.nama_biaya,
              "Jumlah Biaya": biaya.jumlah_biaya,
              isEditable: false
            }))
          }));
  
          if (detailData.rincian_bahan) {
            setMaterials(detailData.rincian_bahan.map((bahan, index) => ({
              id: bahan.barang_mentah_id,
              No: index + 1,
              Foto: bahan.barang_mentah.image,
              "Nama Bahan": bahan.barang_mentah.nama_barang,
              "Harga Satuan": bahan.harga_satuan,
              "Kuantitas": bahan.kuantitas,
              "Total Biaya": bahan.total_biaya,
              selectedId: bahan.barang_mentah_id,
              value: bahan.barang_mentah_id,
              label: bahan.barang_mentah.nama_barang
            })));
          }
        }
      } else {
        const [detailDataResponse, biayaTokoResponse] = detailResponse;
      if (detailDataResponse.data.success) {
        const detailData = detailDataResponse.data.data;
        const biayaTokoData = biayaTokoResponse.data.success ? biayaTokoResponse.data.data : [];
        
        setData(prevData => ({
          ...prevData,
          info_barang: {
            ...prevData.info_barang,
            Nomor: detailData.barang_handmade_id,
            "Nama Barang": detailData.nama_barang,
            "Kategori": detailData.kategori_barang_id,
            "Jumlah Minimum Stok": detailData.jumlah_minimum_stok,
            Foto: detailData.image
          },
        }));
        
        const initialHargaPerCabang = {};
        const initialRincianBiaya = {};

        detailData.rincian_biaya.forEach(rincian => {
          const cabangData = dataCabang.find(c => c.cabang_id === rincian.cabang_id);
          if (cabangData) {
            const biayaToko = biayaTokoData.find(bt => bt.cabang_id === rincian.cabang_id);

            initialHargaPerCabang[cabangData.nama_cabang] = {
              totalHPP: rincian.total_hpp,
              keuntungan: rincian.keuntungan,
              hargaJual: rincian.harga_jual
            };

            const biayaList = [];
            
            rincian.detail_rincian_biaya.forEach(detail => {
              if (detail.nama_biaya === "Modal") {
  
                biayaList.push({
                  id: 'modal', 
                  "Nama Biaya": "Modal",
                  "Jumlah Biaya": detail.jumlah_biaya,
                  isEditable: true,
                  isDefault: true 
                });
              } else if (detail.biaya_toko_id && biayaToko) {
                biayaList.push({
                  id: detail.biaya_toko_id,
                  "Nama Biaya": `Biaya Operasional dan Staff ${cabangData.nama_cabang}`,
                  "Jumlah Biaya": biayaToko.total_biaya,
                  isEditable: false
                });
              } else if (!detail.biaya_toko_id && detail.nama_biaya !== "Modal") {
                biayaList.push({
                  id: detail.detail_rincian_biaya_id,
                  "Nama Biaya": detail.nama_biaya,
                  "Jumlah Biaya": detail.jumlah_biaya,
                  isEditable: true
                });
              }
            });

            if (!biayaList.some(item => item["Nama Biaya"] === "Modal")) {
              biayaList.unshift({
                id: 'modal', 
                "Nama Biaya": "Modal",
                "Jumlah Biaya": 0,
                isEditable: true,
                isDefault: true 
              });
            }

            initialRincianBiaya[cabangData.nama_cabang] = biayaList;
          }
        });

        setRincianBiayaPerCabang(initialRincianBiaya);
        setData(prevData => ({
          ...prevData,
          hargaPerCabang: initialHargaPerCabang
        }));
        }
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
      setErrorMessage('Gagal mengambil data barang');
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
          image: item.image.startsWith('http') 
            ? item.image 
            : `${import.meta.env.VITE_API_URL}/images-barang-mentah/${item.image}`
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
  
      const imageUrl = materialOption.image.startsWith('http') 
        ? materialOption.image 
        : `${import.meta.env.VITE_API_URL}/images-barang-mentah/${materialOption.image}`;
      
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
    { label: "Daftar Barang Handmade", href: "/dataBarang/handmade" },
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
      "Waktu Pengerjaan": "",
      "Jumlah Minimum Stok": "",
      Foto: "",
    },
    ...(isAdminGudang ? {
      rincianBiaya: [
        {
          id: 1,
          "Nama Biaya": "Biaya Operasional & Staff",
          "Jumlah Biaya": 24000,
          isEditable: false
        },
        {
          id: 2,
          "Nama Biaya": "Biaya Operasional Produksi",
          "Jumlah Biaya": 24000,
          isEditable: true
        }
      ],
      totalHPP: 0,
      keuntungan: 0,
      hargaJual: 0
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
  
      if (cabangResponse.data.success) {
        const cabangData = cabangResponse.data.data;
        const biayaTokoData = biayaResponse.data.success ? biayaResponse.data.data : [];

        const cabangDenganBiaya = cabangData.filter((cabang) => {
          return biayaTokoData.some((biaya) => biaya.cabang_id === cabang.cabang_id);
        });

        setDataCabang(cabangData);

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


  // const handleInputChange = (type, rowIndex, key, value) => {
  //   if (type === 'gudang') {
  //     setData(prevData => {
  //       const updatedRincianBiaya = prevData.rincianBiaya.map((row, index) =>
  //         index === rowIndex ? { ...row, [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value } : row
  //       );
  
  //       const newTotalHPP = calculateMaterialCosts() + updatedRincianBiaya.reduce((sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0), 0);
  
  //       return {
  //         ...prevData,
  //         rincianBiaya: updatedRincianBiaya,
  //         totalHPP: newTotalHPP,
  //         keuntungan: prevData.hargaJual - newTotalHPP
  //       };
  //     });
  //   } else {
  //     setRincianBiayaPerCabang(prevData => {
  //       // Pastikan array untuk cabang ini sudah ada
  //       if (!prevData[type]) {
  //         prevData[type] = [];
  //       }
        
  //       const cabangData = [...prevData[type]];
        
  //       // Pastikan baris ada
  //       if (!cabangData[rowIndex]) {
  //         cabangData[rowIndex] = {
  //           id: `temp-${Date.now()}`,
  //           "Nama Biaya": "",
  //           "Jumlah Biaya": 0,
  //           isEditable: true
  //         };
  //       }
        
  //       cabangData[rowIndex] = {
  //         ...cabangData[rowIndex],
  //         [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value
  //       };
        
  //       return {
  //         ...prevData,
  //         [type]: cabangData
  //       };
  //     });
  //   }
  // };

  const handleInputChange = (type, rowIndex, key, value) => {
    if (type === 'gudang') {
      // Kode untuk admin gudang tetap seperti aslinya
      setData(prevData => {
        const updatedRincianBiaya = prevData.rincianBiaya.map((row, index) =>
          index === rowIndex ? { ...row, [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value } : row
        );
  
        const newTotalHPP = calculateMaterialCosts() + updatedRincianBiaya.reduce((sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0), 0);
  
        return {
          ...prevData,
          rincianBiaya: updatedRincianBiaya,
          totalHPP: newTotalHPP,
          keuntungan: prevData.hargaJual - newTotalHPP
        };
      });
    } else {
      setRincianBiayaPerCabang(prevData => {
        if (!prevData[type]) {
          prevData[type] = [];
        }
        
        const cabangData = [...prevData[type]];
        const currentRow = cabangData[rowIndex];
        
        if (currentRow["Nama Biaya"]?.toLowerCase() === "modal" && key === "Nama Biaya") {
          return prevData; 
        }
        
        cabangData[rowIndex] = {
          ...cabangData[rowIndex],
          [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value
        };
        
        const updatedRincianBiaya = {
          ...prevData,
          [type]: cabangData
        };

        const newTotalHPP = cabangData.reduce(
          (sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0), 
          0
        );
        
        setTimeout(() => {
          setData(prevData => {
            const currentHargaPerCabang = prevData.hargaPerCabang || {};
            const currentCabangData = currentHargaPerCabang[type] || {
              totalHPP: 0,
              keuntungan: 0,
              hargaJual: 0
            };
            
            const hargaJual = currentCabangData.hargaJual || 0;
            const newKeuntungan = hargaJual - newTotalHPP;
            
            return {
              ...prevData,
              hargaPerCabang: {
                ...currentHargaPerCabang,
                [type]: {
                  ...currentCabangData,
                  totalHPP: newTotalHPP,
                  keuntungan: newKeuntungan
                }
              }
            };
          });
        }, 0);
        
        return updatedRincianBiaya;
      });
    }
  };

  const handleDeleteRow = (type, rowId) => {
    if (type === 'gudang') {
      setData(prevData => ({
        ...prevData,
        rincianBiaya: prevData.rincianBiaya.filter(row => {
          return row["Nama Biaya"] === "Modal" || row.id !== rowId;
        })
      }));
    } else {
      setRincianBiayaPerCabang(prevData => {
        if (!prevData[type]) {
          return prevData;
        }
        
        const updatedCabangData = prevData[type].filter(row => {
          if (!row) return false;
          
          if (row.isDefault || !row.isEditable) {
            return true;
          }
          return row.id !== rowId;
        });
        
        return {
          ...prevData,
          [type]: updatedCabangData
        };
      });
    }
  };

  const handleAddRow = (type) => {
    const tempId = `temp-${Date.now()}`;
    const newRow = {
      id: tempId,  
      "Nama Biaya": "",
      "Jumlah Biaya": 0,
      isEditable: true,
      nama_biaya: "",  
      jumlah_biaya: 0 
    };
  
    if (type === 'gudang') {
      setData((prevData) => ({
        ...prevData,
        rincianBiaya: [...(prevData.rincianBiaya || []), newRow],
      }));
    } else {
      setRincianBiayaPerCabang((prevData) => {
        if (!prevData[type]) {
          prevData[type] = [];
        }
        
        return {
          ...prevData,
          [type]: [...(prevData[type] || []), newRow],
        };
      });
    }
  };
  
  const calculateTotalHPP = (cabang, callback) => {
    if (!rincianBiayaPerCabang[cabang]) {
      return 0;
    }
    
    if (!Array.isArray(rincianBiayaPerCabang[cabang]) || rincianBiayaPerCabang[cabang].length === 0) {
      return 0;
    }
    
    const totalHPP = rincianBiayaPerCabang[cabang].reduce(
      (sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0),
      0
    );

    if (callback && typeof callback === 'function') {
      callback(totalHPP);
    }
    
    return totalHPP;
  };

  useEffect(() => {
    if (!isAdminGudang && selectedCabang && rincianBiayaPerCabang[selectedCabang]) {
      const newTotalHPP = calculateTotalHPP(selectedCabang);
      
      setData(prevData => {
        const currentHargaPerCabang = prevData.hargaPerCabang || {};
        const currentCabangData = currentHargaPerCabang[selectedCabang] || {
          totalHPP: 0,
          keuntungan: 0,
          hargaJual: 0
        };
        
        if (currentCabangData.totalHPP === newTotalHPP) {
          return prevData;
        }
        
        const hargaJual = currentCabangData.hargaJual || 0;
        const newKeuntungan = hargaJual - newTotalHPP;
        
        return {
          ...prevData,
          hargaPerCabang: {
            ...currentHargaPerCabang,
            [selectedCabang]: {
              ...currentCabangData,
              totalHPP: newTotalHPP,
              keuntungan: newKeuntungan
            }
          }
        };
      });
    }
  }, [isAdminGudang, selectedCabang, rincianBiayaPerCabang]);


  const calculateKeuntungan = (hargaJual, totalHPP) => {
    return (Number(hargaJual) || 0) - (Number(totalHPP) || 0);
  };

  useEffect(() => {
    if (!isAdminGudang && selectedCabang) {
      if (dataCabang.length === 0) return;
  
      const selectedCabangData = dataCabang.find(c => c.nama_cabang === selectedCabang);
      if (!selectedCabangData) return;
  
      if (!data.hargaPerCabang || !data.hargaPerCabang[selectedCabang]) {
        setData(prevData => ({
          ...prevData,
          hargaPerCabang: {
            ...(prevData.hargaPerCabang || {}),
            [selectedCabang]: {
              totalHPP: 0,
              keuntungan: 0,
              hargaJual: 0
            }
          }
        }));
      }

      if (!rincianBiayaPerCabang[selectedCabang]) {
        api.get('/biaya-toko').then(response => {
          if (response.data.success) {
            const biayaTokoData = response.data.data;
            const biayaToko = biayaTokoData.find(bt => bt.cabang_id === selectedCabangData.cabang_id);
            
            if (biayaToko) {
              const biayaList = [
                {
                  id: 'modal', 
                  "Nama Biaya": "Modal",
                  "Jumlah Biaya": 0,
                  isEditable: true,
                  isDefault: true 
                },
                {
                  id: biayaToko.biaya_toko_id,
                  "Nama Biaya": `Biaya Operasional dan Staff ${selectedCabang}`,
                  "Jumlah Biaya": biayaToko.total_biaya,
                  isEditable: false
                }
              ];
              
              setRincianBiayaPerCabang(prev => ({
                ...prev,
                [selectedCabang]: biayaList
              }));
              
              // Update total costs
              const totalHPP = biayaToko.total_biaya;
              
              setData(prevData => ({
                ...prevData,
                hargaPerCabang: {
                  ...prevData.hargaPerCabang,
                  [selectedCabang]: {
                    ...prevData.hargaPerCabang[selectedCabang],
                    totalHPP,
                    keuntungan: calculateKeuntungan(
                      prevData.hargaPerCabang[selectedCabang]?.hargaJual || 0,
                      totalHPP
                    )
                  }
                }
              }));
            }
          }
        }).catch(error => {
          console.error('Error fetching biaya toko:', error);
        });
      } else {
        const totalHPP = calculateTotalHPP(selectedCabang);
        const keuntungan = calculateKeuntungan(
          data.hargaPerCabang[selectedCabang]?.hargaJual || 0,
          totalHPP
        );
        
        setData(prevData => ({
          ...prevData,
          hargaPerCabang: {
            ...prevData.hargaPerCabang,
            [selectedCabang]: {
              ...prevData.hargaPerCabang[selectedCabang],
              totalHPP,
              keuntungan
            }
          }
        }));
      }
    }
  }, [selectedCabang, isAdminGudang, dataCabang]);

  const handleInfoBarangChange = (key, value) => {
    setData((prevData) => ({
      ...prevData,
      info_barang: {
        ...prevData.info_barang,
        [key]: value,
      },
    }));
  };

  const handleHargaJualChange = (cabang, value) => {
    const numValue = Number(value) || 0;
    
    const totalHPP = calculateTotalHPP(cabang);
    const keuntungan = calculateKeuntungan(numValue, totalHPP);

    setData((prevData) => {
      const currentHargaPerCabang = prevData.hargaPerCabang || {};

      const currentCabangData = currentHargaPerCabang[cabang] || {
        totalHPP: 0,
        keuntungan: 0,
        hargaJual: 0
      };
      
      return {
        ...prevData,
        hargaPerCabang: {
          ...currentHargaPerCabang,
          [cabang]: {
            ...currentCabangData,
            hargaJual: numValue,
            keuntungan
          }
        }
      };
    });
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
    { label: "Aksi", key: "Aksi", align: "text-left" },
  ];

  const handleDeleteMaterial = (materialId) => {
    setMaterials(prevMaterials => {
      const updatedMaterials = prevMaterials.filter(material => material.id !== materialId);
      return updatedMaterials.map((material, index) => ({
        ...material,
        No: index + 1
      }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      const formData = new FormData();
  
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

      if (!isAdminGudang) {
        let cabangBelumLengkap = [];

        Object.keys(rincianBiayaPerCabang).forEach(cabangName => {
          const hargaJual = data.hargaPerCabang?.[cabangName]?.hargaJual;

          if (!hargaJual || hargaJual <= 0) {
            cabangBelumLengkap.push(cabangName);
          }
        });

        if (cabangBelumLengkap.length > 0) {
          setErrorMessage(`Harga jual pada cabang ${cabangBelumLengkap.join(', ')} belum diisi. Mohon lengkapi data tersebut.`);
          setErrorAlert(true);
          setLoading(false);
          return;
        }
      }
  
      if (isAdminGudang) {
        formData.append('nama_barang', data.info_barang["Nama Barang"]);
        formData.append('kategori_barang_id', data.info_barang.Kategori);
        formData.append('jumlah_minimum_stok', data.info_barang["Jumlah Minimum Stok"]);
        formData.append('waktu_pengerjaan', data.info_barang["Waktu Pengerjaan"]);
        formData.append('keuntungan', data.keuntungan);
        formData.append('harga_jual', data.hargaJual);
        formData.append('total_hpp', data.totalHPP);

        materials.forEach((material, index) => {
          formData.append(`rincian_bahan[${index}][barang_mentah_id]`, material.id);
          formData.append(`rincian_bahan[${index}][harga_satuan]`, material["Harga Satuan"]);
          formData.append(`rincian_bahan[${index}][kuantitas]`, material["Kuantitas"]);
          formData.append(`rincian_bahan[${index}][total_biaya]`, material["Total Biaya"]);
        });
  
        if (data.info_barang.Foto instanceof File) {
          formData.append('image', data.info_barang.Foto);
        }

        const response = await api.put(`/barang-handmade-gudang/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.data.success) {
          setAlertSucc(true);
          setTimeout(() => {
            navigate('/dataBarang/handmade');
          }, 2000);
        }
      } else {

        const formData = new FormData();
  
        formData.append('kategori_barang_id', data.info_barang.Kategori);
        formData.append('nama_barang', data.info_barang["Nama Barang"]);
        formData.append('jumlah_minimum_stok', data.info_barang["Jumlah Minimum Stok"]);

        if (!data.info_barang.Foto) {
          setErrorMessage("Foto barang belum dipilih. Harap unggah foto terlebih dahulu.");
          setErrorAlert(true);
          setLoading(false);
          return; 
        }
    
        if (data.info_barang.Foto instanceof File) {
          formData.append('image', data.info_barang.Foto);
        } else {
          formData.append('image', data.info_barang.Foto);
        }
  
        const rincianBiayaData = [];
        let hasError = false;
        let cabangError = "";
      
        Object.entries(rincianBiayaPerCabang).forEach(([cabangName, rincianBiaya]) => {
          const cabang = dataCabang.find((c) => c.nama_cabang === cabangName);
          
          if (!data.hargaPerCabang[cabangName]) {
            data.hargaPerCabang[cabangName] = {
              totalHPP: 0,
              keuntungan: 0,
              hargaJual: 0
            };
          }
          
          const cabangData = data.hargaPerCabang[cabangName];

          if (!Array.isArray(rincianBiaya)) {
            rincianBiaya = [];
          }
      
          if (cabangData && cabang && cabang.cabang_id) {
            const rincianData = {
              cabang_id: cabang.cabang_id,
              total_hpp: cabangData.totalHPP || 0,
              keuntungan: cabangData.keuntungan || 0,
              harga_jual: cabangData.hargaJual || 0,
              detail_rincian_biaya: rincianBiaya.map((item) => {
                if (!item) return null;
                
                if (item.isDefault) {

                  return {
                    nama_biaya: "Modal",
                    jumlah_biaya: Number(item["Jumlah Biaya"]) || 0
                  };
                } else if (item.isEditable) {
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
              }).filter(Boolean),
            };
      
            rincianBiayaData.push(rincianData);
          }
        });
  
        if (hasError) {
          setLoading(false);
          return;
        }
      
        rincianBiayaData.forEach((biaya, index) => {
          formData.append(`rincian_biaya[${index}][cabang_id]`, biaya.cabang_id);
          formData.append(`rincian_biaya[${index}][total_hpp]`, biaya.total_hpp);
          formData.append(`rincian_biaya[${index}][keuntungan]`, biaya.keuntungan);
          formData.append(`rincian_biaya[${index}][harga_jual]`, biaya.harga_jual);
        
          biaya.detail_rincian_biaya.forEach((detail, detailIndex) => {
            if (detail.biaya_toko_id) {  // Cek biaya_toko_id, bukan id
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
  
        const response = await api.put(`/barang-handmade/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.data.success) {
          setAlertSucc(true);
          setTimeout(() => {
            navigate('/dataBarang/handmade');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat memperbarui data');
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };
  
  const navigate = useNavigate()
  const handleBtnCancel = () => {
    navigate('/dataBarang/handmade')
  }
  
  const calculateMaterialCosts = () => {
    return materials.reduce((sum, material) => sum + (material["Total Biaya"] || 0), 0);
  };

  const calculateOperationalCosts = () => {
    return data.rincianBiaya ? data.rincianBiaya.reduce((sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0), 0) : 0;
  };
  
  const updateTotalHPP = () => {
    if (isAdminGudang) {
      const materialCosts = calculateMaterialCosts();
      const operationalCosts = calculateOperationalCosts();
      const totalHPP = materialCosts + operationalCosts;
      
      setData(prev => ({
        ...prev,
        totalHPP,
        keuntungan: prev.hargaJual - totalHPP
      }));
    }
  };

  useEffect(() => {
    if (!isAdminGudang) {
      fetchCabangAndBiayaData();
    }
  }, [isAdminGudang]);
  
  useEffect(() => {
    if (id && dataCabang.length > 0) {
      fetchDetailBarang();
    }
  }, [id, dataCabang]);

  useEffect(() => {
    if (isAdminGudang) {
      updateTotalHPP();
    }
  }, [materials, data.rincianBiaya]);



  return (
    <LayoutWithNav
      menuItems={menuItems}
      userOptions={userOptions}
      label={"Edit Data Barang Handmade"}
    >
      <div className="p-5">
        <Breadcrumbs items={breadcrumbItems} />

        <section className="mt-5 bg-white rounded-xl">
          <div className="pt-5 px-5">
            <form onSubmit={handleSubmit}>
              <div>
                <p className="pb-5 font-bold">Masukan Foto Barang</p>
                {data.info_barang.Foto ? (
                  <div className="mb-4">
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/${isAdminGudang ? 'images-barang-handmade-gudang' : 'images-barang-handmade'}/${data.info_barang.Foto}`}
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
                  value={data.info_barang.Nomor}
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
                <section className="pt-5">
                  <p className="font-bold">Rincian Biaya</p>
                  <div className="pt-3">
                    <Table
                      headers={headers}
                      data={(data.rincianBiaya || []).map((row, index) => ({
                        No: index + 1,
                        "Nama Biaya": row["Nama Biaya"],
                        "Jumlah Biaya": `Rp${formatCurrency(row["Jumlah Biaya"])}`,
                        Aksi: null,
                      }))}
                    />
                  </div>
                </section>
              ) : (
                <>
                  <section className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-bold text-base text-primary">Rincian Berdasarkan Cabang</p>
                      <div className="w-60">
                        <ButtonDropdown
                          label={selectedCabang}
                          options={dataCabangOptions}
                          onSelect={setSelectedCabang}
                          selectedStore={selectedCabang}
                          icon={
                            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                      <p className="font-bold">Rincian Biaya</p>
                      <div className="pt-3">
                      <Table
                        headers={headers}
                        data={(rincianBiayaPerCabang[selectedCabang] || []).map((row, index) => {
                          if (!row) return null;
                          
                          return {
                            No: index + 1,
                            "Nama Biaya": row.isDefault ? (
                              row["Nama Biaya"]
                            ) : row.isEditable ? (
                              <Input
                                showRequired={false}
                                className="w-full max-w-xs sm:max-w-sm"
                                value={row["Nama Biaya"]}
                                onChange={(value) =>
                                  handleInputChange(selectedCabang, index, "Nama Biaya", value)
                                }
                              />
                            ) : (
                              row["Nama Biaya"]
                            ),
                            "Jumlah Biaya": row.isDefault || row.isEditable ? (
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
                            Aksi: !row.isDefault && row.isEditable && (
                              <Button
                                label="Hapus"
                                bgColor=""
                                textColor="text-red-600"
                                hoverColor="hover:text-red-800"
                                onClick={() => handleDeleteRow(selectedCabang, row.id)}
                              />
                            )
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
                          bgColor="focus:ring-primary"
                          hoverColor="hover:border-primary hover:border"
                          textColor="text-primary"
                          onClick={() => handleAddRow(selectedCabang)}
                        />
                      </div>
                    </section>
                    </>
                  )}
                </>
              )}

              {isAdminGudang && (
                <section className="pt-5">
                <p className="font-bold">Rincian Jumlah dan Bahan</p>
                <div className="pt-3">
                  <Table
                    headers={materialHeaders}
                    data={materials.map((row, index) => ({
                      No: index + 1,
                      "Foto": row.Foto ? (
                        <div className="w-16 h-16 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
                          <img 
                            src={row.Foto.startsWith('http') ? row.Foto : `${import.meta.env.VITE_API_URL}/images-barang-mentah/${row.Foto}`}
                            alt={row["Nama Bahan"]} 
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              console.error("Image load error:", e);
                              e.target.parentElement.innerHTML = 
                                '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      ),
                      "Nama Bahan": (
                        <InputDropdown
                          showRequired={false}
                          options={materialOptions}
                          value={row.selectedId}
                          onSelect={(selectedOption) => {
                            const updatedMaterials = [...materials];
                            const imageUrl = selectedOption.image.startsWith('http') 
                              ? selectedOption.image 
                              : `${import.meta.env.VITE_API_URL}/images-barang-mentah/${selectedOption.image}`;
                            
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
                          onClick={() => handleDeleteMaterial(row.id)}
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
                    bgColor="focus:ring-primary"
                    hoverColor="hover:border-primary hover:border"
                    textColor="text-primary"
                    onClick={handleMaterialModal}
                  />
                </div>
              </section>
              )}

              {/* Totals Section */}
              {isAdminGudang ? (
                <section className="flex justify-end text-base p-5">
                  <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 text-sm">
                    <div className="flex justify-between">
                      <p className="font-bold">Total HPP</p>
                      <p>Rp{formatCurrency(data.totalHPP)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="font-bold">Keuntungan</p>
                      <p>Rp{formatCurrency(data.keuntungan)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="font-bold">Harga Jual</p>
                      <Input
                        showRequired={false}
                        type="number"
                        width="w-1/2"
                        value={data.hargaJual}
                        onChange={(value) => {
                          const numValue = Number(value) || 0;
                          const totalHPP = data.rincianBiaya.reduce((sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0), 0);
                          setData(prev => ({
                            ...prev,
                            hargaJual: numValue,
                            totalHPP,
                            keuntungan: numValue - totalHPP
                          }));
                        }}
                      />
                    </div>
                  </div>
                </section>
              ) : (
                <>
                  {selectedCabang && data.hargaPerCabang && data.hargaPerCabang[selectedCabang] && (
                    <section className="flex justify-end text-base p-5">
                      <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 text-sm">
                        <div className="flex justify-between">
                          <p className="font-bold">Total HPP</p>
                          <p>Rp{formatCurrency(data.hargaPerCabang[selectedCabang]?.totalHPP || 0)}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="font-bold">Keuntungan</p>
                          <p>Rp{formatCurrency(data.hargaPerCabang[selectedCabang]?.keuntungan || 0)}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="font-bold">Harga Jual</p>
                          <Input
                            showRequired={false}
                            type="number"
                            width="w-1/2"
                            value={data.hargaPerCabang[selectedCabang]?.hargaJual || 0}
                            onChange={(value) => handleHargaJualChange(selectedCabang, value)}
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="px-5">
                    <p className="font-bold text-base mb-4">Ringkasan Harga Jual Seluruh Cabang</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                      {Object.entries(data.hargaPerCabang || {}).map(([cabangName, cabangData]) => (
                        <div 
                          key={cabangName} 
                          className="border border-[#7E7E7E] bg-[#F9F9F9] rounded-2xl p-4"
                        >
                          <h3 className="text-primary mb-4 font-medium">Cabang {cabangName}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-500 text-sm mb-1">Total HPP</p>
                              <p className="font-medium">Rp{formatCurrency(cabangData?.totalHPP || 0)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-sm mb-1">Harga Jual</p>
                              <p className="font-medium">Rp{formatCurrency(cabangData?.hargaJual || 0)}</p>
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
                  <div className="bg-white border border-primary rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden">
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
                        <p className="text-primary font-semibold">
                          Terpilih {selectedMaterial.reduce((sum, item) => sum + item.count, 0)}
                        </p>
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
                          bgColor="bg-primary"
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
                    bgColor="bg-primary"
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