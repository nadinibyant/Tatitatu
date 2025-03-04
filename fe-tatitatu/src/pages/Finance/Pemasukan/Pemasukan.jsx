import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import ButtonDropdown from "../../../components/ButtonDropdown";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";
import InputDropdown from "../../../components/InputDropdown";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";

export default function Pemasukan(){
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJenis, setSelectedJenis] = useState("Semua");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData'))
  const isAdminGudang = userData?.role === 'admingudang'
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance'

  const [filters, setFilters] = useState({});
  const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
  const [selectedMonth, setSelectedMonth] = useState(moment().format("MMMM"));
  const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = moment(`${selectedYear}-${moment().month(selectedMonth).format('MM')}-01`).format('YYYY-MM-DD');
        const endDate = moment(`${selectedYear}-${moment().month(selectedMonth).format('MM')}-01`).endOf('month').format('YYYY-MM-DD');
        
        const response = await api.get(`/pemasukan?startDate=${startDate}&endDate=${endDate}`);
        
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedMonth, selectedYear]); 

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

  const headers = [
    { label: "Nomor", key: "Nomor", align: "text-left" },
    { label: "Tanggal", key: "Tanggal", align: "text-left" },
    { label: "Deskripsi/Barang", key: "Deskripsi/Barang", align: "text-left" },
    { label: "Kategori", key: "Kategori", align: "text-left" },
    { label: "Cash/Non-Cash", key: "Cash/Non-Cash", align: "text-left" },
    { label: "Pemasukan", key: "Pemasukan", align: "text-left" },
  ];

  const transformedData = data.map(item => ({
    Nomor: item.pemasukan_id,
    Tanggal: moment(item.tanggal).format('DD/MM/YYYY'),
    'Deskripsi/Barang': item.deskripsi_pemasukan.map(desc => desc.deskripsi),
    Kategori: item.kategori_pemasukan,
    'Cash/Non-Cash': item.cash_or_non ? 'Cash' : 'Non-Cash',
    Pemasukan: item.total
  }));

  const filteredData = transformedData.filter(item => {
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
  

  const handleExport = async () => {
    try {
      const startDate = moment(`${selectedYear}-${moment().month(selectedMonth).format('MM')}-01`).format('YYYY-MM-DD');
      const endDate = moment(`${selectedYear}-${moment().month(selectedMonth).format('MM')}-01`).endOf('month').format('YYYY-MM-DD');
      
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', startDate);
      queryParams.append('endDate', endDate);
      
      if (selectedKategori !== "Semua") {
        queryParams.append('kategori', selectedKategori);
      }

      if (selectedJenis !== "Semua") {
        queryParams.append('cashType', selectedJenis === "Cash" ? true : false);
      }

      const response = await api.get(`/pemasukan/export?${queryParams.toString()}`, {
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'pemasukan-export.xlsx';
      
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
      
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return(
    <>
    <LayoutWithNav>
      <div className="p-5 relative">
        <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
          <div className="left w-full md:w-auto">
            <p className={`text-${themeColor} text-base font-bold`}>Daftar Pemasukan</p>
          </div>

          <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
            <div className="w-full md:w-auto">
              <Button 
                label="Export" 
                icon={exportIcon}
                bgColor={`border border-secondary hover:border-${themeColor}`}
                // hoverColor="hover:bg-white" 
                onClick={handleExport}
                textColor="text-black" 
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
            <div className="w-full md:w-auto">
              <Button 
                label="Tambah" 
                icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z" fill="white"/>
                </svg>
              } 
              bgColor={`bg-${themeColor}`} 
              textColor="text-white" 
              onClick={handleBtnAdd}
              />
            </div>
          </div>
        </section>

        <section className="mt-5 bg-white rounded-xl">
          <div className="p-5">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : (
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
            )}
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
                  ...Array.from(new Set(transformedData.map(item => item.Kategori)))
                    .map(kategori => ({ label: kategori, value: kategori }))
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
                className={`w-full bg-${themeColor} text-white py-2 px-4 rounded-lg hover:bg-opacity-90`}
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