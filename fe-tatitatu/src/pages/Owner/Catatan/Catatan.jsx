import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";
import api from "../../../utils/api";

export default function Catatan(){
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
      const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
      const [selectedData, setSelectedData] = useState(null);
      const [showDetailModal, setShowDetailModal] = useState(false);
      const [data, setData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(moment().format("MMMM"));
    const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));

      useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            const response = await api.get('/catatan');
            if (response.data.success) {

                const transformedData = response.data.data.map(item => ({
                    Tanggal: item.tanggal ? moment(item.tanggal).format('DD/MM/YYYY') : '-',
                    Nama: item.nama,
                    Judul: item.judul,
                    Isi: item.isi,
                    originalIsi: item.isi, 
                    ...item         
                }));
                setData(transformedData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

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
    
      const toggleModal = () => setIsModalOpen(!isModalOpen);
    
      const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });

        const handleRowClick = (row) => {
            setSelectedData({
                Nama: row.nama,
                Tanggal: row.Tanggal,
                Judul: row.Judul,
                Isi: row.originalIsi,
            });
            setShowDetailModal(true);
        };

    // const [data,setData] = useState([
    //     {
    //         Tanggal: '12/05/2024',
    //         Nama: 'Nadini Annisa Byant',
    //         Judul: 'Penjualan Meningkat',
    //         Isi: 'Izin melaporkan Kak, Alhamdulillah penjualan kita meningkat, coba saja dicari cara lebih meningkat lagi yaaaaa'
    //     },
    //     {
    //         Tanggal: '12/05/2024',
    //         Nama: 'Nadini Annisa Byant',
    //         Judul: 'Penjualan Meningkat',
    //         Isi: 'Izin melaporkan Kak, Alhamdulillah penjualan kita meningkat, coba saja dicari cara lebih meningkat lagi yaaaaa'
    //     },
    //     {
    //         Tanggal: '12/05/2024',
    //         Nama: 'Nadini Annisa Byant',
    //         Judul: 'Penjualan Meningkat',
    //         Isi: 'Izin melaporkan Kak, Alhamdulillah penjualan kita meningkat, coba saja dicari cara lebih meningkat lagi yaaaaa'
    //     },
    //     {
    //         Tanggal: '12/05/2024',
    //         Nama: 'Nadini Annisa Byant',
    //         Judul: 'Penjualan Meningkat',
    //         Isi: 'Izin melaporkan Kak, Alhamdulillah penjualan kita meningkat, coba saja dicari cara lebih meningkat lagi yaaaaa'
    //     }
    // ])

    const headers = [
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Judul", key: "Judul", align: "text-left" },
        { label: "Isi", key: "Isi", align: "text-left" },
    ];

    const truncateText = (text, wordLimit = 9) => {
        const words = text.split(' ');
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(' ') + ' ...';
        }
        return text;
    };


    return(
        <>
        <LayoutWithNav>
            <div className="p-5">
            <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className="text-primary text-base font-bold">Riwayat Catatan</p>
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
                    {/* <div className="w-full md:w-auto">
                        <Button 
                            label={`${formatDate(startDate)} - ${formatDate(endDate)}`} 
                            icon={<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.59961 1V4.2M11.9996 1V4.2" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14.3996 2.60004H3.19961C2.31595 2.60004 1.59961 3.31638 1.59961 4.20004V15.4C1.59961 16.2837 2.31595 17 3.19961 17H14.3996C15.2833 17 15.9996 16.2837 15.9996 15.4V4.20004C15.99961 3.31638 15.2833 2.60004 14.3996 2.60004Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M1.59961 7.39996H15.9996" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>} 
                            bgColor="border border-secondary" 
                            hoverColor="hover:bg-white" 
                            textColor="text-black" 
                            onClick={toggleModal} 
                        />
                    </div> */}
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
                            className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                            >
                            Hari Ini
                            </button>
                            <button
                            onClick={handleLast7Days}
                            className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                            >
                            7 Hari Terakhir
                            </button>
                            <button
                            onClick={handleThisMonth}
                            className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
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
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="block text-gray-500 mb-1">Nama</label>
                        <p className="text-gray-900">{selectedData.Nama}</p>
                    </div>
                    <div>
                        <label className="block text-gray-500 mb-1">Tanggal</label>
                        <p className="text-gray-900">{selectedData.Tanggal}</p>
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
                    <div className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 whitespace-pre-line min-h-[150px]">
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