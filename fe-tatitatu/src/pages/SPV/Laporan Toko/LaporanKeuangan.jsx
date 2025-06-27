import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import { useEffect, useState } from "react";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Button from "../../../components/Button";
import Table from "../../../components/Table";
import { useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../components/LayoutWithNav";
import InputDropdown from "../../../components/InputDropdown";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";
import AlertError from "../../../components/AlertError";

export default function LaporanKeuangan() {
    const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [selectedStore, setSelectedStore] = useState("Semua"); 
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState({
        keuntungan: 0,
        pemasukan: 0,
        pengeluaran: 0,
        produkTerjual: 0,
        dataLaporan: [
            {
                id_jenis: 1,
                nama_jenis: 'Pemasukan',
                data: []
            },
            {
                id_jenis: 2,
                nama_jenis: 'Pengeluaran',
                data: []
            }
        ]
    });
    
    const [tokoOptions, setTokoOptions] = useState([{ label: "Semua", value: "Semua" }]);
    const [kategoriOptions, setKategoriOptions] = useState([{ label: "Semua", value: "Semua" }]);

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
    const isAdminGudang = userData?.role === 'admingudang'
    const isOwner = userData?.role === 'owner';
    const isFinance = userData?.role === 'finance';
    const isAdmin = userData?.role === 'admin'
    const isManajer = userData?.role === 'manajer'
    const toko_id = userData?.userId

    const iconToko = (isManajer || isOwner || isFinance) 
    ? '/Icon Warna/toko_non.svg'
    : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2))
    ? '/icon/toko_toko2.svg'
    : 'icon/toko.svg';

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

      const exportIcon = (isAdminGudang || isHeadGudang) ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
          <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#71503D"/>
        </svg>
      ) : (isManajer || isOwner || isFinance) ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
          <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#023F80"/>
        </svg>
      ) : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2)) ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
        <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#2D2D2D"/>
        </svg>     
      ) : (
        <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
        </svg>
      );

      
    // Fetch toko data
    useEffect(() => {
        const fetchTokoOrCabang = async () => {
            try {
                if (isAdmin) {
                    const response = await api.get(`/cabang?toko_id=${toko_id}`);
                    if (response.data.success) {
                        const options = response.data.data.map(item => ({
                            value: item.nama_cabang,
                            label: item.nama_cabang,
                            icon: iconToko
                        }));
                        setTokoOptions([{ label: "Semua", value: "Semua", icon: iconToko }, ...options]);
                    }
                } 
                else {
                    const response = await api.get('/toko');
                    if (response.data.success) {
                        const options = response.data.data.map(item => ({
                            value: item.toko_id,
                            label: item.nama_toko,
                            icon: iconToko
                        }));
                        setTokoOptions([{ label: "Semua", value: "Semua", icon: iconToko }, ...options]);
                    }
                }
            } catch (error) {
                console.error('Error fetching toko/cabang data:', error);
            }
        };
        
        fetchTokoOrCabang();
    }, [toko_id, isAdmin]);

    useEffect(() => {
        const fetchKategori = async () => {
            try {
                // Fetch kategori pemasukan
                const pemasukanResponse = await api.get('/kategori-pemasukan');
                let kategoriOptions = [];
                
                if (pemasukanResponse.data.success) {
                    const pemasukanOptions = pemasukanResponse.data.data.map(item => ({
                        value: item.kategori_pemasukan,
                        label: item.kategori_pemasukan
                    }));
                    kategoriOptions = [...kategoriOptions, ...pemasukanOptions];
                }
                
                // Fetch kategori pengeluaran
                const pengeluaranResponse = await api.get('/kategori-pengeluaran');
                if (pengeluaranResponse.data.success) {
                    const pengeluaranOptions = pengeluaranResponse.data.data.map(item => ({
                        value: item.kategori_pengeluaran || item.kategori_pemasukan, 
                        label: item.kategori_pengeluaran || item.kategori_pemasukan
                    }));
                    kategoriOptions = [...kategoriOptions, ...pengeluaranOptions];
                }
                
                const uniqueOptions = Array.from(new Set(kategoriOptions.map(option => option.value)))
                    .map(value => {
                        return kategoriOptions.find(option => option.value === value);
                    });
                
                setKategoriOptions([{ label: "Semua", value: "Semua" }, ...uniqueOptions]);
            } catch (error) {
                console.error('Error fetching kategori data:', error);
            }
        };
        
        fetchKategori();
    }, []);

    useEffect(() => {
        const fetchLaporanKeuangan = async () => {
            setLoading(true);
            try {
                const startDate = moment(`${selectedYear}-${selectedMonth}-01`).format('YYYY-MM-DD');
                const endDate = moment(`${selectedYear}-${selectedMonth}-01`).endOf('month').format('YYYY-MM-DD');
                
                let url = `/laporan-keuangan?startDate=${startDate}&endDate=${endDate}`;
                if (isAdmin || isHeadGudang) {
                    url += `&toko_id=${toko_id}`;
                } 
                else if ((isManajer || isOwner || isFinance) && selectedStore !== "Semua") {
                    url += `&toko_id=${selectedStore}`;
                }
                console.log(selectedStore)

                const response = await api.get(url);
                
                if (response.data.success) {
                    const apiData = response.data.data;
                    console.log(apiData)
                    
                    const transformedData = {
                        keuntungan: apiData.keuntungan || 0,
                        pemasukan: apiData.total_pemasukan || 0,
                        pengeluaran: apiData.total_pengeluaran || 0,
                        produkTerjual: apiData.produk_terjual || 0,
                        dataLaporan: [
                            {
                                id_jenis: 1,
                                nama_jenis: 'Pemasukan',
                                data: apiData.pemasukan ? apiData.pemasukan.map(item => {
                                    if (item.pemasukan_id) {
                                        return {
                                            nomor: item.pemasukan_id,
                                            tanggal: item.tanggal,
                                            deskripsi: item.deskripsi,
                                            cabang: item.nama_cabang,
                                            toko: item.nama_toko || item.nama_toko.nama_toko || '-',
                                            kategori: item.kategori_pemasukan,
                                            total: item.total_pemasukan || item.jumlah_pemasukan,
                                            jenis: 'pemasukan'
                                        };
                                    } else if (item.penjualan_id) {
                                        return {
                                            nomor: item.penjualan_id,
                                            tanggal: item.tanggal,
                                            deskripsi: item.produk && item.produk.length > 0 
                                                ? `Penjualan ${item.produk.map(p => p.nama_barang).join(', ')}`
                                                : 'Penjualan Produk',
                                            cabang: item.produk && item.produk.length > 0 
                                                ? item.produk[0].nama_cabang
                                                : '',
                                            toko: item.nama_toko || item.nama_toko.nama_toko || '-',
                                            kategori: item.kategori_pemasukan,
                                            total: item.total_pemasukan, 
                                            jenis: 'penjualan'
                                        };
                                    }
                                    return null;
                                }).filter(item => item !== null) : []
                            },
                            {
                                id_jenis: 2,
                                nama_jenis: 'Pengeluaran',
                                data: apiData.pengeluaran ? apiData.pengeluaran.map(item => {
                                    if (item.pengeluaran_id) {
                                        let jenis = 'pengeluaran';
                                        if (item.pengeluaran_id.startsWith('BGA')) {
                                            jenis = 'pengeluaran-gaji';
                                        } else if (item.pengeluaran_id.startsWith('EXP')) {
                                            jenis = 'pengeluaran-operasional';
                                        }

                                        return {
                                            nomor: item.pengeluaran_id,
                                            tanggal: item.tanggal,
                                            deskripsi: item.deskripsi,
                                            cabang: item.nama_cabang,
                                            toko: item.nama_toko || item.nama_toko.nama_toko || '-',
                                            kategori: item.kategori_pengeluaran,
                                            total: item.jumlah_pengeluaran,
                                            jenis: jenis 
                                        };
                                    } else if (item.pembelian_id) {
                                        return {
                                            nomor: item.pembelian_id,
                                            tanggal: item.tanggal,
                                            deskripsi: item.produk && item.produk.length > 0 
                                                ? `Pembelian ${item.produk.map(p => p.nama_barang).join(', ')}`
                                                : 'Pembelian Produk',
                                            cabang: item.produk && item.produk.length > 0 
                                                ? item.produk[0].nama_cabang
                                                : '',
                                            toko: item.nama_toko || item.nama_toko.nama_toko || '-',
                                            kategori: item.kategori_pengeluaran,
                                            total: item.total_pengeluaran,
                                            jenis: 'pembelian'
                                        };
                                    }
                                    return null;
                                }).filter(item => item !== null) : []
                            }
                        ]
                    };
                    
                    setData(transformedData);
                } else {
                    setError(response.data.message || 'Failed to fetch data');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while fetching data');
                console.error('Error fetching laporan keuangan:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchLaporanKeuangan();
    }, [selectedMonth, selectedYear, isAdmin, toko_id, selectedStore]);

    console.log(data)

    const headers = [
        { label: "Nomor", key: "nomor", align: "text-left" },
        { label: "Tanggal", key: "tanggal", align: "text-left" },
        { label: "Deskripsi", key: "deskripsi", align: "text-left", width: '400px' },
        { label: isOwner || isFinance || isAdmin ? (isAdmin ? "Cabang" : "Toko") : "Cabang", 
          key: isOwner || isFinance ? "toko" : "cabang", align: "text-left" },
        { label: "Kategori", key: "kategori", align: "text-left" },
        { label: "Total", key: "total", align: "text-left" },
    ];

    const selectedData = selectedJenis === "Semua" 
        ? data.dataLaporan.flatMap(item => item.data)
        : data.dataLaporan
            .find((item) => item.nama_jenis === selectedJenis)
            ?.data || [];
    
    const navigate = useNavigate();
    
    const handleRowClick = async (row) => {
        if (row.jenis === 'pemasukan') {
            navigate('/laporanKeuangan/pemasukan-non-penjualan/detail', { 
                state: { 
                    nomor: row.nomor,
                    fromLaporanKeuangan: true 
                } 
            });
        } else if (row.jenis === 'penjualan') {
            const isGudang = row.toko === 'Rumah Produksi' || row.toko === 'Rumah produksi' || row.toko == 'Dansa' || row.toko == 'dansa' ||
            (typeof row.toko === 'object' && 
             (row.toko.nama_toko === 'Rumah Produksi' || row.toko.nama_toko === 'Rumah produksi' || row.toko.nama_toko_lama === 'Rumah Produksi' || row.toko.nama_toko == 'Dansa' || row.toko.nama_toko == 'dansa'));
            
            if (isGudang || isHeadGudang) {
                navigate('/laporanKeuangan/penjualan-gudang/detail', {
                    state: { 
                        nomor: row.nomor,
                        fromLaporanKeuangan: true 
                    }
                });
            } else {
                try {
                    setLoading(true);
                    const response = await api.get(`/penjualan/${row.nomor}`);
                    
                    if (response.data.success) {
                        const penjualanData = response.data.data;
                        const isCustom = penjualanData.rincian_biaya_custom?.length > 0 || 
                                        penjualanData.produk?.some(item => item.barang_custom);
                        
                        navigate('/laporanKeuangan/pemasukan/penjualan/detail', {
                            state: { 
                                nomor: row.nomor,
                                tipe: isCustom ? 'custom' : 'non-custom',
                                fromLaporanKeuangan: true 
                            }
                        });
                    } else {
                        console.error('Failed to fetch penjualan details:', response.data.message);
                    }
                } catch (error) {
                    console.error('Error fetching penjualan details:', error);
                } finally {
                    setLoading(false);
                }
            }
        } else if (row.jenis === 'pengeluaran-gaji') {
            navigate('/laporanKeuangan/pengeluaran/gaji', { 
                state: { 
                    nomor: row.nomor,
                    fromLaporanKeuangan: true 
                } 
            });
        } else if (row.jenis === 'pengeluaran-operasional' || row.jenis === 'pengeluaran') {
            navigate('/laporanKeuangan/pengeluaran/detail', { 
                state: { 
                    nomor: row.nomor,
                    fromLaporanKeuangan: true 
                } 
            });
        } else if (row.jenis === 'pembelian') {
            console.log(toko_id)
            const isGudang = toko_id === 1 || row.toko === 'Rumah Produksi' || row.toko == 'Dansa' || row.toko == 'dansa' || 
                            (typeof row.toko === 'object' && row.toko.nama_toko === 'Rumah Produksi' || row.toko.nama_toko_lama === 'Rumah produksi' || row.toko.nama_toko === 'Dansa' || row.toko.nama_toko === 'dansa');
            
            navigate('/pembelianStok/detail', { 
                state: { 
                    id: row.nomor,
                    fromLaporanKeuangan: true,
                    gudang: isGudang
                } 
            });
        }
    };
    
    const filterFields = [
        ...(!isHeadGudang ? [{
            label: isAdmin ? "Cabang" : "Toko",
            key: isAdmin ? "Cabang" : "Toko",
            options: tokoOptions
        }] : []),
        {
            label: "Kategori",
            key: "Kategori",
            options: kategoriOptions
        }
    ];
    
    const filteredData = () => {
        let filteredData = selectedData;
    
        if (selectedKategori !== "Semua") {
            filteredData = filteredData.filter(item => item.kategori === selectedKategori);
        }
    
        if (!isHeadGudang && selectedStore !== "Semua") {
            if (isAdmin) {
                filteredData = filteredData.filter(item => item.cabang === selectedStore);
                console.log('Filtering by cabang:', selectedStore, filteredData.length);
            } else {
                filteredData = filteredData.filter(item => {
                    if (typeof item.toko === 'object' && item.toko !== null) {
                        const matchingToko = tokoOptions.find(
                            option => option.label === item.toko.nama_toko
                        );
                        return matchingToko && matchingToko.value.toString() === selectedStore.toString();
                    } 
                    else if (typeof item.toko === 'string') {
                        const matchingToko = tokoOptions.find(
                            option => option.label === item.toko
                        );
                        return matchingToko && matchingToko.value.toString() === selectedStore.toString();
                    }
                    // Also check cabang
                    return item.cabang === selectedStore;
                });
            }
        }
    
        return filteredData;
    };

    const handleExport = async () => {
        try {
          setLoading(true);

          const startDate = moment(`${selectedYear}-${selectedMonth}-01`).format('YYYY-MM-DD');
          const endDate = moment(`${selectedYear}-${selectedMonth}-01`).endOf('month').format('YYYY-MM-DD');
          
          const queryParams = new URLSearchParams();
          queryParams.append('startDate', startDate);
          queryParams.append('endDate', endDate);

          if (isAdmin) {
            if (selectedStore !== "Semua") {
              try {
                const cabangResponse = await api.get(`/cabang?toko_id=${toko_id}`);
                if (cabangResponse.data.success) {
                  const cabang = cabangResponse.data.data.find(c => c.nama_cabang === selectedStore);
                  if (cabang) {
                    queryParams.append('cabang_id', cabang.cabang_id);
                  }
                }
              } catch (error) {
                console.error('Error fetching cabang ID:', error);
              }
            } else {
              queryParams.append('toko_id', toko_id);
            }
          } else if (isHeadGudang || isAdminGudang) {
            queryParams.append('toko_id', toko_id);
          } else if (isOwner || isFinance || isManajer) {
            if (selectedStore !== "Semua") {
              const tokoId = selectedStore;
              console.log('Using toko_id for export:', tokoId);
              queryParams.append('toko_id', tokoId);

              console.log('Available toko options:', tokoOptions);
              console.log('Selected store value:', selectedStore);
              console.log('Selected store type:', typeof selectedStore);
            }
          }

          if (selectedKategori !== "Semua") {
            try {
              const pemasukanKategoriResponse = await api.get('/kategori-pemasukan');
              if (pemasukanKategoriResponse.data.success) {
                const kategori = pemasukanKategoriResponse.data.data.find(
                  k => k.kategori_pemasukan === selectedKategori
                );
                
                if (kategori) {
                  queryParams.append('kategori_pemasukan_id', kategori.kategori_pemasukan_id);
                } else {
                  const pengeluaranKategoriResponse = await api.get('/kategori-pengeluaran');
                  if (pengeluaranKategoriResponse.data.success) {
                    const kategori = pengeluaranKategoriResponse.data.data.find(
                      k => k.kategori_pengeluaran === selectedKategori
                    );
                    if (kategori) {
                      queryParams.append('kategori_pengeluaran_id', kategori.kategori_pengeluaran_id);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching kategori data:', error);
            }
          }
      
          if (selectedJenis !== "Semua") {
            queryParams.append('jenis', selectedJenis.toLowerCase());
          }

          const exportUrl = `/laporan-keuangan/export?${queryParams.toString()}`;
          console.log('Export URL:', exportUrl);
          
          const response = await api.get(exportUrl, {
            responseType: 'blob'
          });
      
          if (response.status === 200) {
            const blob = new Blob([response.data], { 
              type: response.headers['content-type'] 
            });
            const url = window.URL.createObjectURL(blob);
       
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let filename = `laporan-keuangan-${selectedMonth}-${selectedYear}.xlsx`;
            
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="(.+)"/);
              if (filenameMatch && filenameMatch.length === 2) {
                filename = filenameMatch[1];
              }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
          } else {
            throw new Error('Failed to download export file');
          }
        } catch (error) {
          console.error('Error exporting data:', error);
          setErrorMessage(
            error.response?.data?.message || 
            'Terjadi kesalahan saat mengeksport data. Data mungkin tidak tersedia.'
          );
        } finally {
          setLoading(false);
        }
      };

      const getDashboardIconPath = (baseIconName) => {
        if (isAdminGudang || isHeadGudang) {
          return `/keuangan/${baseIconName}_gudang.svg`;
        } else if(isManajer || isOwner || isFinance){
            return `/keuangan/${baseIconName}_non.svg`;
        } else if(isAdmin && (userData?.userId !== 1 && userData?.userId !== 2)){
            return `/keuangan/${baseIconName}_toko2.svg`;
        }
        return `/keuangan/${baseIconName}.svg`;
      };


    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className={`text-${themeColor} text-base font-bold`}>
                                {isOwner ? 'Laporan Keuangan Perusahaan' : 'Laporan Keuangan Toko'}
                            </p>
                        </div>

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
                            {!isHeadGudang && (
                                <div className="w-full md:w-auto">
                                    <ButtonDropdown 
                                        selectedIcon={iconToko} 
                                        options={tokoOptions} 
                                        onSelect={(label) => {
                                            const selectedOption = tokoOptions.find(option => option.label === label);
                                            setSelectedStore(selectedOption ? selectedOption.value : "Semua");
                                        }} 
                                        label={isAdmin ? "Cabang" : "Toko"}
                                    />
                                </div>
                            )}
                            <div className="w-full md:w-auto relative">
                                <div className="w-48 md:w-48">
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
                        </div>
                    </section>

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="grid grid-cols-1 p-5 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Keuntungan */}
                            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm">Keuntungan</p>
                                    <p className="font-bold text-lg">Rp {data.keuntungan.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-center ml-4">
                                    <img src={getDashboardIconPath("keuntungan")}  alt="Keuntungan" />
                                </div>
                            </div>

                            {/* Pemasukan */}
                            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm">Pemasukan</p>
                                    <p className="font-bold text-lg">Rp {data.pemasukan.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-center ml-4">
                                    <img src={getDashboardIconPath("pemasukan")}  alt="Pemasukan" />
                                </div>
                            </div>

                            {/* Pengeluaran */}
                            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm">Pengeluaran</p>
                                    <p className="font-bold text-lg">Rp {data.pengeluaran.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-center ml-4">
                                    <img src={getDashboardIconPath("pengeluaran")}  alt="Pengeluaran" />
                                </div>
                            </div>

                            {/* Produk Terjual */}
                            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm">Produk Terjual</p>
                                    <p className="font-bold text-lg">{data.produkTerjual} Pcs</p>
                                </div>
                                <div className="flex items-center justify-center ml-4">
                                    <img src={getDashboardIconPath("produkterjual")}  alt="Produk Terjual" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white mt-5 rounded-xl">
                        <div className="p-4">
                            <div className="flex border-b border-gray-300 mb-4">
                                {["Semua","Pemasukan", "Pengeluaran"].map((jenis) => (
                                    <button
                                    key={jenis}
                                    onClick={() => setSelectedJenis(jenis)}
                                    className={`px-4 py-2 text-sm font-semibold ${
                                        selectedJenis === jenis
                                            ? `text-${themeColor} border-b-2 border-${themeColor}`
                                            : "text-gray-400"
                                    }`}
                                >
                                    {jenis}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <Spinner />
                            </div>
                        ) : error ? (
                            <div className="text-center py-4 text-red-500">{error}</div>
                        ) : (
                            <Table
                                headers={headers}
                                data={filteredData().map((item) => ({
                                    ...item,
                                    tanggal: moment(item.tanggal).format('DD MMMM YYYY'),
                                    total: `Rp${Number(item.total).toLocaleString('id-ID')}`,
                                    toko: typeof item.toko === 'object' ? item.toko.nama_toko : item.toko
                                }))}
                                onRowClick={handleRowClick}
                                hasFilter={true}
                                onFilterClick={handleFilterClick}
                            />
                        )}
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
                                    value={(field.key === "Toko" || field.key === "Cabang") ? selectedStore : selectedKategori}
                                    onSelect={(value) => 
                                        (field.key === "Toko" || field.key === "Cabang")
                                            ? setSelectedStore(value.value)
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

                {errorMessage && (
                    <AlertError
                        title={'Failed'}
                        description={errorMessage}
                        onConfirm={() => setErrorMessage(null)}
                    />
                )}
        </LayoutWithNav>
    </>
);
}