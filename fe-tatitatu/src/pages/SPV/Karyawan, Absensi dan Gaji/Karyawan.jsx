import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import { useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../components/LayoutWithNav";
import InputDropdown from "../../../components/InputDropdown";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";

export default function Karyawan(){
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    // const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    // const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [selectedStore, setSelectedStore] = useState("Semua");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const userData = JSON.parse(localStorage.getItem('userData'));
    const isHeadGudang = userData?.role === 'headgudang';
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const [isLoading, setLoading] = useState(false)
    const [branchList, setBranchList] = useState([])
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const [divisions, setDivisions] = useState([])
    const [filterFields, setFilterFields] = useState([]);

    const monthValue = `${selectedYear}-${selectedMonth}`;

    useEffect(() => {
        const initializeFilters = async () => {
            await Promise.all([fetchBranches(), fetchDivisi()]);
            
            const filters = [
                ...(isHeadGudang ? [{
                    label: "Cabang",
                    key: "Cabang",
                    options: branchList
                }] : []),
                {
                    label: "Divisi",
                    key: "Divisi",
                    options: divisions
                }
            ];
            
            setFilterFields(filters);
        };
    
        initializeFilters();
    }, [branchList, divisions, isHeadGudang]);


    const handleMonthChange = (e) => {
        const value = e.target.value; 
        const [year, month] = value.split('-');
        setSelectedMonth(month);
        setSelectedYear(year);
    };

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
  
        const fetchBranches = async () => {
            try {
                const response = await api.get('/cabang');
                if (response.data.success) {
                    const options = [
                        { 
                            value: "Semua", 
                            label: "Semua",
                            icon: '/icon/toko.svg' 
                        },
                        ...response.data.data.map(branch => ({
                            value: branch.cabang_id,
                            label: branch.nama_cabang,
                            icon: '/icon/toko.svg' 
                        }))
                    ];
                    setBranchList(options);
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
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
            fetchBranches();
            fetchDivisi()
        }, []);

        const [data,setData] = useState([])

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/absensi-karyawan/${selectedMonth}/${selectedYear}`);
        
                
                if (response.data.success) {
                    const formattedData = response.data.data.map(item => ({
                        id: item.karyawan.karyawan_id,
                        Nama: item.karyawan.nama_karyawan,
                        Divisi: item.karyawan.divisi.nama_divisi,
                        Cabang: item.karyawan.cabang.nama_cabang,
                        Absen: item.kehadiran,
                        KPI: item.totalPersentaseTercapai,
                        "Total Gaji Akhir": item.totalGajiAkhir
                    }));
                    
                    setData(formattedData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchData();
        }, [selectedMonth, selectedYear, selectedStore, selectedKategori]);
        
        

        const headers = [
            { label: "No", key: "No", align: "text-left" },
            { label: "Nama", key: "Nama", align: "text-left" },
            { label: "Divisi", key: "Divisi", align: "text-left" },
            { label: "Cabang", key: "Cabang", align: "text-left" },
            { label: "Absen", key: "Absen", align: "text-left" },
            { label: "KPI", key: "KPI", align: "text-left" },
            { label: "Total Gaji Akhir", key: "Total Gaji Akhir", align: "text-left" },
        ];

        const filteredData = () => {
            if (!data) return [];
            
            let dataToDisplay = [...data];

            if (selectedKategori !== "Semua") {
                dataToDisplay = dataToDisplay.filter(item => 
                    item.Divisi === selectedKategori
                );
            }
        
            if (!isHeadGudang && selectedStore !== "Semua") {
                dataToDisplay = dataToDisplay.filter(item => 
                    item.Cabang === selectedStore
                );
            }
        
            return dataToDisplay;
        };

        
        function formatNumberWithDots(number) {
            return number.toLocaleString('id-ID');
        }

        const navigate = useNavigate()
        const handleRowClick = (row) => {
            navigate('/dataKaryawanAbsenGaji/detail', { state: { id: row.id, divisi: row.Divisi } });
        }

    return(
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                    <p className="text-primary text-base font-bold">Data Karyawan Absensi dan Gaji</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                            <Button 
                                label="Export" 
                                icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                                </svg>} 
                                bgColor="border border-secondary" 
                                hoverColor="hover:bg-white" 
                                textColor="text-black" 
                            />
                        </div>
                        {!isHeadGudang && (
                            <div className="w-full md:w-auto">
                                <ButtonDropdown 
                                    selectedIcon={'/icon/toko.svg'} 
                                    options={branchList} 
                                    onSelect={(value) => setSelectedStore(value)} 
                                />
                            </div>
                        )}
                        <div className="w-full md:w-auto">
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
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                            <Table
                                headers={headers}
                                data={filteredData().map((item, index) => ({
                                    ...item,
                                    No: index + 1,
                                    Absen: `${formatNumberWithDots(item.Absen)}`,
                                    "Total Gaji Akhir": `Rp${formatNumberWithDots(item["Total Gaji Akhir"])}`,
                                }))}
                                hasFilter={true}
                                onFilterClick={handleFilterClick}
                                onRowClick={handleRowClick}
                            />
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
                                            value={field.key === "Cabang" ? selectedStore : selectedKategori}
                                            onSelect={(value) => 
                                                field.key === "Cabang" 
                                                    ? setSelectedStore(value.value)
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

                {isLoading && (
                    <Spinner/>
                )}
                </section>
            </div>
        </LayoutWithNav>
        </>
    )
}