import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../components/Navbar";
import { menuItems, userOptions } from "../../../../data/menu";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Button from "../../../../components/Button";
import Table from "../../../../components/Table";
import Alert from "../../../../components/Alert";
import AlertSuccess from "../../../../components/AlertSuccess";
import LayoutWithNav from "../../../../components/LayoutWithNav";

export default function DetailNonHandmade(){
    const { id } = useParams();
    const [isModalDel, setModalDel] = useState(false)
    const [isModalSucc, setModalSucc] = useState(false)

    const breadcrumbItems = [
        { label: "List Data Barang Non-Handmade", href: "/dataBarang/non-handmade" },
        { label: "Detail Barang", href: "" },
    ];

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama Biaya", key: "Nama Biaya", align: "text-left" },
        { label: "Jumlah Biaya", key: "Jumlah Biaya", align: "text-left" },
    ]

    const headers2 = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama Packaging", key: "Nama Packaging", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },  
        { label: "Kuantitas", key: "Kuantitas", align: "text-left" },  
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },  
    ]

    const [data,setData] = useState({
        "Nama Barang": "Gelang Matahari",
        "Nomor Barang": "BN231",
        Kategori: "Gelang",
        "Total HPP": 10000,
        "Total Keuntungan": 10000,
        "Harga Jual": 20000,
        "Jumlah Minimum Stok": 2000,
        rincian_biaya: [
            {
                id:1,
                "Nama Biaya": "Biaya Operasional dan Staff",
                "Jumlah Biaya": 24
            },
            {
                id:2,
                "Nama Biaya": "Biaya Operasional dan Staff",
                "Jumlah Biaya": 24
            },
            {
                id:3,
                "Nama Biaya": "Biaya Operasional dan Staff",
                "Jumlah Biaya": 24
            },
            {
                id:4,
                "Nama Biaya": "Biaya Operasional dan Staff",
                "Jumlah Biaya": 24
            }
        ],
        packaging: [
            {
                id:1,
                "Nama Packaging": "Zipper",
                "Harga Satuan": 20000,
                Kuantitas: 1000,
                "Total Biaya": 200000
            }
        ]
    })

    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    const handleBtnDel = () => {
        setModalDel(true)
    }

    const handleConfirmDel = () => {
        //logika
        setModalSucc(true)
    }

    const handleCancelDel = () => {
        setModalDel(false)
    }

    const handleConfirmSucc = () => {
        setModalSucc(false)
    }

    const navigate = useNavigate()
    const handleBtnEdit = () => {
        navigate(`/dataBarang/non-handmade/edit/${id}`)
    }

