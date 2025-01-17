import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import Table from "../../../components/Table";
import { menuItems, userOptions } from "../../../data/menu";
import LayoutWithNav from "../../../components/LayoutWithNav";
import ButtonDropdown from "../../../components/ButtonDropdown";
import InputDropdown from "../../../components/InputDropdown";

export default function AkunKaryawan() {
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const modalRef = useRef(null);
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const detailModalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (detailModalRef.current && !event.target.closest('.modal-content')) {
            setShowDetailModal(false);
          }
        };
    
        if (showDetailModal) {
          document.addEventListener('mousedown', handleClickOutside);
        }
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [showDetailModal]);

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

    const navigate = useNavigate();

    const handleMoreClick = (id, event) => {
        // Prevent event bubbling
        event.stopPropagation();

        // Get button position
        const rect = event.currentTarget.getBoundingClientRect();
        
        // Calculate modal position
        const modalTop = rect.bottom + window.scrollY;
        const modalLeft = rect.left + window.scrollX - 100; // Offset to align with button

        setModalPosition({ top: modalTop, left: modalLeft });
        setSelectedId(id);
        setShowModal(true);
    };

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEdit = (id) => {
        navigate(`/akunKaryawan/edit/${id}`);
        setShowModal(false);
    };

    const handleDelete = (id) => {
        console.log('Deleting account with id:', id);
        // Add your delete logic here
        setShowModal(false);
    };

    const headers = [
        { label: "No", key: "nomor", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Divisi", key: "Divisi", align: "text-left" },
        { label: "No.Handphone", key: "No.Handphone", align: "text-left" },
        { label: "Email", key: "Email", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    const data = [
        {
            id: 1,
            Nama: 'Hamzah Abdillah Arif',
            Divisi: 'Content Creator',
            "No.Handphone": "083380220292",
            Email: 'hamzah123@gmail.com',
            password: '123456789',
            foto: '/path/to/profile.jpg',
            "Jumlah Gaji Pokok": "Rp1.500.000",
            Bonus: "Rp500.000",
            "Waktu Kerja": "11.000 Menit",
            Aksi: (
                <img
                    src="/icon/more.svg"
                    alt="More Options"
                    className="w-5 h-5 cursor-pointer"
                    onClick={(event) => handleMoreClick(1, event)}
                />
            ),
        },
        {
            id: 2,
            Nama: 'John Doe',
            Divisi: 'Designer',
            "No.Handphone": "081234567890",
            Email: 'john@example.com',
            password: 'password123',
            foto: '/path/to/profile2.jpg',
            "Jumlah Gaji Pokok": "Rp2.000.000",
            Bonus: "Rp800.000",
            "Waktu Kerja": "12.000 Menit",
            Aksi: (
                <img
                    src="/icon/more.svg"
                    alt="More Options"
                    className="w-5 h-5 cursor-pointer"
                    onClick={(event) => handleMoreClick(2, event)}
                />
            ),
        },
    ];

    const handleDetail = (row) => {
        const employeeData = data.find(item => item.id === row.id);
        if (employeeData) {
            setSelectedEmployee(employeeData);
            setShowDetailModal(true);
        }
    };

    const handleBtnAdd = () => {
        navigate('/akunKaryawan/tambah')
    }

    const filterFields = [
        {
            label: "Divisi",
            key: "Divisi",
            options: [
                { label: "Semua", value: "Semua" },
                { label: "SPV", value: "SPV" },
                { label: "Content Creator", value: "Content Creator" },
                { label: "Produksi", value: "Produksi" },
                { label: "Transportasi", value: "Transportasi" },
                { label: "Admin", value: "Admin" },
            ]
        }
    ];

    const filteredData = () => {
        let dataToDisplay = [...data];
    
        if (selectedKategori !== "Semua") {
            dataToDisplay = dataToDisplay.filter(item => item.Divisi === selectedKategori);
        }
    
        return dataToDisplay;
    };

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        {/* Left Section */}
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar Akun Karyawan</p>
                        </div>

                        {/* Right Section */}
                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button
                                    label="Export"
                                    icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z"
                                            fill="#7B0C42" />
                                    </svg>}
                                    bgColor="border border-secondary"
                                    hoverColor="hover:bg-white"
                                    textColor="text-black"
                                />
                            </div>

                            <div className="w-full md:w-auto">
                                <Button
                                    label="Tambah"
                                    icon={<svg width="16" height="16" viewBox="0 0 13 13" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z"
                                            fill="white" />
                                    </svg>}
                                    bgColor="bg-primary"
                                    hoverColor="hover:bg-opacity-90 hover:border hover:border-primary hover:text-white"
                                    textColor="text-white"
                                    onClick={handleBtnAdd}
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
                                }))}
                                onRowClick={handleDetail}
                                hasFilter={true}
                                onFilterClick={handleFilterClick}
                            />
                        </div>
                    </section>
                </div>
            </LayoutWithNav>

            {/* Modal */}
            {showModal && (
                <div
                    ref={modalRef}
                    className="absolute bg-white rounded-lg shadow-lg py-2 w-52"
                    style={{
                        top: modalPosition.top,
                        left: modalPosition.left,
                        zIndex: 1000
                    }}
                >
                    <button
                        className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => handleEdit(selectedId)}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 14.375V17.5H5.625L14.8417 8.28334L11.7167 5.15834L2.5 14.375ZM17.2583 5.86667C17.5833 5.54167 17.5833 5.01667 17.2583 4.69167L15.3083 2.74167C14.9833 2.41667 14.4583 2.41667 14.1333 2.74167L12.6083 4.26667L15.7333 7.39167L17.2583 5.86667Z" fill="#F97316"/>
                        </svg>
                        Edit Data
                    </button>
                    <button
                        className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => handleDelete(selectedId)}
                    >
                        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.75 1.875H2.25C1.62868 1.875 1.125 2.37868 1.125 3V3.75C1.125 4.37132 1.62868 4.875 2.25 4.875H15.75C16.3713 4.875 16.875 4.37132 16.875 3.75V3C16.875 2.37868 16.3713 1.875 15.75 1.875Z" fill="#DC2626"/>
                            <path d="M2.61724 6H15.3828L14.7265 16.9453C14.6503 18.0844 13.7099 18.975 12.5671 18.975H5.43296C4.29022 18.975 3.34979 18.0844 3.27357 16.9453L2.61724 6Z" fill="#DC2626"/>
                            <path d="M6.375 9.375C6.375 9.16789 6.54289 9 6.75 9H7.125C7.33211 9 7.5 9.16789 7.5 9.375V15.375C7.5 15.5821 7.33211 15.75 7.125 15.75H6.75C6.54289 15.75 6.375 15.5821 6.375 15.375V9.375Z" fill="white"/>
                            <path d="M10.5 9.375C10.5 9.16789 10.6679 9 10.875 9H11.25C11.4571 9 11.625 9.16789 11.625 9.375V15.375C11.625 15.5821 11.4571 15.75 11.25 15.75H10.875C10.6679 15.75 10.5 15.5821 10.5 15.375V9.375Z" fill="white"/>
                        </svg>
                        Hapus Data
                    </button>
                </div>
            )}

            {/* Detail Modal */}
                {showDetailModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" ref={detailModalRef}>
                        <div className="modal-content bg-white rounded-lg w-full max-w-2xl mx-4 overflow-hidden">
                        {/* Header dengan nama karyawan */}
                        <div className="p-4 flex justify-between items-center border-b">
                            <h2 className="text-lg font-semibold">{selectedEmployee?.Nama}</h2>
                            <div className="flex gap-2">
                            <Button
                                label={'Edit'}  
                                icon={
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 14.375V17.5H5.625L14.8417 8.28334L11.7167 5.15834L2.5 14.375ZM17.2583 5.86667C17.5833 5.54167 17.5833 5.01667 17.2583 4.69167L15.3083 2.74167C14.9833 2.41667 14.4583 2.41667 14.1333 2.74167L12.6083 4.26667L15.7333 7.39167L17.2583 5.86667Z" fill="#F97316"/>
                                </svg>
                                } 
                                onClick={() => handleEdit(selectedEmployee?.id)}      
                                bgColor="border-oren border"   
                                textColor="text-oren"                    
                            />
                            <Button
                                label={'Hapus'}
                                icon={
                                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.75 1.875H2.25C1.62868 1.875 1.125 2.37868 1.125 3V3.75C1.125 4.37132 1.62868 4.875 2.25 4.875H15.75C16.3713 4.875 16.875 4.37132 16.875 3.75V3C16.875 2.37868 16.3713 1.875 15.75 1.875Z" fill="white"/>
                                    <path d="M2.61724 6H15.3828L14.7265 16.9453C14.6503 18.0844 13.7099 18.975 12.5671 18.975H5.43296C4.29022 18.975 3.34979 18.0844 3.27357 16.9453L2.61724 6Z" fill="white"/>
                                    <path d="M6.375 9.375C6.375 9.16789 6.54289 9 6.75 9H7.125C7.33211 9 7.5 9.16789 7.5 9.375V15.375C7.5 15.5821 7.33211 15.75 7.125 15.75H6.75C6.54289 15.75 6.375 15.5821 6.375 15.375V9.375Z" fill="red"/>
                                    <path d="M10.5 9.375C10.5 9.16789 10.6679 9 10.875 9H11.25C11.4571 9 11.625 9.16789 11.625 9.375V15.375C11.625 15.5821 11.4571 15.75 11.25 15.75H10.875C10.6679 15.75 10.5 15.5821 10.5 15.375V9.375Z" fill="red"/>
                                </svg>
                                }
                                bgColor="bg-merah"
                                onClick={() => handleDelete(selectedEmployee?.id)}
                                textColor="text-white"
                            /> 
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Profile Image Column */}
                            <div className="flex justify-center items-start">
                                <img
                                src={selectedEmployee?.foto || "/default-profile.jpg"}
                                alt={selectedEmployee?.Nama}
                                className="w-32 h-32 object-cover rounded-lg"
                                />
                            </div>

                            {/* Details Columns */}
                            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                <p className="text-gray-500">Email</p>
                                <p className="font-medium">{selectedEmployee?.Email}</p>
                                </div>
                                <div>
                                <p className="text-gray-500">Password</p>
                                <p className="font-medium">{selectedEmployee?.password}</p>
                                </div>
                                <div>
                                <p className="text-gray-500">Divisi</p>
                                <p className="font-medium">{selectedEmployee?.Divisi}</p>
                                </div>
                                <div>
                                <p className="text-gray-500">Jumlah Gaji Pokok</p>
                                <p className="font-medium">{selectedEmployee?.["Jumlah Gaji Pokok"]}</p>
                                </div>
                                <div>
                                <p className="text-gray-500">Bonus</p>
                                <p className="font-medium">{selectedEmployee?.Bonus}</p>
                                </div>
                                <div>
                                <p className="text-gray-500">Waktu Kerja Sebulan</p>
                                <p className="font-medium">{selectedEmployee?.["Waktu Kerja"]}</p>
                                </div>
                                <div>
                                <p className="text-gray-500">Nomor Handphone</p>
                                <p className="font-medium">{selectedEmployee?.["No.Handphone"]}</p>
                                </div>
                            </div>
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
                                            value={selectedKategori}
                                            onSelect={(value) => setSelectedKategori(value.value)}
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
                    {/* Filter Modal */}
                    {/* {isFilterModalOpen && (
                        <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                            <div className="relative flex flex-col items-start p-6 space-y-4 border w-full bg-white rounded-lg shadow-md max-w-lg">
                                <button
                                    onClick={() => setIsFilterModalOpen(false)}
                                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <h2 className="text-lg font-bold mb-4">Filter</h2>
                                <form className="w-full" onSubmit={(e) => { e.preventDefault(); handleApplyFilter(); }}>
                                    {filterFields.map((field, index) => (
                                        <div className="mb-4" key={index}>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                {field.label}
                                            </label>
                                            <ButtonDropdown
                                                options={field.options}
                                                selectedStore={selectedKategori}
                                                onSelect={(value) => setSelectedKategori(value)}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        className="py-2 px-4 w-full bg-primary text-white rounded-md hover:bg-white hover:border hover:border-primary hover:text-black focus:outline-none"
                                    >
                                        Terapkan
                                    </button>
                                </form>
                            </div>
                        </div>
                    )} */}
        </>
    );
}