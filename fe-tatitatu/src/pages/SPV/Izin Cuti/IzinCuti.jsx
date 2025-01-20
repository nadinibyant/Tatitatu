import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import ButtonDropdown from "../../../components/ButtonDropdown";
import { X } from "lucide-react";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";
import LayoutWithNav from "../../../components/LayoutWithNav";
import InputDropdown from "../../../components/InputDropdown";
import api from "../../../utils/api";

export default function IzinCuti() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isModalDetail, setModalDetail] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const [selectedDivisi, setSelectedDivisi] = useState("Semua");
    const [isLoading, setLoading] = useState(false)
    const [divisions, setDivisions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));

    const monthValue = `${selectedYear}-${selectedMonth}`;


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


    const handleStatusUpdate = (id, newStatus) => {
        setData(prevData => 
            prevData.map(item => 
                item.id === id ? { ...item, status: newStatus } : item
            )
        );
    };

    const StatusBadge = ({ status }) => {
        if (!status) return null;

        const badgeClasses = status === "Diterima"
            ? "bg-green-100 text-green-800 rounded-md px-4 py-1.5 text-sm w-full text-center block"
            : "bg-red-100 text-red-800 rounded-md px-4 py-1.5 text-sm w-full text-center block";

        return (
            <div className="w-full min-w-[120px]">
                <span className={badgeClasses}>
                    {status}
                </span>
            </div>
        );
    };

// Add new state variables
const [isAcceptAlert, setIsAcceptAlert] = useState(false);
const [isRejectAlert, setIsRejectAlert] = useState(false);
const [tempAction, setTempAction] = useState({ id: null, status: null });
const [isSuccessAlert, setIsSuccessAlert] = useState(false);

const handleAcceptClick = (id, e) => {
    e.stopPropagation();
    setTempAction({ id, status: "Diterima" });
    setIsAcceptAlert(true);
};

const handleRejectClick = (id, e) => {
    e.stopPropagation();
    setTempAction({ id, status: "Ditolak" });
    setIsRejectAlert(true);
};



const handleConfirmAction = async () => {
    handleStatusUpdate(tempAction.id, tempAction.status);
    
    try {
        setLoading(true)
        const response = await api.put(`/cuti-karyawan/${tempAction.id}`, {
            status: tempAction.status
        })
        if(response.data.success){
            setIsAcceptAlert(false);
            setIsRejectAlert(false);
            setIsSuccessAlert(true);
        }
    } catch (error) {
        console.error('Kesalahan Server', error)
    } finally {
        setLoading(false)
    }
};

