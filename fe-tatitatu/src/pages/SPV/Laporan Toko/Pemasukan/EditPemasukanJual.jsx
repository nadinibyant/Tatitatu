import { useState, useEffect, useMemo } from "react";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Navbar from "../../../../components/Navbar";
import { menuItems, userOptions } from "../../../../data/menuSpv";
import Input from "../../../../components/Input";
import InputDropdown from "../../../../components/InputDropdown";
import Table from "../../../../components/Table";

// Constants
const PAYMENT_METHODS = {
  CASH: 1,
  NON_CASH: 2
};

const BANK_OPTIONS = {
  NONE: 1,
  MANDIRI: 2,
  BANK_NAGARI: 3
};

export default function EditPemasukanJual() {
    // Data constants
    const dataMetode = [
        { id: BANK_OPTIONS.NONE, label: "-" },
        { id: BANK_OPTIONS.MANDIRI, label: "Mandiri" },
        { id: BANK_OPTIONS.BANK_NAGARI, label: "Bank Nagari" }
    ];

    const dataBayar = [
        { id: PAYMENT_METHODS.CASH, label: "Cash" },
        { id: PAYMENT_METHODS.NON_CASH, label: "Non-Cash" }
    ];

    const dataBarang = [
        {
            jenis: "Barang Handmade",
            kategori: ["Semua", "Gelang", "Anting-Anting", "Cincin"],
            items: [
                { id: 1, image: "https://via.placeholder.com/150", code: "MMM453", name: "Gelang Barbie 123", price: 10000, kategori: "Gelang" },
                { id: 2, image: "https://via.placeholder.com/150", code: "MMM454", name: "Anting Keren 123", price: 15000, kategori: "Anting-Anting" },
                { id: 3, image: "https://via.placeholder.com/150", code: "MMM455", name: "Cincin Cantik 123", price: 20000, kategori: "Cincin" },
                { id: 4, image: "https://via.placeholder.com/150", code: "MMM456", name: "Gelang Modern", price: 12000, kategori: "Gelang" },
            ],
        },
        {
            jenis: "Barang Non-Handmade",
            kategori: ["Semua", "Kalung", "Topi", "Tas"],
            items: [
                { id: 5, image: "https://via.placeholder.com/150", code: "MMM457", name: "Kalung Emas", price: 50000, kategori: "Kalung" },
                { id: 6, image: "https://via.placeholder.com/150", code: "MMM458", name: "Topi Keren", price: 30000, kategori: "Topi" },
                { id: 7, image: "https://via.placeholder.com/150", code: "MMM459", name: "Tas Ransel", price: 100000, kategori: "Tas" },
                { id: 8, image: "https://via.placeholder.com/150", code: "MMM460", name: "Kalung Perak", price: 45000, kategori: "Kalung" },
            ],
        },
    ];

    // Initial data for editing
    const initialData = {
        nomor: "SO123",
        tanggal: "2024-01-05",
        namaPembeli: "John Doe",
        cashNonCash: PAYMENT_METHODS.NON_CASH,
        metodePembayaran: BANK_OPTIONS.MANDIRI,
        items: [
            { id: 1, productId: 1, quantity: 10 },
            { id: 2, productId: 5, quantity: 5 }
        ],
        catatan: "Catatan pesanan default",
        diskonPersen: 30,
        pajak: 1000 
    };

    const [catatan, setCatatan] = useState(initialData.catatan);
    const [diskonPersen, setDiskonPersen] = useState(initialData.diskonPersen);
    const [pajak, setPajak] = useState(initialData.pajak);

    // State management
    const [formData, setFormData] = useState({
        nomor: initialData.nomor,
        tanggal: initialData.tanggal,
        namaPembeli: initialData.namaPembeli,
    });
    const [selectMetode, setSelectMetode] = useState(initialData.metodePembayaran);
    const [selectBayar, setSelectBayar] = useState(initialData.cashNonCash);
    const [tableData, setTableData] = useState([]);
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [totalHarga, setTotalHarga] = useState(0);

    // Effect for calculating totals
    useEffect(() => {
        const newTotalItems = tableData.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);
        const newTotalHarga = tableData.reduce((sum, row) => sum + (row.numericTotalBiaya || 0), 0);
        
        setTotalItems(newTotalItems);
        setTotalHarga(newTotalHarga);
    }, [tableData]);

    // Memoized values
    const allProducts = useMemo(() => {
        return dataBarang.reduce((acc, category) => {
            const products = category.items.map(item => ({
                ...item,
                jenis: category.jenis
            }));
            return [...acc, ...products];
        }, []);
    }, []);

    const selectedMetodeLabel = useMemo(() => {
        return dataMetode.find(option => option.id === selectMetode)?.label || "";
    }, [selectMetode]);

    const selectedBayarLabel = useMemo(() => {
        return dataBayar.find(option => option.id === selectBayar)?.label || "";
    }, [selectBayar]);

    // Table headers configuration
    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Produk", key: "Nama Produk", align: "text-left" },
        { label: "Jenis Barang", key: "Jenis Barang", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left" },
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" }
    ];

    // Navigation configuration
    const breadcrumbItems = [
        { label: "Daftar Penjualan Rumah Produksi", href: "/laporanKeuangan" },
        { label: "Edit Penjualan", href: "" },
    ];

    // Effects
    useEffect(() => {
        initializeTableData();
    }, []);

    useEffect(() => {
        setIsMetodeDisabled(selectBayar === PAYMENT_METHODS.CASH);
    }, [selectBayar]);

    // Helper functions
    const initializeTableData = () => {
        const initialTableData = initialData.items.map((item, index) => {
            const product = allProducts.find(p => p.id === item.productId);
            if (!product) return null;

            const categoryData = dataBarang.find(category => 
                category.items.some(catItem => catItem.id === product.id)
            );
            
            return createTableRow(index, product, item.quantity, categoryData.jenis);
        }).filter(Boolean);

        setTableData(initialTableData);
    };

    const createTableRow = (index, product, quantity = 0, jenisBarang) => {
        quantity = Math.max(0, Number(quantity) || 0);
        const totalBiaya = product.price * quantity;

        return {
            No: index + 1,
            "Foto Produk": (
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                />
            ),
            "Nama Produk": (
                <InputDropdown
                    showRequired={false}
                    value={product.name}
                    options={allProducts.map(p => ({
                        id: p.id,
                        label: p.name,
                        value: p.price
                    }))}
                    onSelect={(selected) => handleProductSelect(index, selected)}
                />
            ),
            "Jenis Barang": jenisBarang,
            "Harga Satuan": `Rp${product.price.toLocaleString()}`,
            "Kuantitas": (
                <Input
                    type="number"
                    value={quantity}
                    onChange={(value) => handleQuantityChange(index, value)}
                    showRequired={false}
                    min={0}
                />
            ),
            "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
            "Aksi": (
                <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteRow(index)}
                >
                    Hapus
                </button>
            ),
            productName: product.name,
            productPrice: product.price,
            quantity: quantity,
            numericTotalBiaya: totalBiaya,
            productId: product.id
        };
    };

    // Event handlers
    const handleInputChange = (field) => (value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSelectMetode = (value) => {
        setSelectMetode(value);
    };

    const handleSelectBayar = (selectedOption) => {
        setSelectBayar(selectedOption.id);
        if (selectedOption.id === PAYMENT_METHODS.NON_CASH) {
            setSelectMetode(BANK_OPTIONS.MANDIRI);
        } else {
            setSelectMetode(BANK_OPTIONS.NONE);
        }
    };

    const handleProductSelect = (rowIndex, selectedProduct) => {
        const product = allProducts.find(p => p.name === selectedProduct.label);
        if (!product) return;

        const categoryData = dataBarang.find(category => 
            category.items.some(item => item.id === product.id)
        );
        
        setTableData(prevTableData => {
            const updatedData = [...prevTableData];
            const currentQuantity = updatedData[rowIndex]?.quantity || 1;
            const totalBiaya = product.price * currentQuantity;

            updatedData[rowIndex] = {
                ...updatedData[rowIndex],
                productId: product.id,
                productName: product.name,
                productPrice: product.price,
                "Jenis Barang": categoryData.jenis,
                "Nama Produk": (
                    <InputDropdown
                        showRequired={false}
                        value={product.name}
                        options={allProducts.map(p => ({
                            id: p.id,
                            label: p.name,
                            value: p.price
                        }))}
                        onSelect={(selected) => handleProductSelect(rowIndex, selected)}
                    />
                ),
                "Foto Produk": (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md"
                    />
                ),
                "Harga Satuan": `Rp${product.price.toLocaleString()}`,
                quantity: currentQuantity,
                numericTotalBiaya: totalBiaya,
                "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
                "Kuantitas": (
                    <Input
                        type="number"
                        value={currentQuantity}
                        onChange={(value) => handleQuantityChange(rowIndex, value)}
                        showRequired={false}
                        min={0}
                    />
                )
            };
            
            return updatedData.map((row, index) => ({
                ...row,
                No: index + 1
            }));
        });
    };

    const handleQuantityChange = (rowIndex, newQuantity) => {
        const quantity = Math.max(0, Number(newQuantity) || 0);
        
        setTableData(prevTableData => {
            const updatedData = [...prevTableData];
            const currentRow = { ...updatedData[rowIndex] };
            
            if (currentRow) {
                const price = currentRow.productPrice;
                const totalBiaya = price * quantity;
                
                updatedData[rowIndex] = {
                    ...currentRow,
                    quantity: quantity,
                    numericTotalBiaya: totalBiaya,
                    "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
                    "Kuantitas": (
                        <Input
                            type="number"
                            value={quantity}
                            onChange={(value) => handleQuantityChange(rowIndex, value)}
                            showRequired={false}
                            min={0}
                        />
                    )
                };
                
                return updatedData.map((row, index) => ({
                    ...row,
                    No: index + 1
                }));
            }
            
            return prevTableData;
        });
    };

    const handleDeleteRow = (rowIndex) => {
        const updatedData = tableData
            .filter((_, index) => index !== rowIndex)
            .map((row, index) => ({
                ...row,
                No: index + 1
            }));
        setTableData(updatedData);
    };

    const handleAddRow = () => {
        const defaultProduct = allProducts[0];
        const categoryData = dataBarang.find(category => 
            category.items.some(item => item.id === defaultProduct.id)
        );
        
        const newRow = createTableRow(
            tableData.length,
            defaultProduct,
            1,
            categoryData.jenis
        );
        
        setTableData([...tableData, newRow]);
    };

    const handleSubmit = async () => {
        try {
            const { subtotal, finalTotal } = calculateFinalTotals();
            
            const formattedData = {
                ...formData,
                cashNonCash: selectBayar,
                metodePembayaran: selectMetode,
                items: tableData.map(row => ({
                    productId: row.productId,
                    quantity: row.quantity
                })),
                catatan: catatan,
                subtotal: subtotal,
                diskonPersen: diskonPersen,
                pajak: pajak,
                totalPenjualan: finalTotal
            };
            
            console.log('Submitting data:', formattedData);
            
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const calculateFinalTotals = () => {
        const subtotal = totalHarga;
        const diskonAmount = (subtotal * diskonPersen) / 100;
        const afterDiskon = subtotal - diskonAmount;
        const totalWithTax = afterDiskon + Number(pajak);
        return {
            subtotal: subtotal,
            finalTotal: totalWithTax
        };
    };

    // Log semua data saat ada perubahan apa pun
    // useEffect(() => {
    //     const allData = {
    //         ...formData,
    //         cashNonCash: selectBayar,
    //         metodePembayaran: selectMetode,
    //         items: tableData,
    //         catatan,
    //         diskonPersen,
    //         pajak,
    //         totalHarga,
    //         totalSetelahDiskonPajak: calculateFinalTotals().finalTotal
    //     };
        
    //     console.log('Complete Data State:', allData);
    // }, [formData, selectBayar, selectMetode, tableData, catatan, diskonPersen, pajak, totalHarga]);

    return (
        <Navbar menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />
                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input 
                                label="Nomor"
                                value={formData.nomor}
                                onChange={handleInputChange("nomor")}
                                required={true}
                            />
                            
                            <Input 
                                label="Tanggal"
                                type="date"
                                value={formData.tanggal}
                                onChange={handleInputChange("tanggal")}
                                required={true}
                            />

                            <Input 
                                label="Nama Pembeli"
                                value={formData.namaPembeli}
                                onChange={handleInputChange("namaPembeli")}
                                required={true}
                            />

                            <InputDropdown 
                                label="Cash/Non-Cash" 
                                options={dataBayar} 
                                value={selectedBayarLabel} 
                                onSelect={handleSelectBayar}
                                required={true}
                            />

                            <InputDropdown 
                                label="Metode Pembayaran" 
                                disabled={isMetodeDisabled} 
                                options={dataMetode} 
                                value={selectedMetodeLabel} 
                                onSelect={handleSelectMetode}
                                required={!isMetodeDisabled}
                            />
                        </div>

                        <div className="mt-10">
                            <h2 className="text-lg font-semibold mb-4">List Produk</h2>
                            <Table
                                headers={headers}
                                data={tableData}
                                text_header="text-primary"
                                hasSearch={false}
                                hasPagination={false}
                            />
                            <button 
                                onClick={handleAddRow}
                                className="mt-4 flex items-center gap-2 text-primary hover:text-primary-dark"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Tambah Baris
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            {/* Left Column - Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan<span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary min-h-[150px]"
                                    placeholder="Masukan Catatan Disini"
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                />
                            </div>

                            {/* Right Column - Calculations */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">
                                        Rp{totalHarga.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Diskon Keseluruhan</span>
                                    <div className="w-32">
                                        <Input
                                            type="number"
                                            value={diskonPersen}
                                            onChange={(value) => setDiskonPersen(Number(value))}
                                            min={0}
                                            max={100}
                                            showRequired={false}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Pajak</span>
                                    <div className="w-32">
                                        <Input
                                            type="number"
                                            value={pajak}
                                            onChange={(value) => setPajak(Number(value))}
                                            showRequired={false}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="text-gray-600 font-medium">Total Penjualan</span>
                                    <span className="font-bold text-lg">
                                        Rp{calculateFinalTotals().finalTotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </section>

                {/* Error Alert - Optional */}
                {/* {error && (
                    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <span className="font-bold">Error!</span>
                        <span className="block">{error}</span>
                    </div>
                )} */}

                {/* Success Alert - Optional */}
                {/* {success && (
                    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <span className="font-bold">Success!</span>
                        <span className="block">{success}</span>
                    </div>
                )} */}
            </div>
        </Navbar>
    );
}