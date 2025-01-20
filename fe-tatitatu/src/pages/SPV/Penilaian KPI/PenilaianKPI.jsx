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

export default function PenilaianKPI() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState({ value: "Semua", label: "Semua" });
    const [selectedStore, setSelectedStore] = useState({ value: "Semua", label: "Semua" });
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isHeadGudang = userData?.role === 'headgudang';
    const isManajer = userData?.role === 'manajer';
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const [divisions, setDivisions] = useState([])
    const [filterFields, setFilterFields] = useState([]);
    const [isLoading,setLoading] = useState(false)
    const [branchList, setBranchList] = useState([])
    const [tokoList, setTokoList] = useState([]);

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
  
    const formatMonthYear = () => {
        const monthName = moment(selectedMonth, "MM").format("MMMM");
        return `${monthName} ${selectedYear}`;
    };


    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const [data, setData] = useState([]);

    const fetchKPIData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/kpi-karyawan/${selectedMonth}/${selectedYear}`); 
            
            if (response.data.success) {
                const formattedData = response.data.data.map(item => ({
                    id: item.karyawan_id,
                    Nama: item.nama_karyawan,
                    Divisi: item.divisi,
                    Cabang: item.cabang,
                    KPI: item.kpi_count || 0,
                    "Total Gaji Akhir": item.total_gaji_akhir || 0
                }));
                
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


    // const data = [
    //     {
    //         id: 1,
    //         Nama: 'Nadini Annisa',
    //         Divisi: 'SPV',
    //         Cabang: 'Gor Agus',
    //         KPI: 15,
    //         "Total Gaji Akhir": 15000000
    //     },
    //     {
    //         id:2,
    //         Nama: 'Nadini Annisa',
    //         Divisi: 'SPV',
    //         Cabang: 'Gor Agus',
    //         KPI: 15,
    //         "Total Gaji Akhir": 15000000
    //     },
    //     {
    //         id: 3,
    //         Nama: 'Nadini Annisa',
    //         Divisi: 'Content Creator',
    //         Cabang: 'Lubeg',
    //         KPI: 10,
    //         "Total Gaji Akhir": 14000000
    //     },
    //     {
    //         id:4,
    //         Nama: 'John Doe',
    //         Divisi: 'Admin',
    //         Cabang: 'Lubeg',
    //         KPI: 20,
    //         "Total Gaji Akhir": 16000000
    //     },
    //     { 
    //         id: 5,
    //         Nama: 'John Doe',
    //         Divisi: 'Admin',
    //         Cabang: 'Lubeg',
    //         KPI: 20,
    //         "Total Gaji Akhir": 16000000
    //     },
    //     {
    //         id:6,
    //         Nama: 'John Doe',
    //         Divisi: 'Admin',
    //         Cabang: 'Lubeg',
    //         KPI: 20,
    //         "Total Gaji Akhir": 16000000
    //     },
    //     {
    //         id:7,
    //         Nama: 'John Doe',
    //         Divisi: 'Admin',
    //         Cabang: 'Lubeg',
    //         KPI: 20,
    //         "Total Gaji Akhir": 16000000
    //     },
    //     {
    //         id:8,
    //         Nama: 'John Doe',
    //         Divisi: 'Admin',
    //         Cabang: 'Lubeg',
    //         KPI: 20,
    //         "Total Gaji Akhir": 16000000
    //     },
    //     {
    //         id:9,
    //         Nama: 'John Doe',
    //         Divisi: 'Admin',
    //         Cabang: 'Lubeg',
    //         KPI: 20,
    //         "Total Gaji Akhir": 16000000
    //     },{
    //         id:10,
    //         Nama: 'John Doe',
    //         Divisi: 'Admin',
    //         Cabang: 'Lubeg',
    //         KPI: 20,
    //         "Total Gaji Akhir": 16000000
    //     },{
    //         id:11,
    //         Nama: 'John Doe',
    //         Divisi: 'Admin',
    //         Cabang: 'Lubeg',
    //         KPI: 20,
    //         "Total Gaji Akhir": 16000000
    //     },{
    //         id:12,
    //         Nama: 'John Doe',
    //         Divisi: 'Admin',
    //         Cabang: 'Lubeg',
    //         KPI: 20,
    //         "Total Gaji Akhir": 16000000
    //     },
    // ];


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
            const response = await api.get('/cabang');
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
            const response = await api.get('/toko'); // Sesuaikan dengan endpoint toko
            const filteredToko = response.data.data.filter(toko => !toko.is_deleted); // Filter hanya toko yang aktif
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
            const response = await api.get('/divisi-karyawan');
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

    // const filterFields = [
    //     // Filter Cabang hanya untuk admin
    //     ...(!isHeadGudang ? [{
    //         label: "Cabang",
    //         key: "Cabang",
    //         options: [
    //             { label: "Semua", value: "Semua" },
    //             { label: "Gor Agus", value: "Gor Agus" },
    //             { label: "Lubeg", value: "Lubeg" },
    //         ]
    //     }] : []),
    //     // Filter Divisi untuk semua role
    //     {
    //         label: "Divisi",
    //         key: "Divisi",
    //         options: [
    //             { label: "Semua", value: "Semua" },
    //             { label: "SPV", value: "SPV" },
    //             { label: "Content Creator", value: "Content Creator" },
    //             { label: "Admin", value: "Admin" },
    //         ]
    //     }
    // ];

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

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions} showAddNoteButton={true}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar Penilaian KPI</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button label="Export" icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                                </svg>} bgColor="border border-secondary" hoverColor="hover:bg-white" textColor="text-black" />
                            </div>
                            <div className="w-full md:w-auto">
                            {/* <Button 
                                label={formatMonthYear()}
                                icon={<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.59961 1V4.2M11.9996 1V4.2" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14.3996 2.60004H3.19961C2.31595 2.60004 1.59961 3.31638 1.59961 4.20004V15.4C1.59961 16.2837 2.31595 17 3.19961 17H14.3996C15.2833 17 15.9996 16.2837 15.9996 15.4V4.20004C15.99961 3.31638 15.2833 2.60004 14.3996 2.60004Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M1.59961 7.39996H15.9996" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>} 
                                bgColor="border border-secondary" 
                                hoverColor="hover:bg-white" 
                                textColor="text-black" 
                                onClick={toggleModal} 
                            /> */}
                                <input 
                                    type="month"
                                    value={monthValue}
                                    onChange={handleMonthChange}
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    style={{
                                        maxWidth: '200px',
                                    }}
                                />
                            </div>
                        </div>

                            {/* Modal */}
                            {/* {isModalOpen && (
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
   
                                    <div className="flex flex-col space-y-3 w-full">
                                        <button
                                            onClick={() => {
                                                setSelectedMonth(moment().format("MM"));
                                                setSelectedYear(moment().format("YYYY"));
                                                setIsModalOpen(false);
                                            }}
                                            className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
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
                                            className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                                        >
                                            Bulan Lalu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )} */}
                    </section>

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="p-5">
                            <Table
                                headers={headers}
                                data={filteredData().map((item, index) => ({
                                    ...item,
                                    nomor: index + 1,
                                    "Total Gaji Akhir": `Rp${formatNumberWithDots(item["Total Gaji Akhir"])}`,
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
