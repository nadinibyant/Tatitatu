import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import Table from "../../../components/Table";
import { menuItems, userOptions } from "../../../data/menu";
import { useNavigate } from "react-router-dom";
import MoreOptionsModal from "../../../components/MoreModal";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";
import ActionMenu from "../../../components/ActionMenu";
import AlertError from "../../../components/AlertError";

export default function KPISeluruhDivisi() {
    const [isModalMore, setIsModalMore] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [isModalSucc, setModalSucc] = useState(false)
    const [isModalDel, setModalDel] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const [data,setData] = useState([])
    const [fullApiData, setFullApiData] = useState([])
    const [errorMessage, setErrorMessage] = useState(false)
    const [isErrorAlert, setErrorAlert] = useState(false)

    const headers = [
        { label: "No", key: "nomor", align: "text-left" },
        { label: "Divisi", key: "Divisi", align: "text-left" },
        { label: "Jumlah KPI", key: "JumlahKPI", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    // const data = [
    //     {
    //         id: 1,
    //         Divisi: "Kasir",
    //         JumlahKPI: 10,
    //         // Aksi: (
    //         //     <img
    //         //     src="/icon/more.svg"
    //         //     alt="More Options"
    //         //     className="w-5 h-5 cursor-pointer"
    //         //     onClick={(event) => handleMoreClick(1, event)}
    //         //     />
    //         // ),
    //     },
    // ];
    const fetchKPIDivisi = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kpi-divisi'); 

            const formattedData = response.data.data.map(item => ({
                id: item.divisi_karyawan_id,
                Divisi: item.nama_divisi,
                JumlahKPI: item.kpi_count,
            }));
            
            setData(formattedData);
            setFullApiData(response.data.data);
        } catch (error) {
            console.error('Error fetching KPI:', error);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchKPIDivisi();
    }, []);

    // const handleMoreClick = (item, event) => {
    //     event.stopPropagation();
    //     setSelectedItem(item);
    //     setIsModalMore(true);

    //     const rect = event.target.getBoundingClientRect();
    //     const viewportWidth = window.innerWidth;
        
    //     let top = rect.bottom + window.scrollY + 5;
    //     let left = rect.left + window.scrollX;

    //     if (viewportWidth <= 768) {
    //         left = viewportWidth / 2;
    //     } else {
    //         // Prevent modal from going off-screen right
    //         if (left + 250 > viewportWidth) {
    //             left = rect.right - 250;
    //         }
            
    //         // If modal would go off bottom of screen, show it above the click
    //         if (top + 150 > window.innerHeight) {
    //             top = rect.top - 150;
    //         }
    //     }

    //     setModalPosition({ top, left });
    // };

    const navigate = useNavigate()

    const handleEdit = (divisiId) => {
        const selectedDivisionData = fullApiData.find(
            item => item.divisi_karyawan_id === divisiId
        );
        
        navigate(`/daftarPenilaianKPI/seluruh-divisi/edit/${divisiId}`, {
            state: { 
                divisionData: selectedDivisionData 
            }
        });
    };

    const handleDelete = (itemId) => {
        const selectedDivisi = data.find(item => item.id === itemId);
        if (selectedDivisi.JumlahKPI === 0) {
            setErrorMessage("Tidak Terdapat KPI Divisi")
            setErrorAlert(true)
            return;
        }
        setModalDel(true);
    };

    const handleConfirmDel = async () => {
        try {
            setLoading(true);
            const response = await api.delete(`/kpi/${selectedItem}`);
            
            if (response.data.success) {
                setModalDel(false);
                setModalSucc(true);
                fetchKPIDivisi(); 
            }
        } catch (error) {
            console.error('Error deleting KPI:', error);
        } finally {
            setLoading(false);
        }
    };

    
    const handleAddBtn = () => {
        navigate('/daftarPenilaianKPI/seluruh-divisi/tambah')
    }

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        {/* Left Section */}
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar KPI Seluruh Divisi</p>
                        </div>

                        {/* Right Section */}
                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button
                                    label="Tambah"
                                    icon={
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 13 13"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z"
                                                fill="white"
                                            />
                                        </svg>
                                    }
                                    bgColor="bg-primary"
                                    hoverColor="hover:bg-opacity-90 hover:border hover:border-primary hover:text-white"
                                    textColor="text-white"
                                    onClick={handleAddBtn}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="p-5">
                            <Table
                                headers={headers}
                                data={data.map((item, index) => ({
                                    ...item,
                                    nomor: index + 1,
                                    Aksi: (
                                        <ActionMenu 
                                            onEdit={() => handleEdit(item.id)} 
                                            onDelete={() => {
                                                setSelectedItem(item.id);
                                                handleDelete(item.id);
                                            }}
                                        />
                                    ),
                                }))}
                            />
                            <MoreOptionsModal 
                            isOpen={isModalMore}
                            onClose={() => setIsModalMore(false)}
                            position={modalPosition}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                        </div>
                    </section>
                </div>

                {/* modal delete */}
                {isModalDel && (
                    <Alert
                    title="Hapus Data"
                    description="Apakah kamu yakin ingin menghapus data ini?"
                    confirmLabel="Hapus"
                    cancelLabel="Kembali"
                    onConfirm={handleConfirmDel}
                    open={isModalDel}
                    onCancel={() => setModalDel(false)}
                    onClose={() => setModalDel(false)}
                    />
                )}

                {/* modal success */}
                {isModalSucc&& (
                    <AlertSuccess
                    title="Berhasil!!"
                    description="Data berhasil dihapus"
                    confirmLabel="Ok"
                    onConfirm={() => setModalSucc(false)}
                    />
                )}
                
                {isLoading && (
                    <Spinner/>
                )}

                {isErrorAlert && (
                        <AlertError
                        title="Gagal!!"
                        description={errorMessage}
                        confirmLabel="Ok"
                        onConfirm={() => setErrorAlert(false)}
                        />
                    )}

            </LayoutWithNav>
        </>
    );
}
