import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import ButtonDropdown from "../../../components/ButtonDropdown";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";
import InputDropdown from "../../../components/InputDropdown";
import { useNavigate } from "react-router-dom";

export default function Pemasukan(){
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedJenis, setSelectedJenis] = useState("Semua");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
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

    const [data, setData] = useState([
        {
            Nomor: 'INC1234',
            Tanggal: '12/05/2024',
            'Deskripsi/Barang': ['Hibah PT Karya, Dana Kak Syifa', 'Dana Hamzah', 'Uang Sedekah'],
            Kategori: 'Hibah',
            'Cash/Non-Cash': 'Cash',
            Pemasukan: 1000000
        },
        {
            Nomor: 'INC1234',
            Tanggal: '12/05/2024',
            'Deskripsi/Barang': ['Hibah PT Karya, Dana Kak Syifa', 'Dana Hamzah', 'Uang Sedekah'],
            Kategori: 'Sedekah',
            'Cash/Non-Cash': 'Cash',
            Pemasukan: 1000000
        },
        {
            Nomor: 'INC1234',
            Tanggal: '12/05/2024',
            'Deskripsi/Barang': ['Hibah PT Karya, Dana Kak Syifa', 'Dana Hamzah', 'Uang Sedekah', 'Uang Dini'],
            Kategori: 'Hibah',
            'Cash/Non-Cash': 'Cash',
            Pemasukan: 1000000
        },
        {
            Nomor: 'INC1234',
            Tanggal: '12/05/2024',
            'Deskripsi/Barang': ['Hibah PT Karya, Dana Kak Syifa', 'Dana Hamzah', 'Uang Sedekah'],
            Kategori: 'Zakat',
            'Cash/Non-Cash': 'Non-Cash',
            Pemasukan: 1000000
        }
    ])
    
    const headers = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Deskripsi/Barang", key: "Deskripsi/Barang", align: "text-left" },
        { label: "Kategori", key: "Kategori", align: "text-left" },
        { label: "Cash/Non-Cash", key: "Cash/Non-Cash", align: "text-left" },
        { label: "Pemasukan", key: "Pemasukan", align: "text-left" },
    ];

    const filteredData = data.filter(item => {
        const matchesKategori = selectedKategori === "Semua" || item.Kategori === selectedKategori;
        const matchesCashType = selectedJenis === "Semua" || item["Cash/Non-Cash"] === selectedJenis;
        return matchesKategori && matchesCashType;
    });

    const navigate = useNavigate()
    const handleBtnAdd = () => {
        navigate('/pemasukan/tambah')
    }

    const handleRowClick = (row) => {
        navigate('/pemasukan/detail', {state: {nomor: row.Nomor}})
    }


    return(
        <>
        <LayoutWithNav>
            <div className="p-5 relative">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                    <p className="text-primary text-base font-bold">Daftar Pemasukan</p>
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
                    <div className="w-full md:w-auto">
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
                    </div>
                    <div className="w-full md:w-auto">
                        <Button 
                            label="Tambah" 
                            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z" fill="white"/>
                                </svg>
                                } 
                            bgColor="bg-primary" 
                            textColor="text-white" 
                            onClick={handleBtnAdd}
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
                            data={filteredData.map((item, index) => ({
                                ...item,
                                "Deskripsi/Barang": Array.isArray(item["Deskripsi/Barang"]) 
                                    ? item["Deskripsi/Barang"].length > 2 
                                        ? <span>
                                            {item["Deskripsi/Barang"].slice(0, 2).join(", ")}
                                            <span className="text-gray-400"> +{item["Deskripsi/Barang"].length - 2} Lainnya</span>
                                        </span>
                                        : item["Deskripsi/Barang"].join(", ")
                                    : item["Deskripsi/Barang"],
                                Pemasukan: `Rp${item.Pemasukan.toLocaleString('id-ID')}`
                            }))}
                            hasFilter={true}
                            onFilterClick={handleFilterClick}
                            onRowClick={handleRowClick}
                        />
                    </div>
                </section>
            </div>

            {/* Filter Modal */}
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
                <InputDropdown
                  label="Kategori"
                  options={[
                    { label: "Semua", value: "Semua" },
                    { label: "Hibah", value: "Hibah" },
                    { label: "Sedekah", value: "Sedekah" },
                    { label: "Zakat", value: "Zakat" }
                  ]}
                  value={selectedKategori}
                  onSelect={(value) => setSelectedKategori(value.value)}
                  required={true}
                />
                <InputDropdown
                  label="Cash/Non-Cash"
                  options={[
                    { label: "Semua", value: "Semua" },
                    { label: "Cash", value: "Cash" },
                    { label: "Non-Cash", value: "Non-Cash" }
                  ]}
                  value={selectedJenis}
                  onSelect={(value) => setSelectedJenis(value.value)}
                  required={true}
                />
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
    )
}