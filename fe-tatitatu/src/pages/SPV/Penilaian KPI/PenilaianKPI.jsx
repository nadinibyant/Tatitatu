import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import ButtonDropdown from "../../../components/ButtonDropdown";
import { useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../components/LayoutWithNav";
import InputDropdown from "../../../components/InputDropdown";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";

export default function PenilaianKPI() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    // const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    // const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState({ value: "Semua", label: "Semua" });
    const [selectedStore, setSelectedStore] = useState({ value: "Semua", label: "Semua" });
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isHeadGudang = userData?.role === 'headgudang';
    const isAdminGudang = userData?.role == 'admingudang'
    const isOwner = userData?.role === 'owner'
    const isManajer = userData?.role === 'manajer';
    const isFinance = userData?.role === 'finance'
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const [divisions, setDivisions] = useState([])
    const [filterFields, setFilterFields] = useState([]);
    const [isLoading,setLoading] = useState(false)
    const [branchList, setBranchList] = useState([])
    const [tokoList, setTokoList] = useState([]);
    const toko_id = userData.userId

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? "coklatTua" 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";

      const exportIcon = (isAdminGudang || isHeadGudang) ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
          <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#71503D"/>
        </svg>
      ) : (isManajer || isOwner || isFinance) ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
          <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#023F80"/>
        </svg>
      ) : (
        <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
        </svg>
      );
      
    useEffect(() => {
        const newFilterFields = isHeadGudang ? [
            {
                label: "Divisi",
                key: "Divisi",
                options: divisions
            }
        ] : [
            {
                label: isManajer ? "Toko" : "Cabang", 
                key: isManajer ? "Toko" : "Cabang",  
                options: isManajer ? tokoList : branchList
            },
            {
                label: "Divisi",
                key: "Divisi",
                options: divisions
            }
        ];
        
        setFilterFields(newFilterFields);
    }, [branchList, divisions, isHeadGudang, isManajer]);
    

    const monthValue = `${selectedYear}-${selectedMonth}`;

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


    const [data, setData] = useState([]);

    const fetchKPIData = async () => {
        try {
            setLoading(true);
            let response;
            if (isManajer) {
                response = await api.get(`/manager-absensi-karyawan?bulan=${selectedMonth}&tahun=${selectedYear}`);
            } else {
                response = await api.get(`/absensi-karyawan/${selectedMonth}/${selectedYear}?toko_id=${toko_id}`);
            }
            
            let formattedData;
            if (response.data.success) {
                if (isManajer) {
                    formattedData = response.data.data.map(item => ({
                        id: item.karyawan.karyawan_id,
                        Nama: item.karyawan.nama_karyawan,
                        Divisi: item.karyawan.divisi.nama_divisi,
                        Toko: item.karyawan.toko?.nama_toko || item.karyawan.cabang?.nama_cabang || '-',
                        KPI: item.totalPersentaseTercapai || 0,
                        "Total Gaji Akhir": item.totalGajiAkhir || 0
                    }));
                } else {
                    formattedData = response.data.data.map(item => ({
                        id: item.karyawan.karyawan_id,
                        Nama: item.karyawan.nama_karyawan,
                        Divisi: item.karyawan.divisi.nama_divisi,
                        Cabang: item.karyawan.cabang?.nama_cabang || '-',
                        KPI: item.totalPersentaseTercapai || 0,
                        "Total Gaji Akhir": item.totalGajiAkhir || 0
                    }));
                }
                
                setData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching KPI data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKPIData();
    }, [selectedMonth, selectedYear, selectedStore, selectedKategori]);


    const headers = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Divisi", key: "Divisi", align: "text-left" },
        ...(!isHeadGudang ? [{ 
            label: isManajer ? "Toko" : "Cabang", 
            key: isManajer ? "Toko" : "Cabang", 
            align: "text-left" 
        }] : []),
        { label: "KPI", key: "KPI", align: "text-left" },
        { label: "Total Gaji Akhir", key: "Total Gaji Akhir", align: "text-left" },
    ];
    

    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    const fetchBranches = async () => {
        try {
            const response = await api.get(`/cabang?toko_id=${toko_id}`);
            const branchList = [
                { label: "Semua", value: "Semua" },
                ...response.data.data.map(div => ({
                    label: div.nama_cabang,
                    value: div.cabang_id
                }))
            ];
            setBranchList(branchList);
        } catch (error) {
            console.error('Error fetching divisi:', error);
        }
    };

    const fetchToko = async () => {
        try {
            const response = await api.get('/toko'); 
            const filteredToko = response.data.data.filter(toko => !toko.is_deleted); 
            const tokoList = [
                { label: "Semua", value: "Semua" },
                ...filteredToko.map(toko => ({
                    label: toko.nama_toko,
                    value: toko.toko_id
                }))
            ];
            setTokoList(tokoList);
        } catch (error) {
            console.error('Error fetching toko:', error);
        }
    };

    const fetchDivisi = async () => {
        try {
            let response;
            if (isManajer) {
                response = await api.get('/manager-kpi-divisi');
            } else {
                response = await api.get(`/divisi-karyawan?toko_id=${toko_id}`);
            }
            
            const divisiList = [
                { label: "Semua", value: "Semua" },
                ...response.data.data.map(div => ({
                    label: div.nama_divisi,
                    value: div.divisi_karyawan_id
                }))
            ];
            setDivisions(divisiList);
        } catch (error) {
            console.error('Error fetching divisi:', error);
        }
    };

    useEffect(() => {
        if (isManajer) {
            fetchToko();
        } else {
            fetchBranches();
        }
        fetchDivisi();
    }, [isManajer]);

    const filteredData = () => {
        let dataToDisplay = [...data];
    
        if (selectedKategori.value !== "Semua") {
            dataToDisplay = dataToDisplay.filter(item => 
                item.Divisi === selectedKategori.label
            );
        }
    
        if (!isHeadGudang && selectedStore.value !== "Semua") {
            dataToDisplay = dataToDisplay.filter(item => {
                if (isManajer) {
                    return item.Toko === selectedStore.label;
                } else {
                    return item.Cabang === selectedStore.label;
                }
            });
        }
    
        return dataToDisplay;
    };

    const navigate = useNavigate()
    const handleRowClick = (row) => {
        navigate('/daftarPenilaianKPI/tambah-kpi', {state: {id:row.id}})
    }

    const handleExport = async () => {
        try {
            setLoading(true);

            let queryParams = `toko_id=${toko_id}&bulan=${selectedMonth}&tahun=${selectedYear}`;
            
            if (selectedKategori.value !== "Semua") {
                queryParams += `&divisi=${selectedKategori.value}`;
            }

            if (!isHeadGudang && selectedStore.value !== "Semua") {
                if (isManajer) {
                    queryParams += `&toko_id=${selectedStore.value}`;
                } else {
                    queryParams += `&cabang=${selectedStore.value}`;
                }
            }

            const response = await api.get(`/kpi-karyawan/export?${queryParams}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { 
                type: response.headers['content-type'] 
            });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `kpi-karyawan-${selectedMonth}-${selectedYear}.xlsx`;
            
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error exporting data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions} showAddNoteButton={true}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className={`text-${themeColor} text-base font-bold`}>Daftar Penilaian KPI</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button label="Export" icon={exportIcon} bgColor="border border-secondary" hoverColor={`hover:border-${themeColor}`} textColor="text-black" onClick={handleExport}/>
                            </div>
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

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="p-5">
                            <Table
                                headers={headers}
                                data={filteredData().map((item, index) => ({
                                    ...item,
                                    nomor: index + 1,
                                    "Total Gaji Akhir": `Rp${formatNumberWithDots(item["Total Gaji Akhir"])}`,
                                    KPI: `${item.KPI.toFixed(2)}%`
                                }))}
                                hasFilter={true}
                                onFilterClick={handleFilterClick}
                                onRowClick={handleRowClick}
                            />
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
                                    value={field.key === "Toko" || field.key === "Cabang" 
                                        ? selectedStore.value 
                                        : selectedKategori.value}
                                    onSelect={(value) => 
                                        field.key === "Toko" || field.key === "Cabang"
                                            ? setSelectedStore(value) 
                                            : setSelectedKategori(value) 
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

                {isLoading && (<Spinner/>)}
            </LayoutWithNav>
        </>
    );
}