const ActionButtons = ({ id, status }) => {
    if (status) {
        return <StatusBadge status={status} />;
    }

    return (
        <div className="flex justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
                label="Diterima"
                onClick={(e) => handleAcceptClick(id, e)}
                bgColor="bg-hijau"
                textColor="text-white"
            />
            <Button
                label="Ditolak"
                onClick={(e) => handleRejectClick(id, e)}
                bgColor="bg-merah"
                textColor="text-white"
            />
        </div>
    );
};


    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Divisi", key: "Divisi", align: "text-left" },
        { label: "Rentang Waktu", key: "Rentang Waktu", align: "text-left" },
        { label: "Jumlah Hari", key: "Jumlah Hari", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-center" },
    ];

    const [data, setData] = useState([
        // {
        //     id: 1,
        //     Nama: "Hamzah Abdillah Arif",
        //     Divisi: "Content Creator",
        //     "Rentang Waktu": "11/05/2024 - 15/05/2024",
        //     "Jumlah Hari": "4 Hari",
        //     status: null,
        //     alasan: "Maaf bu saya izin cuti ya saya muntah muntah"
        // },
        // {
        //     id: 2,
        //     Nama: "Hamzah Abdillah Arif",
        //     Divisi: "Content Creator",
        //     "Rentang Waktu": "11/05/2024 - 15/05/2024",
        //     "Jumlah Hari": "4 Hari",
        //     status: "Diterima",
        //     alasan: "Sakit demam tinggi"
        // },
        // {
        //     id: 3,
        //     Nama: "Hamzah Abdillah Arif",
        //     Divisi: "Content Creator",
        //     "Rentang Waktu": "11/05/2024 - 15/05/2024",
        //     "Jumlah Hari": "4 Hari",
        //     status: "Ditolak",
        //     alasan: "Ada acara keluarga"
        // }
    ]);

    const fetchCutiKaryawan = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/cuti-karyawan/${selectedMonth}/${selectedYear}`); 
            
            const formattedData = response.data.data.flatMap(karyawan => 
                karyawan.cuti_karyawan.map(cuti => ({
                    id: cuti.cuti_karyawan_id,
                    Nama: karyawan.nama_karyawan,
                    Divisi: karyawan.divisi.nama_divisi,
                    "Rentang Waktu": `${moment(cuti.tanggal_mulai).format('DD/MM/YYYY')} - ${moment(cuti.tanggal_selesai).format('DD/MM/YYYY')}`,
                    "Jumlah Hari": `${cuti.jumlah_cuti} Hari`,
                    status: cuti.status,
                    alasan: cuti.alasan
                }))
            );
            
            setData(formattedData);
        } catch (error) {
            console.error('Error fetching cuti karyawan:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCutiKaryawan();
    }, [selectedMonth, selectedYear]);  
    
    const [filterFields, setFilterFields] = useState([]);

    const fetchDivisi = async () => {
        try {
            setLoading(true)
            const response = await api.get('/divisi-karyawan')
            const divisiList = [
                { label: "Semua", value: "Semua" },
                ...response.data.data.map(div => ({
                    label: div.nama_divisi,
                    value: div.nama_divisi
                }))
            ];
            setDivisions(divisiList);
            setFilterFields([
                {
                    label: "Divisi",
                    key: "Divisi",
                    options: divisiList
                }
            ]);
        } catch (error) {
            console.error('Error fetching divisi:', error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDivisi()
    }, []);

    const filteredData = () => {
        let filteredItems = [...data];

        if (selectedDivisi !== "Semua") {
            filteredItems = filteredItems.filter(item => item.Divisi === selectedDivisi);
        }

        return filteredItems;
    };

    const handleRowClick = (row) => {
        setSelectedRow(row);
        setModalDetail(true);
    };
    
    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar Pengajuan Cuti/Izin</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
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
                                    Aksi: <ActionButtons id={item.id} status={item.status} />
                                }))}
                                hasFilter={true}
                                onFilterClick={handleFilterClick}
                                onRowClick={handleRowClick}
                            />
                        </div>
                    </section>
                </div>

                {/* Detail Modal */}
                {isModalDetail && selectedRow && (
                    <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
                      {/* Close Button */}
                      <button className="absolute right-4 top-4">
                        <X className="w-6 h-6 text-gray-400" onClick={() => setModalDetail(false)}/>
                      </button>
              
                      {/* Form Content */}
                      <div className="space-y-6">
                        {/* Grid for Name, Division, and Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Name Section */}
                          <div>
                            <label className="block text-gray-500 text-sm mb-1">Nama</label>
                            <div className="font-medium">{selectedRow.Nama}</div>
                          </div>
              
                          {/* Division Section */}
                          <div>
                            <label className="block text-gray-500 text-sm mb-1">Divisi</label>
                            <div className="font-medium">{selectedRow.Divisi}</div>
                          </div>
              
                          {/* Date Range Section */}
                          <div>
                            <label className="block text-gray-500 text-sm mb-1">Rentang Waktu</label>
                            <div className="font-medium">{selectedRow["Rentang Waktu"]}</div>
                          </div>
                        </div>
              
                        {/* Number of Days */}
                        <div>
                          <label className="block text-gray-500 text-sm mb-1">Jumlah Hari</label>
                          <div className="font-medium">4{selectedRow["jumlah Hari"]}</div>
                        </div>
              
                        {/* Reason Section */}
                        <div>
                          <label className="block text-gray-500 text-sm mb-1">
                            Alasan<span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <textarea 
                              className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] resize-none"
                              defaultValue={selectedRow.alasan}
                              readOnly
                            />
                          </div>
                        </div>
              
                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-6 pt-4">
                            <button 
                            className="px-8 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRejectClick(selectedRow.id, e);
                                setModalDetail(false);
                            }}
                            >
                            Tolak
                            </button>
                            <button 
                            className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptClick(selectedRow.id, e);
                                setModalDetail(false);
                            }}
                            >
                            Terima
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                                        value={selectedDivisi}
                                        onSelect={(value) => setSelectedDivisi(value.value)}
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

                {isAcceptAlert && (
                    <Alert
                        title="Konfirmasi Terima"
                        description="Apakah kamu yakin ingin menerima pengajuan ini?"
                        confirmLabel="Terima"
                        cancelLabel="Kembali"
                        onConfirm={handleConfirmAction}
                        onCancel={() => setIsAcceptAlert(false)}
                        open={isAcceptAlert}
                        onClose={() => setIsAcceptAlert(false)}
                    />
                )}

                {isRejectAlert && (
                    <Alert
                        title="Konfirmasi Tolak"
                        description="Apakah kamu yakin ingin menolak pengajuan ini?"
                        confirmLabel="Tolak"
                        cancelLabel="Kembali"
                        onConfirm={handleConfirmAction}
                        onCancel={() => setIsRejectAlert(false)}
                        open={isRejectAlert}
                        onClose={() => setIsRejectAlert(false)}
                    />
                )}

                {isSuccessAlert && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Status pengajuan berhasil diupdate"
                        confirmLabel="Ok"
                        onConfirm={() => setIsSuccessAlert(false)}
                    />
                )}
            </LayoutWithNav>
        </>
    );
}