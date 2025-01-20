import { useState, useEffect, useMemo } from "react";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Navbar from "../../../../components/Navbar";
import { menuItems, userOptions } from "../../../../data/menu";
import Input from "../../../../components/Input";
import InputDropdown from "../../../../components/InputDropdown";
import Table from "../../../../components/Table";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import { useNavigate } from "react-router-dom";

// Constants


export default function EditPemasukanJual() {
    const [packagingData, setPackagingData] = useState([]);
    const PAYMENT_METHODS = {
        CASH: 1,
        NON_CASH: 2
      };
      
      const BANK_OPTIONS = {
        NONE: 1,
        MANDIRI: 2,
        BANK_NAGARI: 3
      };

    // Data constants
    const dataBayar = [
        { id: PAYMENT_METHODS.CASH, label: "Cash", value: PAYMENT_METHODS.CASH },
        { id: PAYMENT_METHODS.NON_CASH, label: "Non-Cash", value: PAYMENT_METHODS.NON_CASH }
    ];
    
    const dataMetode = [
        { id: BANK_OPTIONS.NONE, label: "-", value: BANK_OPTIONS.NONE },
        { id: BANK_OPTIONS.MANDIRI, label: "Mandiri", value: BANK_OPTIONS.MANDIRI },
        { id: BANK_OPTIONS.BANK_NAGARI, label: "Bank Nagari", value: BANK_OPTIONS.BANK_NAGARI }
    ];
    
    useEffect(() => {
        const isCash = initialData.cashNonCash === PAYMENT_METHODS.CASH;
        setIsMetodeDisabled(isCash);
        if (isCash) {
            setSelectMetode(BANK_OPTIONS.NONE);
        }
    }, []);
    

    const dataPackaging = [
        { id: 1, image: "https://via.placeholder.com/150", name: "Paper Bag Small" },
        { id: 2, image: "https://via.placeholder.com/150", name: "Paper Bag Medium" },
        { id: 3, image: "https://via.placeholder.com/150", name: "Paper Bag Large" },
        { id: 4, image: "https://via.placeholder.com/150", name: "Gift Box Small" },
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

    // Table headers configuration
    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Produk", key: "Nama Produk", align: "text-left" },
        { label: "Jenis Barang", key: "Jenis Barang", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left", width: '110px' },
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" }
    ];

    const packagingHeaders = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Packaging", key: "Nama Packaging", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left", width: '110px' },
        { label: "Aksi", key: "Aksi", align: "text-left" }
    ];

    // Navigation configuration
    const breadcrumbItems = [
        { label: "Laporan Keuangan Toko", href: "/laporanKeuangan" },
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
                    value={product.id}  // Gunakan ID sebagai value
                    options={allProducts.map(p => ({
                        id: p.id,
                        label: p.name,
                        value: p.id    // Gunakan ID sebagai value
                    }))}
                    onSelect={(selected) => handleProductSelect(rowIndex, selected)}
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

    const createPackagingRow = (index, packaging, quantity = 0) => {
        quantity = Math.max(0, Number(quantity) || 0);
    
        return {
            No: index + 1,
            "Foto Produk": (
                <img
                    src={packaging.image}
                    alt={packaging.name}
                    className="w-16 h-16 object-cover rounded-md"
                />
            ),
            "Nama Packaging": (
                <InputDropdown
                    showRequired={false}
                    value={packaging.id}  // Gunakan ID sebagai value
                    options={dataPackaging.map(p => ({
                        id: p.id,
                        label: p.name,
                        value: p.id  // Tambahkan value yang konsisten
                    }))}
                    onSelect={(selected) => handlePackagingSelect(index, selected)}
                />
            ),
            "Kuantitas": (
                <Input
                    type="number"
                    value={quantity}
                    onChange={(value) => handlePackagingQuantityChange(index, value)}
                    showRequired={false}
                    min={0}
                />
            ),
            "Aksi": (
                <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeletePackagingRow(index)}
                >
                    Hapus
                </button>
            ),
            packagingName: packaging.name,
            quantity: quantity,
            packagingId: packaging.id
        };
    };

    const handleAddPackagingRow = () => {
        if (packagingData.length === 0) {
            const defaultPackaging = dataPackaging[0];
            const newRow = createPackagingRow(0, defaultPackaging, 1);
            setPackagingData([newRow]);
        }
    };
    
    const handlePackagingSelect = (rowIndex, selectedPackaging) => {
        const packaging = dataPackaging.find(p => p.id === selectedPackaging.value);
        if (!packaging) return;
    
        setPackagingData(prevData => {
            const updatedData = [...prevData];
            const currentQuantity = updatedData[rowIndex]?.quantity || 1;
    
            updatedData[rowIndex] = createPackagingRow(rowIndex, packaging, currentQuantity);
            return updatedData;
        });
    };
    
    const handlePackagingQuantityChange = (rowIndex, newQuantity) => {
        const quantity = Math.max(0, Number(newQuantity) || 0);
        
        setPackagingData(prevData => {
            const updatedData = [...prevData];
            const currentRow = { ...updatedData[rowIndex] };
            
            if (currentRow) {
                const packaging = dataPackaging.find(p => p.id === currentRow.packagingId);
                updatedData[rowIndex] = createPackagingRow(rowIndex, packaging, quantity);
                return updatedData;
            }
            return prevData;
        });
    };

    const handleDeletePackagingRow = () => {
        setPackagingData([]);
    };

    // Event handlers
    const handleInputChange = (field) => (value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSelectMetode = (selected) => {
        setSelectMetode(selected.value);
    };

    const handleSelectBayar = (selected) => {
        const isCash = selected.value === PAYMENT_METHODS.CASH;
        setSelectBayar(selected.value);
        
        if (isCash) {
            setSelectMetode(BANK_OPTIONS.NONE);
            setIsMetodeDisabled(true);
        } else {
            setSelectMetode(BANK_OPTIONS.MANDIRI);
            setIsMetodeDisabled(false);
        }
    };

    

    const handleProductSelect = (rowIndex, selectedProduct) => {
        const product = allProducts.find(p => p.id === selectedProduct.value);
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
                        value={product.id} 
                        options={allProducts.map(p => ({
                            id: p.id,
                            label: p.name,
                            value: p.id   
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

    const navigate = useNavigate()
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
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
                                label="Tanggal dan Waktu"
                                type1={'datetime-local'}
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
                                value={selectBayar} 
                                onSelect={handleSelectBayar}
                                required={true}
                            />

                            <InputDropdown 
                                label="Metode Pembayaran" 
                                disabled={isMetodeDisabled} 
                                options={dataMetode} 
                                value={selectMetode} 
                                onSelect={handleSelectMetode}
                                required={!isMetodeDisabled}
                            />
                        </div>

                        <div className="mt-10">
                            <h2 className="text-lg font-semibold mb-4">Rincian Produk</h2>
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

                            <div className="mt-10">
                                <h2 className="text-lg font-semibold mb-4">Packaging</h2>
                                <Table
                                    headers={packagingHeaders}
                                    data={packagingData}
                                    text_header="text-primary"
                                    hasSearch={false}
                                    hasPagination={false}
                                />
                                {packagingData.length === 0 && (
                                    <button 
                                        onClick={handleAddPackagingRow}
                                        className="mt-4 flex items-center gap-2 text-primary hover:text-primary-dark"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Tambah Packaging
                                    </button>
                                )}
                            </div>

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
                        <div className="flex justify-end gap-4 mt-8">
                                <button
                                    onClick={handleBack}
                                    className="px-20 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-20 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                                >
                                    Simpan
                                </button>
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
        </LayoutWithNav>
    );
}