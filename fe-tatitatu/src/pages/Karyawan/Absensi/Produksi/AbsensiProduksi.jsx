import { useState } from "react";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import Button from "../../../../components/Button";
import Table from "../../../../components/Table";
import Input from "../../../../components/Input";
import TextArea from "../../../../components/Textarea";
import { useNavigate } from "react-router-dom";

export default function AbsensiProduksi(){

    // const handleAdd = () => setShowModal(true);
    const navigate = useNavigate()
    const handleAdd = () => {
        navigate('/absensi-karyawan-produksi/tambah')
    }
    // const handleClose = () => setShowModal(false);

    // const handleSubmit = () => {
    //     console.log(formData);
    //     handleClose();
    // };

    const StatusBadge = ({ status }) => {
        return (
            <span 
                className={`px-4 py-1 rounded-md text-sm font-medium inline-block min-w-[100px] text-center
                    ${status === 'Diterima' 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-red-50 text-red-500 border border-red-200'
                    }`}
            >
                {status}
            </span>
        );
    };

    const [data, setData] = useState([
        {
            nomor: 1,
            Tanggal: '18-05-2024',
            Foto: <img src="/path/to/image.jpg" alt="Produksi" className="w-16 h-16 object-cover rounded"/>,
            'Jumlah Produksi': 19,
            'Total Menit': '20 Menit',
            Status: <StatusBadge status="Diterima" />
        },
        {
            nomor: 1,
            Tanggal: '18-05-2024',
            Foto: <img src="/path/to/image.jpg" alt="Produksi" className="w-16 h-16 object-cover rounded"/>,
            'Jumlah Produksi': 19,
            'Total Menit': '20 Menit',
            Status: <StatusBadge status="Ditolak" />
        },
        {
            nomor: 1,
            Tanggal: '18-05-2024',
            Foto: <img src="/path/to/image.jpg" alt="Produksi" className="w-16 h-16 object-cover rounded"/>,
            'Jumlah Produksi': 19,
            'Total Menit': '20 Menit',
            Status: <StatusBadge status="Diterima" />
        },
        {
            nomor: 1,
            Tanggal: '18-05-2024',
            Foto: <img src="/path/to/image.jpg" alt="Produksi" className="w-16 h-16 object-cover rounded"/>,
            'Jumlah Produksi': 19,
            'Total Menit': '20 Menit',
            Status: <StatusBadge status="Ditolak" />
        },
        {
            nomor: 1,
            Tanggal: '18-05-2024',
            Foto: <img src="/path/to/image.jpg" alt="Produksi" className="w-16 h-16 object-cover rounded"/>,
            'Jumlah Produksi': 19,
            'Total Menit': '20 Menit',
            Status: <StatusBadge status="Diterima" />
        }
    ]);

    const headers = [
        { label: "No", key: "nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left" },
        { label: "Jumlah Produksi", key: "Jumlah Produksi", align: "text-left" },
        { label: "Total Menit", key: "Total Menit", align: "text-left" },
        { label: "Status", key: "Status", align: "text-left" }
    ];

    return(
        <>
        <LayoutWithNav>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        {/* Left Section */}
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Data Absensi</p>
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
                                    onClick={handleAdd}
                                />
                            </div>
                        </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Table 
                            data={data}
                            headers={headers}
                            hasSearch={true}
                            hasPagination={true}
                        />
                    </div>
                </section>
            </div>
            
        </LayoutWithNav>
        </>
    )
}