import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menuSpv";
import InputDropdown from "../../../components/InputDropdown";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Gallery2 from "../../../components/Gallery2";
import TextArea from "../../../components/Textarea";

export default function EditPembelianStok() {
    const [nomor, setNomor] = useState("");
    const [tanggal, setTanggal] = useState(null);
    const [note, setNote] = useState("");
    const [selectBayar, setSelectedBayar] = useState("");
    const [selectMetode, setSelectMetode] = useState("");
    const [diskon, setDiskon] = useState(0);
    const [pajak, setPajak] = useState(0);
    const [dataCabang, setDataCabang] = useState([
        { nama: "Cabang GOR.Haji Agus Salim", data: [
            { id: 1, name: "Gelang Barbie 123", count: 2, price: "Rp10.000", total: "Rp20.000", image: "https://via.placeholder.com/150" },
            { id: 2, name: "Anting Keren 123", count: 1, price: "Rp15.000", total: "Rp15.000", image: "https://via.placeholder.com/150" }
        ] },
        { nama: "Cabang GOR.Lubuk Begalung", data: [
            { id: 3, name: "Kalung Emas", count: 3, price: "Rp50.000", total: "Rp150.000", image: "https://via.placeholder.com/150" }
        ] },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCabang, setActiveCabang] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null); // Item yang dipilih untuk diedit
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
    const [searchTerm, setSearchTerm] = useState("");

    const dataBarang = [
        {
            jenis: "Barang Handmade",
            kategori: ["Semua", "Gelang", "Anting-Anting", "Cincin"],
            items: [
                { id: 1, image: "https://via.placeholder.com/150", code: "MMM453", name: "Gelang Barbie 123", price: "Rp10.000", kategori: "Gelang" },
                { id: 2, image: "https://via.placeholder.com/150", code: "MMM454", name: "Anting Keren 123", price: "Rp15.000", kategori: "Anting-Anting" },
                { id: 3, image: "https://via.placeholder.com/150", code: "MMM455", name: "Cincin Cantik 123", price: "Rp20.000", kategori: "Cincin" },
                { id: 4, image: "https://via.placeholder.com/150", code: "MMM456", name: "Gelang Modern", price: "Rp12.000", kategori: "Gelang" },
            ],
        },
        {
            jenis: "Barang Non-Handmade",
            kategori: ["Semua", "Kalung", "Topi", "Tas"],
            items: [
                { id: 5, image: "https://via.placeholder.com/150", code: "MMM457", name: "Kalung Emas", price: "Rp50.000", kategori: "Kalung" },
                { id: 6, image: "https://via.placeholder.com/150", code: "MMM458", name: "Topi Keren", price: "Rp30.000", kategori: "Topi" },
                { id: 7, image: "https://via.placeholder.com/150", code: "MMM459", name: "Tas Ransel", price: "Rp100.000", kategori: "Tas" },
                { id: 8, image: "https://via.placeholder.com/150", code: "MMM460", name: "Kalung Perak", price: "Rp45.000", kategori: "Kalung" },
            ],
        },
    ];

    const calculateSubtotal = () => {
        return dataCabang.reduce((acc, cabang) => {
            const totalCabang = cabang.data.reduce((cabAcc, row) => {
                const totalBiaya = parseInt(row.total.replace("Rp", "").replace(/,/g, ""), 10);
                return cabAcc + totalBiaya;
            }, 0);
            return acc + totalCabang;
        }, 0);
    };

    const calculateTotalPenjualan = (subtotal) => {
        const diskonNominal = (diskon / 100) * subtotal;
        return subtotal - diskonNominal - pajak;
    };

    const handleSelectBayar = (selectedOption) => {
        setSelectedBayar(selectedOption.label);
        if (selectedOption.id === 2) {
            setSelectMetode(dataMetode[0].label);
        } else {
            setSelectMetode(dataMetode[1].label);
        }
    };

    const handleSelectMetode = (value) => {
        setSelectMetode(value);
    };

    const breadcrumbItems = [
        { label: "Daftar Pembelian Stok", href: "/pembelianStok" },
        { label: "Edit Pembelian", href: "" },
    ];

    const dataBayar = [
        { id: 1, label: "Cash" },
        { id: 2, label: "Non-Cash" }
    ];

    const dataMetode = [
        { id: 1, label: "-" },
        { id: 2, label: "Mandiri" },
        { id: 3, label: "Bank Nagari" }
    ];

    // Handle edit and open modal with selected data
    const handleSelectItemToEdit = (item, cabangIndex) => {
        setActiveCabang(cabangIndex);
        setSelectedItem(item); // Set selected item for editing
        setIsModalOpen(true); // Open modal for editing
    };

    // Handle submit for edited item
    const handleModalSubmit = () => {
        if (activeCabang !== null && selectedItem) {
            const updatedCabang = [...dataCabang];
            const itemIndex = updatedCabang[activeCabang].data.findIndex(
                (data) => data.id === selectedItem.id
            );

            if (itemIndex !== -1) {
                // Update selected item data
                updatedCabang[activeCabang].data[itemIndex] = selectedItem;
                setDataCabang(updatedCabang); // Update dataCabang with the new item
            }
            setIsModalOpen(false); // Close the modal
            setSelectedItem(null); // Reset selectedItem state
        }
    };

    // Update selected item based on input changes
    const handleInputChange = (field, value) => {
        setSelectedItem((prevItem) => ({
            ...prevItem,
            [field]: value,
        }));
    };

    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);

    // Add a new row to a branch
    const btnAddBaris = (cabangIndex) => {
        setActiveCabang(cabangIndex);
        setIsModalOpen(true);
        setSelectedItem(null); // Start with an empty item for new row
    };

    return (
        <>
            <Navbar menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <Breadcrumbs items={breadcrumbItems} />

                    {/* Section Form Input */}
                    <section className="bg-white p-5 mt-5 rounded-xl">
                        <form action="">
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label={"Nomor*"}
                                        type={"text"}
                                        value={nomor}
                                        onChange={(e) => setNomor(e.target.value)}
                                    />
                                    <Input
                                        label={"Tanggal*"}
                                        type={"date"}
                                        value={tanggal}
                                        onChange={(e) => setTanggal(e.target.value)}
                                    />
                                    <InputDropdown
                                        label={"Cash/Non-Cash*"}
                                        options={dataBayar}
                                        value={selectBayar}
                                        onSelect={handleSelectBayar}
                                    />
                                    <div className="md:col-span-3 md:w-1/3">
                                        <InputDropdown
                                            label={"Metode Pembayaran*"}
                                            options={dataMetode}
                                            value={selectMetode}
                                            onSelect={handleSelectMetode}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section Data Per Cabang */}
                            <section className="pt-10">
                                {dataCabang.map((cabang, index) => (
                                    <div key={index} className="pt-5">
                                        <p className="font-bold">{cabang.nama}</p>
                                        <div className="pt-5">
                                            <Table
                                                headers={[
                                                    { label: "No", key: "No" },
                                                    { label: "Nama Produk", key: "name" },
                                                    { label: "Kuantitas", key: "count" },
                                                    { label: "Harga Satuan", key: "price" },
                                                    { label: "Total Biaya", key: "total" },
                                                    { label: "Aksi", key: "Aksi" },
                                                ]}
                                                data={cabang.data}
                                                renderAction={(item) => (
                                                    <button
                                                        onClick={() => handleSelectItemToEdit(item, index)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            />
                                            <Button
                                                label="Tambah Baris"
                                                icon={
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                }
                                                onClick={() => btnAddBaris(index)}
                                                bgColor="bg-primary"
                                                textColor="text-white"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </section>

                            {/* Section Total dan Submit */}
                            <section className="flex flex-col md:flex-row gap-8 p-4">
                                <div className="w-full md:w-2/4">
                                    <TextArea
                                        label="Catatan*"
                                        placeholder="Masukkan Catatan Di Sini"
                                        required={true}
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>

                                <div className="w-full md:w-2/4">
                                    <div className="space-y-4 text-sm p-4">
                                        <div className="flex justify-between border-b pb-2">
                                            <p className="font-bold">Subtotal</p>
                                            <p className="font-bold">Rp{subtotal.toLocaleString()}</p>
                                        </div>

                                        <div className="flex justify-between items-center border-b pb-2">
                                            <p className="font-bold">Diskon Keseluruhan (%)</p>
                                            <div className="w-30">
                                                <Input
                                                    type="number"
                                                    value={diskon}
                                                    onChange={(e) => setDiskon(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center border-b pb-2">
                                            <p className="font-bold">Pajak</p>
                                            <div className="w-30">
                                                <Input
                                                    type="number"
                                                    value={pajak}
                                                    onChange={(e) => setPajak(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between border-b pb-2">
                                            <p className="font-bold">Total Penjualan</p>
                                            <p className="font-bold">Rp{totalPenjualan.toLocaleString()}</p>
                                        </div>

                                        <div>
                                            <Button
                                                label="Simpan"
                                                bgColor="bg-primary w-full"
                                                hoverColor="hover:bg-white hover:border-primary hover:text-black hover:border"
                                                textColor="text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </form>
                    </section>
                </div>
            </Navbar>

            {/* Modal Edit */}
            {isModalOpen && selectedItem && (
                <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                    <div className="bg-white border border-primary rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden">
                        <div className="flex flex-col">
                            <Input
                                label="Nama Produk"
                                type="text"
                                value={selectedItem.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                            <Input
                                label="Kuantitas"
                                type="number"
                                value={selectedItem.count}
                                onChange={(e) => handleInputChange("count", e.target.value)}
                            />
                            <Button
                                label="Simpan"
                                bgColor="bg-primary"
                                textColor="text-white"
                                onClick={handleModalSubmit}
                            />
                            <Button
                                label="Batal"
                                bgColor="border-secondary"
                                textColor="text-black"
                                onClick={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
