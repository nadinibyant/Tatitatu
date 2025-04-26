import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Button from "../../../components/Button";
import { useEffect, useState } from "react";
import moment from "moment";
import Table from "../../../components/Table";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";
import ModalEditAbsensi from "./ModalEditAbsensi";
import Alert from "../../../components/Alert";

export default function DetailKaryawan(){
    const [isLoading, setLoading] = useState(false)
    const location = useLocation()
    const {id, divisi} = location.state || {}
    console.log(divisi)
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const monthValue = `${selectedYear}-${selectedMonth}`;
    const userData = JSON.parse(localStorage.getItem('userData'))
    const isHeadGudang = userData?.role === 'headgudang'
    const isManager = userData?.role === 'manajer'
    const isAdminGudang = userData?.role === 'admingudang'
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAbsensi, setSelectedAbsensi] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailType, setDetailType] = useState('');

    const extractCoordinates = (url) => {
        try {
          const regex = /q=([^&]+)/;
          const match = url.match(regex);
          if (match && match[1]) {
            const coords = match[1].split(',');
            if (coords.length === 2) {
              return {
                lat: parseFloat(coords[0]),
                lng: parseFloat(coords[1])
              };
            }
          }
          return { lat: 0, lng: 0 };
        } catch (error) {
          console.error('Error extracting coordinates:', error);
          return { lat: 0, lng: 0 };
        }
      };

      const getMapEmbedUrl = (lat, lng) => {
        return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
      };

      const handleOpenDetailModal = (type, data) => {
        setDetailData(data);
        setDetailType(type);
        setDetailModalOpen(true);
      };

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2))
        ? "hitam"
        : "primary";

        const themeColor3 = (isAdminGudang || isHeadGudang) 
        ? 'coklatTua' 
        : (isManajer || isOwner || isFinance) 
          ? "biruTua" 
          : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2))
            ? "hitam"
            : "pink";

        const themeColor2 = (isAdminGudang || isHeadGudang) 
        ? 'coklatTua' 
        : (isManajer || isOwner || isFinance) 
          ? "biruTua" 
          : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2))
            ? "hitam"
            : "pink";

      const textColor = (isAdminGudang || isHeadGudang) 
      ? "coklatMuda" 
      : (isManajer || isOwner || isFinance) 
        ? "biruMuda" 
        : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2))
        ? "white"
        : "primary"; 

    const [isAlert, setIsAlert] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsAlert(true);
    };

    const handleConfirmDel = async () => {
        try {
            setLoading(true);
            await api.delete(`/absensi-karyawan/${deleteId}`);
            
            fetchAbsensiData();
            
            setIsAlert(false);
        } catch (error) {
            console.error('Error deleting data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (e) => {
        const value = e.target.value; 
        const [year, month] = value.split('-');
        setSelectedMonth(month);
        setSelectedYear(year);
    };
    
    const breadcrumbItems = [
        { label: "Data Karyawan Absensi dan Gaji", href: "/dataKaryawanAbsenGaji" },
        { label: "Detail", href: "" },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate()

    const handleRowClick = (row) => {
        navigate(`/pembelianStok/detail`, { state: { id: row.id } });
    };

    const formatDate2 = (date) =>
        new Date(date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    const headers = [
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        // { label: "Foto", key: "Foto", align: "text-left"},
        { label: "Jam Masuk", key: "Jam Masuk", align: "text-left" },
        { label: "Jam Keluar", key: "Jam Keluar", align: "text-left" },
        { label: "Total Waktu", key: "Total Waktu", align: "text-left" },
        // { label: "Lokasi", key: "Lokasi", align: "text-left" },
        { label: "Gaji Pokok Perhari", key: "Gaji Pokok Perhari", align: "text-left" },
        ...(isManager ? [{ label: "Aksi", key: "Aksi", align: "text-center" }] : []), 
    ];
    
    const headersProduksi = [
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left" },
        { label: "Jumlah Produksi", key: "Jumlah Produksi", align: "text-left" },
        { label: "Total Menit", key: "Total Menit", align: "text-left" },
        { label: "Lokasi", key: "Lokasi", align: "text-left" },
        { label: "Status", key: "Status", align: "text-left" },
        { label: "Gaji Pokok Perhari", key: "Gaji Pokok Perhari", align: "text-left" },
    ];
    
    const headersTransportasi = [
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left"},
        { label: "Lokasi", key: "Lokasi", align: "text-left" },
        { label: "Status", key: "Status", align: "text-left" },
        ...(isManager ? [{ label: "Aksi", key: "Aksi", align: "text-center" }] : []), 
    ];

    const handleEdit = (item) => {
        setSelectedAbsensi(item);
        setIsEditModalOpen(true);
    };


    const [data, setData] = useState({
        "Gaji Pokok": 0,
        "Total Menit Kerja": 0,
        "Persentase KPI Tercapai": 0,
        "Total Bonus": 0,
        "Total Gaji Akhir": 0,
        profile: {
            nama: '',
            phone: '',
            email: '',
            toko: '',
            cabang: '',
            divisi: '',
            total_gaji_pokok: 0,
            total_bonus: 0,
            waktu_kerja_sebulan_antar: 0,
            waktu_kerja_sebulan_menit: 0,
            kehadiran:0,
            izin:0,
            tidak_ada_kejelasan: 0,
            foto: ''
        },
        data: [
        ]
    })

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/data-absensi-karyawan/${id}/${selectedMonth}/${selectedYear}/karyawan`);
            const { 
                karyawan, 
                kehadiran, 
                totalCutiDays, 
                tidakHadir,
                totalGajiPokok,
                totalMenit,
                totalPersentaseTercapai,
                totalBonusDiterima,
                totalGajiAkhir
            } = response.data.data;
     
            setData(prevData => ({
                ...prevData,
                "Gaji Pokok": totalGajiPokok || 0,
                "Total Menit Kerja": totalMenit || 0,
                "Persentase KPI Tercapai": totalPersentaseTercapai || 0,
                "Total Bonus": totalBonusDiterima || 0,
                "Total Gaji Akhir": totalGajiAkhir || 0,
                profile: {
                    nama: karyawan.nama_karyawan,
                    phone: karyawan.nomor_handphone || '-',
                    email: karyawan.email,
                    toko: karyawan.toko.nama_toko, 
                    cabang: karyawan.cabang?.nama_cabang || '-',
                    divisi: karyawan.divisi.nama_divisi,
                    total_gaji_pokok: karyawan.jumlah_gaji_pokok || 0,
                    total_bonus: karyawan.bonus || 0,
                    waktu_kerja_sebulan_antar: karyawan.waktu_kerja_sebulan_antar,
                    waktu_kerja_sebulan_menit: karyawan.waktu_kerja_sebulan_menit,
                    kehadiran: kehadiran || 0,
                    izin: totalCutiDays || 0,
                    tidak_ada_kejelasan: tidakHadir || 0,
                    foto: karyawan.image || 'https://via.placeholder.com/50'
                }
            }));
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProduksiGudangData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/produksi-gudang/karyawan/${id}`);
            
            if (response.data.success) {
                const allData = response.data.data.map(item => ({
                    id: item.produksi_gudang_id,
                    Tanggal: item.tanggal,
                    rawDate: new Date(item.tanggal), 
                    Foto: `${import.meta.env.VITE_API_URL}/images-produksi-gudang/${item.image}`,
                    "Jumlah Produksi": `${item.jumlah_produksi.toLocaleString('id-ID') || 0} Pcs`,
                    "Total Menit": `${item.total_menit.toLocaleString('id-ID') || 0} Menit`,
                    Status: item.status,
                    "Gaji Pokok Perhari": item.gaji_pokok_perhari || 0,
                    "Lokasi": item.gmaps ? (
                        <a
                            href={item.gmaps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            Lokasi
                        </a>
                    ) : '-',
                    produkInfo: item.produk && item.produk.length > 0 
                        ? item.produk.map(p => `${p.jumlah}x ${p.barang.nama_barang}`).join(', ')
                        : '-'
                }));
                
                const filteredData = allData.filter(item => {
                    const itemDate = item.rawDate;
                    const itemMonth = itemDate.getMonth() + 1; 
                    const itemYear = itemDate.getFullYear();
                    
                    const monthNumber = parseInt(selectedMonth, 10);
                    const yearNumber = parseInt(selectedYear, 10);
                    
                    return itemMonth === monthNumber && itemYear === yearNumber;
                });
                
                console.log(`Filtered data: ${filteredData.length} records out of ${allData.length} total`);
                
                const finalData = filteredData.map(({ rawDate, ...rest }) => rest);
        
                setData(prevData => ({
                    ...prevData,
                    data: finalData
                }));
                
                if (filteredData.length > 0) {
                    const totalMinutes = filteredData.reduce((sum, item) => {
                        const minutes = parseInt(item["Total Menit"].split(' ')[0].replace(/,/g, ''), 10);
                        return sum + (isNaN(minutes) ? 0 : minutes);
                    }, 0);
                    
                    const totalSalary = filteredData.reduce((sum, item) => {
                        return sum + (item["Gaji Pokok Perhari"] || 0);
                    }, 0);
                    
                    setData(prevData => ({
                        ...prevData,
                        "Total Menit Kerja": totalMinutes,
                        "Gaji Pokok": totalSalary
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching produksi gudang data:', error);
        } finally {
            setLoading(false);
        }
    };


    const fetchAbsensiData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/list-absensi-karyawan/${id}/${selectedMonth}/${selectedYear}/karyawan`);
            const { absensiRecord, totalGajiPokok, totalMenit } = response.data.data;

            if (divisi === 'Transportasi') {
                setData(prevData => ({
                    ...prevData,
                    "Total Menit Kerja": totalMenit || 0,
                    "Gaji Pokok": totalGajiPokok || 0,
                    data: absensiRecord.map(item => ({
                        id: item.absensi_karyawan_id,
                        Tanggal: item.tanggal,
                        Foto: `${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${item.image}`,
                        Lokasi: item.gmaps ? (
                            <a
                                href={item.gmaps}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                {item.lokasi}
                            </a>
                        ) : '-',
                        Status: item.status
                    }))
                }));
            } 
            else if (divisi === 'Produksi') {
                setData(prevData => ({
                    ...prevData,
                    "Total Menit Kerja": totalMenit || 0,
                    "Gaji Pokok": totalGajiPokok || 0,
                    data: absensiRecord.map(item => ({
                        id: item.absensi_karyawan_id,
                        Tanggal: item.tanggal,
                        Foto: `${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${item.image}`,
                        "Jumlah Produksi": item.jumlah_produksi.toLocaleString('id-ID') || "0 Pcs",
                        "Total Menit": item.total_menit ? `${item.total_menit} Menit` : "0 Menit",
                        "Status": item.status || "Pending",
                        "Gaji Pokok Perhari": item.gaji_pokok_perhari || 0,
                        "Lokasi": item.gmaps ? (
                            <a
                                href={item.gmaps}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                Lokasi
                            </a>
                        ) : '-',
                    }))
                }));
            } 
            else {
                setData(prevData => ({
                  ...prevData,
                  "Total Menit Kerja": totalMenit || 0,
                  "Gaji Pokok": totalGajiPokok || 0,
                  data: absensiRecord.map(item => {
                    const masuk = item.jam_masuk || { jam: '-', foto: '', lokasi: '' };
                    const keluar = item.jam_keluar || { jam: '-', foto: '', lokasi: '' };
                    
                    return {
                      id: item.absensi_karyawan_id || null,
                      Tanggal: item.tanggal,
                      Foto: <img 
                        src={`${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${masuk.foto}`} 
                        className="w-12 h-12 object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/64/64";
                        }}
                      />,
                      "Jam Masuk": masuk.jam !== '-' ? (
                        <button 
                          className={`text-${themeColor} hover:underline flex items-center`}
                          onClick={() => handleOpenDetailModal('masuk', masuk)}
                        >
                          {masuk.jam}
                          <svg 
                            className="w-4 h-4 ml-1" 
                            fill="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 6C7.6 6 4 8.1 4 10.8V14.4C4 17.1 7.6 19.2 12 19.2C16.4 19.2 20 17.1 20 14.4V10.8C20 8.1 16.4 6 12 6Z" strokeWidth="2" stroke="currentColor" fill="none"/>
                            <path d="M12 15.6C14.2091 15.6 16 14.5255 16 13.2C16 11.8745 14.2091 10.8 12 10.8C9.79086 10.8 8 11.8745 8 13.2C8 14.5255 9.79086 15.6 12 15.6Z" strokeWidth="2" stroke="currentColor" fill="none"/>
                          </svg>
                        </button>
                      ) : '-',
                      "Jam Keluar": keluar.jam !== '-' ? (
                        <button 
                          className={`text-${themeColor} hover:underline flex items-center`}
                          onClick={() => handleOpenDetailModal('keluar', keluar)}
                        >
                          {keluar.jam}
                          <svg 
                            className="w-4 h-4 ml-1" 
                            fill="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 6C7.6 6 4 8.1 4 10.8V14.4C4 17.1 7.6 19.2 12 19.2C16.4 19.2 20 17.1 20 14.4V10.8C20 8.1 16.4 6 12 6Z" strokeWidth="2" stroke="currentColor" fill="none"/>
                            <path d="M12 15.6C14.2091 15.6 16 14.5255 16 13.2C16 11.8745 14.2091 10.8 12 10.8C9.79086 10.8 8 11.8745 8 13.2C8 14.5255 9.79086 15.6 12 15.6Z" strokeWidth="2" stroke="currentColor" fill="none"/>
                          </svg>
                        </button>
                      ) : '-',
                      "Total Waktu": `${item.total_menit || 0}`,
                      "Gaji Pokok Perhari": item.total_gaji_pokok || 0,
                      "Lokasi": '-',
                      // Store original data for internal use
                      raw: {
                        jam_masuk: masuk,
                        jam_keluar: keluar
                      },
                      ...(isManager && {
                        Aksi: (
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit({
                                  ...item,
                                  id: item.absensi_karyawan_id
                                });
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.absensi_karyawan_id);
                              }}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )
                      })
                    };
                  })
                }));
              }
    
        } catch (error) {
            console.error('Error fetching absensi data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchProfile();
            
            if (divisi === 'Produksi' && (userData?.role === 'headgudang' || userData?.role === 'manajer')) {
                await fetchProduksiGudangData();
            } else {
                await fetchAbsensiData();
            }
        };
        fetchData();
    }, [selectedMonth, selectedYear, divisi]);

    const renderTable = () => {
        if (divisi === 'Produksi') {
            return (
                <Table
                    headers={headersProduksi}
                    data={data.data.map((item, index) => ({
                        ...item,
                        Tanggal: formatDate2(item.Tanggal),
                        Foto: <img src={item.Foto} className="w-12 h-12 object-cover" />,
                        Status: <span className={`px-3 py-1 rounded-lg ${
                            item.Status === 'Diterima' ? 'bg-green-100 text-green-800' : 
                            item.Status === 'Ditolak' ? 'bg-red-100 text-red-800' : 
                            item.Status === 'proses' ? 'bg-yellow-100 text-yellow-800' : 
                            ''
                        }`}>{item.Status}</span>,
                        "Gaji Pokok Perhari": `Rp${formatNumberWithDots(item["Gaji Pokok Perhari"])}`,
                    }))}
                />
            );
        } else if (divisi === 'Transportasi') {
            return (
                <Table
                    headers={headersTransportasi}
                    data={data.data.map((item, index) => ({
                        ...item,
                        Tanggal: formatDate2(item.Tanggal),
                        Foto: <img src={item.Foto} className="w-12 h-12 object-cover" />,
                        Status: <span className={`px-3 py-1 rounded-lg ${
                            item.Status === 'Antar' ? `bg-${themeColor2} text-${textColor}` : `bg-${textColor} text-${themeColor3}`
                        }`}>{item.Status}</span>,
                        ...(isManager && {
                            Aksi: (
                                <div className="flex items-center justify-center space-x-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(item);
                                        }}
                                        className="p-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                        className="p-1 text-red-600 hover:text-red-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )
                        })
                    }))}
                />
            );
        } else {
            return (
                <Table
                    headers={headers}
                    data={data.data.map((item, index) => ({
                        ...item,
                        Tanggal: formatDate2(item.Tanggal),
                        Foto: <img src={item.Foto} className="w-12 h-12 object-cover" />,
                        "Gaji Pokok Perhari": `Rp${formatNumberWithDots(item["Gaji Pokok Perhari"])}`,
                        "Total Waktu": `${item["Total Waktu"]} Menit`,
                        ...(isManager && {
                            Aksi: (
                                <div className="flex items-center justify-center space-x-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(item);
                                        }}
                                        className="p-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                        className="p-1 text-red-600 hover:text-red-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )
                        })
                    }))}
                />
            );
        }
    };

    const handleIconCall = (isAdminGudang || isHeadGudang) ? (
        '/icon/call_gudang.svg'
      ) : (isManajer || isOwner || isFinance) ? (
        '/icon/call_non.svg'
      ) : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2)) ? (
        '/icon/call_toko2.svg'
      ): (
        '/icon/call.svg'
    );

    const handleIconMail = (isAdminGudang || isHeadGudang) ? (
        '/icon/mail_gudang.svg'
      ) : (isManajer || isOwner || isFinance) ? (
        '/icon/mail_non.svg'
      ) : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2)) ? (
        '/icon/mail_toko2.svg'
      ): (
        '/icon/mail.svg'
    );
    
    const DetailModal = ({ isOpen, onClose, data, type }) => {
        if (!isOpen || !data) return null;
        
        const coords = extractCoordinates(data.lokasi);
        
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
              <div 
                className="fixed inset-0 bg-black opacity-30"
                onClick={onClose}
              ></div>
      
              <div className="relative bg-white rounded-lg w-full max-w-lg md:w-2/3 lg:w-3/5 p-4 sm:p-6 mx-4 my-8 sm:my-0">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detail Absensi - Jam {type === 'masuk' ? 'Masuk' : 'Keluar'} ({data.jam})
                  </h3>
                  <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
      
                <div className="space-y-6">
                  {/* Image */}
                  <div>
                    <h4 className="text-md font-medium mb-2">Foto Absensi</h4>
                    <div className="bg-gray-100 rounded-lg p-2 flex justify-center">
                      <img 
                        src={`${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${data.foto}`}
                        alt={`Foto Absensi ${type}`}
                        className="rounded-lg max-h-64 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/400/300";
                        }}
                      />
                    </div>
                  </div>
      
                  {/* Map */}
                  <div>
                    <h4 className="text-md font-medium mb-2">Lokasi</h4>
                    <div className="bg-gray-100 rounded-lg p-2 h-64">
                      <iframe
                        title="Location Map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0, borderRadius: '0.5rem' }}
                        src={getMapEmbedUrl(coords.lat, coords.lng)}
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="mt-2">
                      <a 
                        href={data.lokasi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-${themeColor} hover:underline flex items-center justify-center`}
                      >
                        Buka di Google Maps
                        <svg 
                          className="w-4 h-4 ml-1" 
                          fill="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M14 5C13.4477 5 13 4.55228 13 4C13 3.44772 13.4477 3 14 3H20C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11C19.4477 11 19 10.5523 19 10V6.41421L11.7071 13.7071C11.3166 14.0976 10.6834 14.0976 10.2929 13.7071C9.90237 13.3166 9.90237 12.6834 10.2929 12.2929L17.5858 5H14Z" />
                          <path d="M5 7C4.44772 7 4 7.44772 4 8V19C4 19.5523 4.44772 20 5 20H16C16.5523 20 17 19.5523 17 19V14C17 13.4477 17.4477 13 18 13C18.5523 13 19 13.4477 19 14V19C19 20.6569 17.6569 22 16 22H5C3.34315 22 2 20.6569 2 19V8C2 6.34315 3.34315 5 5 5H10C10.5523 5 11 5.44772 11 6C11 6.55228 10.5523 7 10 7H5Z" />
                        </svg>
                      </a>
                    </div>
                  </div>
      
                  <button
                    type="button"
                    onClick={onClose}
                    className={`w-full px-4 py-2 bg-${themeColor} text-white rounded-lg hover:bg-opacity-90 font-medium`}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      };

    return(
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions} showAddNoteButton={true}>
            <div className="p-5">
            <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                                <input 
                                    type="month"
                                    value={monthValue}
                                    onChange={handleMonthChange}
                                    className={`border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-${themeColor}`}
                                    style={{
                                        maxWidth: '200px',
                                    }}
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
                                {/* Bulan */}
                                <div className="flex flex-col w-full">
                                    <label className="text-sm font-medium text-gray-600 pb-3">Bulan</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {moment.months().map((month, index) => (
                                            <option key={month} value={String(index + 1).padStart(2, '0')}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Tahun */}
                                <div className="flex flex-col w-full">
                                    <label className="text-sm font-medium text-gray-600 pb-3">Tahun</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {Array.from(
                                            { length: moment().year() - 1999 }, 
                                            (_, i) => moment().year() - i
                                        ).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Quick select buttons */}
                            <div className="flex flex-col space-y-3 w-full">
                                <button
                                    onClick={() => {
                                        setSelectedMonth(moment().format("MM"));
                                        setSelectedYear(moment().format("YYYY"));
                                        setIsModalOpen(false);
                                    }}
                                    className={`px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-${themeColor} hover:text-white`}
                                >
                                    Bulan Ini
                                </button>
                                <button
                                    onClick={() => {
                                        const lastMonth = moment().subtract(1, 'months');
                                        setSelectedMonth(lastMonth.format("MM"));
                                        setSelectedYear(lastMonth.format("YYYY"));
                                        setIsModalOpen(false);
                                    }}
                                    className={`px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-${themeColor} hover:text-white`}
                                >
                                    Bulan Lalu
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                </section>

                <section className={`mt-5 bg-${themeColor} rounded-xl p-5`}>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-center text-white">
                        <div className="flex flex-col">
                            <p className="text-sm">Gaji Pokok</p>
                            <p className="font-bold">{`Rp${formatNumberWithDots(data["Gaji Pokok"])}`}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">Total Menit Kerja</p>
                            <p className="font-bold">{formatNumberWithDots(data["Total Menit Kerja"])}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">Persentase KPI Tercapai</p>
                            <p className="font-bold">{`${data["Persentase KPI Tercapai"]}%`}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">Total Bonus yang Diterima</p>
                            <p className="font-bold">{`Rp${formatNumberWithDots(data["Total Bonus"])}`}</p>
                        </div>
                        <div className="flex items-center justify-center space-x-3 text-center">
                            <img src="/icon/gajiAkhir.svg" alt="Icon Gaji Akhir" className="w-6 h-6" />
                            <div>
                            <p className="text-sm">Total Gaji Akhir</p>
                            <p className="font-bold text-start">{`Rp${formatNumberWithDots(data["Total Gaji Akhir"])}`}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-8 space-y-5 sm:space-y-0 pb-5 border-b border-secondary">
                        {/* Profile Section */}
                        <div className="flex items-center space-x-4">
                            <img
                                src={`${import.meta.env.VITE_API_URL}/images-karyawan/${data.profile.foto}`}
                                alt="profile"
                                className="w-20 h-20 rounded-full"
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="w-full">
                            <div className="flex flex-col sm:flex-row sm:space-x-8 w-full">
                                <div className="flex items-center space-x-2">
                                    <img src={handleIconCall} alt="call" className="w-5 h-5" />
                                    <p className="text-secondary">{data.profile.phone}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src={handleIconMail} alt="email" className="w-5 h-5" />
                                    <p className="text-secondary">{data.profile.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 w-full mt-5">

                                <div className="">
                                    <p className="text-sm text-gray-500">Nama</p>
                                    <p className="font-bold">{data.profile.nama}</p>
                                </div>

                                <div className="">
                                    <p className="text-sm text-gray-500">Toko/Cabang</p>
                                    <p className="font-bold">{data.profile.toko}/{data.profile.cabang}</p>
                                </div>

                                <div className="">
                                    <p className="text-sm text-gray-500">Divisi</p>
                                    <p className="font-bold">{data.profile.divisi}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="py-5 space-y-4 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="">
                                <p className="text-sm text-gray-500">Total Gaji Pokok</p>
                                <p className="font-bold">Rp{formatNumberWithDots(data.profile.total_gaji_pokok)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Total Bonus</p>
                                <p className="font-bold">Rp{formatNumberWithDots(data.profile.total_bonus)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Waktu Kerja Sebulan</p>
                                {divisi === "Transportasi" ? (
                                    <p className="font-bold">{formatNumberWithDots(data.profile.waktu_kerja_sebulan_antar) || 0} Antar</p>   
                                ) : (
                                    <p className="font-bold">{formatNumberWithDots(data.profile.waktu_kerja_sebulan_menit) || 0} Menit</p>   
                                )}
                            </div>


                            <div className="">
                                <p className="text-sm text-gray-500">Kehadiran</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.kehadiran)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Izin/Cuti</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.izin)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Tidak Ada Kejelasan</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.tidak_ada_kejelasan)}</p>
                            </div>

                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        {renderTable()}
                    </div>
                </section>

                {detailModalOpen && (
                    <DetailModal
                        isOpen={detailModalOpen}
                        onClose={() => setDetailModalOpen(false)}
                        data={detailData}
                        type={detailType}
                    />
                )}

                {isLoading && <Spinner />}

                {isManager && (
                    <ModalEditAbsensi
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        divisi={divisi}
                        absensiData={selectedAbsensi}
                        onSuccess={() => {
                            fetchAbsensiData();
                        }}
                    />
                )}

                {isAlert && (
                    <Alert
                        title="Hapus Data"
                        description="Apakah kamu yakin ingin menghapus data ini?"
                        confirmLabel="Hapus"
                        cancelLabel="Kembali"
                        onConfirm={handleConfirmDel}
                        onCancel={() => setIsAlert(false)}
                        open={isAlert}
                        onClose={() => setIsAlert(false)}
                    />
                )}
            </div>
        </LayoutWithNav>
        </>
    )
}