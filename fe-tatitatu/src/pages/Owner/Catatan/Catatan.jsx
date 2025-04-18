import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";
import api from "../../../utils/api";
import { RefreshProvider, useRefresh } from "../../../context/RefreshContext";
import ButtonDropdown from "../../../components/ButtonDropdown";

function CatatanContent(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selectedData, setSelectedData] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [data, setData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(moment().format("MMMM"));
    const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
    const [tokoOptions, setTokoOptions] = useState([]);
    const [selectedToko, setSelectedToko] = useState("Semua");
    const [selectedTokoId, setSelectedTokoId] = useState(null);
    
    const { refreshTrigger } = useRefresh();
    const [isExporting, setIsExporting] = useState(false);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? "coklatTua" 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";

    // Fetch toko data
    const fetchTokoData = async () => {
        try {
            const response = await api.get('/toko');
            if (response.data.success) {
                const allOptions = [
                    { value: 'all', label: 'Semua'},
                    ...response.data.data.map(toko => ({
                        value: toko.toko_id,
                        label: toko.nama_toko,
                    }))
                ];
                setTokoOptions(allOptions);
            }
        } catch (error) {
            console.error('Error fetching toko data:', error);
        }
    };

    useEffect(() => {
        fetchTokoData();
    }, []);

    const fetchData = async () => {
        try {
            const monthNumber = moment().month(selectedMonth).format('MM');
            let url = `/catatan?bulan=${monthNumber}&tahun=${selectedYear}`;
            
            if (selectedTokoId) {
                url += `&toko_id=${selectedTokoId}`;
            }
            
            const response = await api.get(url);
            
            if (response.data.success) {
                const transformedData = response.data.data.map(item => ({
                    Tanggal: item.tanggal ? moment(item.tanggal).format('DD/MM/YYYY') : '-',
                    Nama: item.nama,
                    Judul: item.judul,
                    Isi: item.isi,
                    originalIsi: item.isi,
                    Toko: item.toko?.nama_toko || '-',
                    createdAt: item.createdAt,
                    ...item
                }));

                setData(transformedData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        }
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);

            const monthNumber = moment().month(selectedMonth).format('MM');
            
            let url = `/catatan/export?bulan=${monthNumber}&tahun=${selectedYear}`;
            if (selectedTokoId) {
                url += `&toko_id=${selectedTokoId}`;
            }

            const response = await api.get(url, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { 
                type: response.headers['content-type'] 
            });
            const url2 = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url2;
            link.setAttribute('download', `catatan-${monthNumber}-${selectedYear}${selectedTokoId ? `-toko-${selectedTokoId}` : ''}.xlsx`);
            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url2);
            document.body.removeChild(link);
            
            setIsExporting(false);
        } catch (error) {
            console.error('Error exporting data:', error);
            setIsExporting(false);
            alert('Failed to download export file. Please try again.');
        }
    };
  
    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear, selectedTokoId, refreshTrigger]);

    const handleTokoSelect = (tokoName) => {
        setSelectedToko(tokoName);
        if (tokoName === 'Semua') {
            setSelectedTokoId(null);
        } else {
            const selectedOption = tokoOptions.find(option => option.label === tokoName);
            if (selectedOption) {
                setSelectedTokoId(selectedOption.value);
            }
        }
    };
  
    const handleRowClick = (row) => {
        setSelectedData({
            Nama: row.nama,
            Tanggal: row.Tanggal,
            Judul: row.Judul,
            Isi: row.originalIsi,
            Toko: row.toko?.nama_toko || '-',
        });
        setShowDetailModal(true);
    };

    const headers = [
        { label: "Tanggal", key: "Tanggal", align: "text-left", width: "110px" },
        { label: "Nama", key: "Nama", align: "text-left" ,width: "500px" },
        { label: "Judul", key: "Judul", align: "text-left",width: "500px"  },
        { label: "Toko", key: "Toko", align: "text-left", width: "150px" },
        { label: "Isi", key: "Isi", align: "text-left", width: "650px" },
    ];

    const truncateText = (text, wordLimit = 9) => {
        const words = text.split(' ');
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(' ') + ' ...';
        }
        return text;
    };

    const exportIcon = (isManajer || isOwner || isFinance) ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
          <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#023F80"/>
        </svg>
      ) : (
        <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
        </svg>
      );

    return(
        <>
            <LayoutWithNav>
                <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className={`text-${themeColor} text-base font-bold`}>Riwayat Catatan</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button 
                                    label="Export" 
                                    icon={exportIcon} 
                                    bgColor="border border-secondary" 
                                    hoverColor={`hover:border-${themeColor} border`}
                                    textColor="text-black"
                                    onClick={handleExport}
                                    disabled={isExporting}
                                />
                            </div>
                            
                            {/* Toko Filter Dropdown */}
                            <div className="w-full md:w-40">
                                <ButtonDropdown
                                    options={tokoOptions}
                                    label="Semua"
                                    selectedStore={selectedToko}
                                    selectedIcon="/Icon Warna/toko_non.svg"
                                    onSelect={handleTokoSelect}
                                />
                            </div>
                            
                            <div className="w-full md:w-auto relative">
                                <div className="w-48 md:w-48">
                                    <div className="relative">
                                        <input
                                            type="month"
                                            value={`${selectedYear}-${moment().month(selectedMonth).format('MM')}`}
                                            onChange={(e) => {
                                                const date = moment(e.target.value);
                                                setSelectedMonth(date.format('MMMM'));
                                                setSelectedYear(date.format('YYYY'));
                                            }}
                                            className="w-full px-4 py-2 border border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5"
                                        />
                                    </div>
                                </div>
                            </div>
                    </div>

                
                    </section>

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="p-5">
                            <Table 
                                headers={headers} 
                                data={data.map(item => ({
                                    ...item,
                                    Isi: truncateText(item.Isi),
                                    originalIsi: item.Isi
                                }))}
                                onRowClick={handleRowClick}
                            />
                        </div>
                    </section>
                </div>

                {showDetailModal && selectedData && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start z-50 pt-20">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
                <div className="flex justify-end p-4">
                    <button 
                        onClick={() => setShowDetailModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <label className="block text-gray-500 mb-1">Nama</label>
                            <p className="text-gray-900">{selectedData.Nama}</p>
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Tanggal</label>
                            <p className="text-gray-900">{selectedData.Tanggal}</p>
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Toko</label>
                            <p className="text-gray-900">{selectedData.Toko}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-500 mb-1">Judul</label>
                        <input 
                            type="text"
                            value={selectedData.Judul}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-500 mb-1">Isi</label>
                        <div className="w-full p-3 border border-gray-300 scrollbar-hide rounded-lg bg-white text-gray-900 whitespace-pre-line min-h-[150px] overflow-auto max-h-[300px] break-words">
                          {selectedData.originalIsi || selectedData.Isi}
                      </div>
                    </div>
                </div>
            </div>
        </div>
    )}
            </LayoutWithNav>
        </>
    )
}

export default function Catatan(){
    return (
        <RefreshProvider>
            <CatatanContent />
        </RefreshProvider>
    )
}