return(
<>
    <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
        <div className="p-5">
            <Breadcrumbs items={breadcrumbItems} />

            <section className="mt-5 bg-white rounded-xl">
                <div className="p-5">
                    <section
                        className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0 border-b pb-3">
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Gelang Matahari</p>
                        </div>

                        <div
                            className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button label="Edit" icon={<svg width="17" height="18" viewBox="0 0 17 18" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z"
                                        fill="#DA5903" />
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z"
                                        fill="#DA5903" />
                                    </svg>
                                    } bgColor="border border-oren" onClick={handleBtnEdit} hoverColor="hover:bg-gray-50" textColor="text-oren" />
                            </div>

                            <div className="w-full md:w-auto">
                                <Button label="Hapus" icon={<svg width="16" height="18" viewBox="0 0 16 18" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M10.9918 1.35785L11.2623 3.23077H14.9232C15.1068 3.23077 15.2829 3.30371 15.4128 3.43354C15.5426 3.56337 15.6155 3.73947 15.6155 3.92308C15.6155 4.10669 15.5426 4.28278 15.4128 4.41261C15.2829 4.54245 15.1068 4.61538 14.9232 4.61538H14.2134L13.4075 14.0169C13.3586 14.5892 13.3189 15.06 13.2552 15.4403C13.1906 15.8363 13.0918 16.1908 12.8989 16.5194C12.596 17.0355 12.1456 17.4492 11.6057 17.7074C11.2623 17.8708 10.9005 17.9382 10.4998 17.9695C10.1149 18 9.64323 18 9.06907 18H6.93123C6.35707 18 5.88538 18 5.50046 17.9695C5.09984 17.9382 4.738 17.8708 4.39461 17.7074C3.85469 17.4492 3.40431 17.0355 3.10138 16.5194C2.90753 16.1908 2.81061 15.8363 2.74507 15.4403C2.68138 15.0591 2.64169 14.5892 2.59277 14.0169L1.78692 4.61538H1.07707C0.893462 4.61538 0.717371 4.54245 0.587538 4.41261C0.457705 4.28278 0.384766 4.10669 0.384766 3.92308C0.384766 3.73947 0.457705 3.56337 0.587538 3.43354C0.717371 3.30371 0.893462 3.23077 1.07707 3.23077H4.738L5.00846 1.35785L5.01861 1.30154C5.18661 0.572308 5.81246 0 6.59707 0H9.40323C10.1878 0 10.8137 0.572308 10.9817 1.30154L10.9918 1.35785ZM6.13646 3.23077H9.86292L9.62661 1.59138C9.5823 1.43723 9.46969 1.38462 9.4023 1.38462H6.598C6.53061 1.38462 6.418 1.43723 6.37369 1.59138L6.13646 3.23077ZM7.30784 7.61538C7.30784 7.43177 7.2349 7.25568 7.10507 7.12585C6.97524 6.99602 6.79915 6.92308 6.61553 6.92308C6.43192 6.92308 6.25583 6.99602 6.126 7.12585C5.99617 7.25568 5.92323 7.43177 5.92323 7.61538V12.2308C5.92323 12.4144 5.99617 12.5905 6.126 12.7203C6.25583 12.8501 6.43192 12.9231 6.61553 12.9231C6.79915 12.9231 6.97524 12.8501 7.10507 12.7203C7.2349 12.5905 7.30784 12.4144 7.30784 12.2308V7.61538ZM10.0771 7.61538C10.0771 7.43177 10.0041 7.25568 9.8743 7.12585C9.74447 6.99602 9.56838 6.92308 9.38477 6.92308C9.20115 6.92308 9.02506 6.99602 8.89523 7.12585C8.7654 7.25568 8.69246 7.43177 8.69246 7.61538V12.2308C8.69246 12.4144 8.7654 12.5905 8.89523 12.7203C9.02506 12.8501 9.20115 12.9231 9.38477 12.9231C9.56838 12.9231 9.74447 12.8501 9.8743 12.7203C10.0041 12.5905 10.0771 12.4144 10.0771 12.2308V7.61538Z"
                                        fill="white" />
                                    </svg>

                                    } bgColor="bg-merah" textColor="text-white" onClick={handleBtnDel}/>
                            </div>
                        </div>
                    </section>

                    <section className="mt-5">
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-5 gap-4 border border-gray-300 rounded-lg">
                            {/* Image Section */}
                            <div className="sm:col-span-1 flex justify-center items-center">
                            <img
                                src="https://via.placeholder.com/510"
                                alt="Gelang"
                                className="w-40 h-40 sm:w-20 sm:h-20 rounded-md"
                            />
                            </div>

                            {/* Details Section */}
                            <div className="sm:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
                            {/* Nomor Barang */}
                            <div>
                                <p className="text-gray-500">Nomor Barang</p>
                                <p className="font-bold">19111</p>
                            </div>

                            {/* Kategori */}
                            <div>
                                <p className="text-gray-500">Kategori</p>
                                <p className="font-bold">Gelang</p>
                            </div>

                            {/* Total HPP */}
                            <div>
                                <p className="text-gray-500">Total HPP</p>
                                <p className="font-bold">Rp10.000</p>
                            </div>

                            {/* Total Keuntungan */}
                            <div>
                                <p className="text-gray-500">Total Keuntungan</p>
                                <p className="font-bold">Rp10.000</p>
                            </div>

                            {/* Harga Jual */}
                            <div>
                                <p className="text-gray-500">Harga Jual</p>
                                <p className="font-bold">Rp20.000</p>
                            </div>

                            {/* Jumlah Minimum Stok */}
                            <div>
                                <p className="text-gray-500">Jumlah Minimum Stok</p>
                                <p className="font-bold">17</p>
                            </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-5">
                        <p className="font-bold pb-3">Rincian Biaya</p>
                        <div className="">
                            <Table
                                headers={headers}
                                data={data.rincian_biaya.map((item, index) => ({
                                    ...item,
                                    No: index + 1,
                                    "Jumlah Biaya": `${formatNumberWithDots(item["Jumlah Biaya"])}`,
                                }))}
                            />
                        </div>
                    </section>

                    <section className="mt-5">
                        <p className="font-bold pb-3">Packaging</p>
                        <div className="">
                            <Table
                                headers={headers2}
                                data={data.packaging.map((item, index) => ({
                                    ...item,
                                    No: index + 1,
                                    Kuantitas: `${formatNumberWithDots(item["Kuantitas"])}`,
                                    "Harga Satuan": `Rp${formatNumberWithDots(item["Harga Satuan"])}`,
                                    "Total Biaya": `Rp${formatNumberWithDots(item["Total Biaya"])}`,
                                }))}
                            />
                        </div>
                    </section>

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
            onCancel={handleCancelDel}
            />
        )}

        {/* modal success */}
        {isModalSucc&& (
            <AlertSuccess
            title="Berhasil!!"
            description="Data berhasil dihapus"
            confirmLabel="Ok"
            onConfirm={handleConfirmSucc}
            />
        )}
    </LayoutWithNav>
</>
)
}