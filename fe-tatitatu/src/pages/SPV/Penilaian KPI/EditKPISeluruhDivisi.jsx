import { useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";

export default function EditKPISeluruhDivisi() {
    const breadcrumbItems = [
        { label: "Daftar KPI Seluruh Divisi", href: "/daftarPenilaianKPI/seluruh-divisi" },
        { label: "Edit KPI", href: "" },
    ];

    const [data, setData] = useState({
        divisi: "Kasir",
        data: [
            { Nomor: 1, NamaKPI: "Peningkatan Penjualan", Persentase: "20", Waktu: "Bulanan" },
            { Nomor: 2, NamaKPI: "Kepuasan Pelanggan", Persentase: "30", Waktu: "Harian" },
            { Nomor: 3, NamaKPI: "Efisiensi Operasional", Persentase: "50", Waktu: "Tahunan" },
        ],
    });

    const dataDivisi = [
        { id: 1, label: "Kasir" },
        { id: 2, label: "Non-Kasir" },
    ];

    const headers = [
        { label: "No", key: "Nomor", align: "text-left" },
        { label: "Nama KPI", key: "NamaKPI", align: "text-left" },
        { label: "Persentase", key: "Persentase", align: "text-left", width: '110px' },
        { label: "Waktu", key: "Waktu", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    const dataWaktu = [
        { id: 1, label: "Bulanan" },
        { id: 2, label: "Harian" },
        { id: 3, label: "Tahunan" },
    ];

    const handleDivisiChange = (value) => {
        setData((prevState) => ({ ...prevState, divisi: value }));
    };

    const handleAddRow = () => {
        const newRow = {
            Nomor: data.data.length + 1,
            NamaKPI: "",
            Persentase: "",
            Waktu: "",
        };

        setData((prevState) => ({ ...prevState, data: [...prevState.data, newRow] }));
    };

    const handleInputChange = (rowIndex, key, value) => {
        const updatedData = data.data.map((row, index) =>
            index === rowIndex ? { ...row, [key]: value } : row
        );
        setData((prevState) => ({ ...prevState, data: updatedData }));
    };

    const handleDeleteRow = (rowIndex) => {
        const updatedData = data.data.filter((_, index) => index !== rowIndex);
        setData((prevState) => ({ ...prevState, data: updatedData }));
    };

    return (
        <>
            <Navbar menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <Breadcrumbs items={breadcrumbItems} />

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="p-5">
                            <form action="">
                                <div className="sm:w-1/3">
                                    <label className="p-2">
                                        Divisi <span className="text-merah">*</span>
                                    </label>
                                    <div className="pt-3">
                                        <ButtonDropdown 
                                            label={data.divisi || "Masukan Divisi"} 
                                            options={dataDivisi} 
                                            onSelect={handleDivisiChange} 
                                        />
                                    </div>
                                </div>

                                <div className="px-2 pt-5">
                                    <p className="font-bold py-5">Rincian KPI</p>
                                    <Table
                                        headers={headers}
                                        data={data.data.map((row, index) => ({
                                            Nomor: row.Nomor,
                                            NamaKPI: (
                                                <Input
                                                showRequired={false}
                                                    type1="text"
                                                    value={row.NamaKPI}
                                                    onChange={(value) => handleInputChange(index, "NamaKPI", value)}
                                                />
                                            ),
                                            Persentase: (
                                                <Input
                                                showRequired={false}
                                                    type="number"
                                                    value={row.Persentase}
                                                    onChange={(value) => handleInputChange(index, "Persentase", value)}
                                                />
                                            ),
                                            Waktu: (
                                                <ButtonDropdown
                                                    options={dataWaktu}
                                                    label={row.Waktu || "Pilih Waktu"}
                                                    onSelect={(value) => handleInputChange(index, "Waktu", value)}
                                                />
                                            ),
                                            Aksi: (
                                                <button
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDeleteRow(index);
                                                    }}
                                                >
                                                    Hapus
                                                </button>
                                            ),
                                        }))}
                                    />
                                    <Button
                                        label="Tambah Baris"
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                        }
                                        bgColor=""
                                        hoverColor="hover:border-primary hover:border"
                                        textColor="text-primary"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleAddRow();
                                        }}
                                    />
                                </div>

                                <div className="pt-5 flex justify-end space-x-4">
                                    <Button 
                                        label={"Batal"} 
                                        bgColor="bg-none border border-black" 
                                        textColor="text-black" 
                                        type="button" 
                                        hoverColor="hover:bg-primary hover:text-white" 
                                    />
                                    <Button 
                                        label={"Simpan"} 
                                        bgColor="bg-primary" 
                                        textColor="text-white" 
                                        type="submit" 
                                        hoverColor="hover:bg-white hover:border hover:border-primary hover:text-black" 
                                    />
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </Navbar>
        </>
    );
}
