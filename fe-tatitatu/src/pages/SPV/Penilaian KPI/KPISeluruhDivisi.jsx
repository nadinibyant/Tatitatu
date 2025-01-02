import React, { useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import Table from "../../../components/Table";
import { menuItems, userOptions } from "../../../data/menuSpv";
import { useNavigate } from "react-router-dom";
import MoreOptionsModal from "../../../components/MoreModal";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";

export default function KPISeluruhDivisi() {
    const [isModalMore, setIsModalMore] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [isModalSucc, setModalSucc] = useState(false)
    const [isModalDel, setModalDel] = useState(false)

    const headers = [
        { label: "No", key: "nomor", align: "text-left" },
        { label: "Divisi", key: "Divisi", align: "text-left" },
        { label: "Jumlah KPI", key: "JumlahKPI", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    const data = [
        {
            id: 1,
            Divisi: "Kasir",
            JumlahKPI: 10,
            // Aksi: (
            //     <img
            //     src="/icon/more.svg"
            //     alt="More Options"
            //     className="w-5 h-5 cursor-pointer"
            //     onClick={(event) => handleMoreClick(1, event)}
            //     />
            // ),
        },
    ];

    const handleMoreClick = (item, event) => {
        event.stopPropagation();
        setSelectedItem(item);
        setIsModalMore(true);

        const rect = event.target.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        let top = rect.bottom + window.scrollY + 5;
        let left = rect.left + window.scrollX;

        if (viewportWidth <= 768) {
            left = viewportWidth / 2;
        } else {
            // Prevent modal from going off-screen right
            if (left + 250 > viewportWidth) {
                left = rect.right - 250;
            }
            
            // If modal would go off bottom of screen, show it above the click
            if (top + 150 > window.innerHeight) {
                top = rect.top - 150;
            }
        }

        setModalPosition({ top, left });
    };

    const navigate = useNavigate()

    const handleEdit = () => {
        navigate(`/daftarPenilaianKPI/seluruh-divisi/edit/${selectedItem}`);
    };

    const handleDelete = () => {
        setIsModalMore(false);
        setModalDel(true)
    };

    const handleConfirmDel = () => {
        //logik delete berdasarkan selceteditem
        setModalSucc(true)
    }

    
    const handleAddBtn = () => {
        navigate('/daftarPenilaianKPI/seluruh-divisi/tambah')
    }

    return (
        <>
            <Navbar menuItems={menuItems} userOptions={userOptions}>
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
                                        <img
                                            src="/icon/more.svg"
                                            alt="More Options"
                                            className="w-5 h-5 cursor-pointer"
                                            onClick={(event) => handleMoreClick(item.id, event)} 
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
                            {/* Modal for More Options */}
                            {/* {isModalMore && selectedItem && (
                            <div
                            className="fixed inset-0 flex justify-center items-center z-50"
                            style={{
                                top: `${modalPosition.top}px`,
                                left: `${modalPosition.left}px`, 
                            }}
                            >
                            <div className="relative flex flex-col p-6 space-y-4 bg-white rounded-lg shadow-md max-w-lg">
                                <button
                                onClick={() => setIsModalMore(false)}
                                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                                >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                </button>

                                <button
                                    onClick={handleEdit}
                                    className="flex items-center px-4 py-2 border border-secondary text-oren rounded-md hover:bg-black hover:bg-opacity-10"
                                    >
                                    <svg
                                        width="17"
                                        height="18"
                                        viewBox="0 0 17 18"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2"  // Adds a margin to the right of the icon to space it from the text
                                    >
                                        <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z"
                                        fill="#DA5903"
                                        />
                                        <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z"
                                        fill="#DA5903"
                                        />
                                    </svg>

                                    Edit Data
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="flex items-center px-4 py-2 border border-secondary text-merah rounded-md hover:bg-black hover:bg-opacity-10"
                                    >
                                    <svg
                                        width="16"
                                        height="18"
                                        viewBox="0 0 16 18"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2" 
                                    >
                                        <path
                                        d="M10.9918 1.35785L11.2623 3.23077H14.9232C15.1068 3.23077 15.2829 3.30371 15.4128 3.43354C15.5426 3.56337 15.6155 3.73947 15.6155 3.92308C15.6155 4.10669 15.5426 4.28278 15.4128 4.41261C15.2829 4.54245 15.1068 4.61538 14.9232 4.61538H14.2134L13.4075 14.0169C13.3586 14.5892 13.3189 15.06 13.2552 15.4403C13.1906 15.8363 13.0918 16.1908 12.8989 16.5194C12.596 17.0355 12.1456 17.4492 11.6057 17.7074C11.2623 17.8708 10.9005 17.9382 10.4998 17.9695C10.1149 18 9.64323 18 9.06907 18H6.93123C6.35707 18 5.88538 18 5.50046 17.9695C5.09984 17.9382 4.738 17.8708 4.39461 17.7074C3.85469 17.4492 3.40431 17.0355 3.10138 16.5194C2.90753 16.1908 2.81061 15.8363 2.74507 15.4403C2.68138 15.0591 2.64169 14.5892 2.59277 14.0169L1.78692 4.61538H1.07707C0.893462 4.61538 0.717371 4.54245 0.587538 4.41261C0.457705 4.28278 0.384766 4.10669 0.384766 3.92308C0.384766 3.73947 0.457705 3.56337 0.587538 3.43354C0.717371 3.30371 0.893462 3.23077 1.07707 3.23077H4.738L5.00846 1.35785L5.01861 1.30154C5.18661 0.572308 5.81246 0 6.59707 0H9.40323C10.1878 0 10.8137 0.572308 10.9817 1.30154L10.9918 1.35785ZM6.13646 3.23077H9.86292L9.62661 1.59138C9.5823 1.43723 9.46969 1.38462 9.4023 1.38462H6.598C6.53061 1.38462 6.418 1.43723 6.37369 1.59138L6.13646 3.23077ZM7.30784 7.61538C7.30784 7.43177 7.2349 7.25568 7.10507 7.12585C6.97524 6.99602 6.79915 6.92308 6.61553 6.92308C6.43192 6.92308 6.25583 6.99602 6.126 7.12585C5.99617 7.25568 5.92323 7.43177 5.92323 7.61538V12.2308C5.92323 12.4144 5.99617 12.5905 6.126 12.7203C6.25583 12.8501 6.43192 12.9231 6.61553 12.9231C6.79915 12.9231 6.97524 12.8501 7.10507 12.7203C7.2349 12.5905 7.30784 12.4144 7.30784 12.2308V7.61538ZM10.0771 7.61538C10.0771 7.43177 10.0041 7.25568 9.8743 7.12585C9.74447 6.99602 9.56838 6.92308 9.38477 6.92308C9.20115 6.92308 9.02506 6.99602 8.89523 7.12585C8.7654 7.25568 8.69246 7.43177 8.69246 7.61538V12.2308C8.69246 12.4144 8.7654 12.5905 8.89523 12.7203C9.02506 12.8501 9.20115 12.9231 9.38477 12.9231C9.56838 12.9231 9.74447 12.8501 9.8743 12.7203C10.0041 12.5905 10.0771 12.4144 10.0771 12.2308V7.61538Z"
                                        fill="#C21747"
                                        />
                                    </svg>

                                    Hapus Data
                                </button>
                            </div>
                            </div>
                        )} */}
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
                    onCancel={() => setModalDel(false)}
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
            </Navbar>
        </>
    );
}
