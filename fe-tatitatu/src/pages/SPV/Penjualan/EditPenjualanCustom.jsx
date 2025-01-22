import { useEffect, useMemo, useState } from "react";
import InputDropdown from "../../../components/InputDropdown";
import Input from "../../../components/Input";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Table from "../../../components/Table";
import Button from "../../../components/Button";

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

export default function EditPenjualanCustom() {

    const [customTableData, setCustomTableData] = useState([]);
    const [biayaTableData, setBiayaTableData] = useState([]);
    const [packagingTableData, setPackagingTableData] = useState([]);

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
            jenis: "Barang Custom",
            kategori: ["Semua", "Gelang", "Anting-Anting", "Cincin"],
            items: [
                { id: 1, image: "https://via.placeholder.com/150", code: "MMM453", name: "Gelang Barbie 123", price: 10000, kategori: "Gelang" },
                { id: 2, image: "https://via.placeholder.com/150", code: "MMM454", name: "Anting Keren 123", price: 15000, kategori: "Anting-Anting" },
                { id: 3, image: "https://via.placeholder.com/150", code: "MMM455", name: "Cincin Cantik 123", price: 20000, kategori: "Cincin" },
                { id: 4, image: "https://via.placeholder.com/150", code: "MMM456", name: "Gelang Modern", price: 12000, kategori: "Gelang" },
            ],
        },
        {
            jenis: "Packaging",
            items: [
                {
                    id: 1,
                    title: "Gelang Barbie 123",
                    price: 10000,
                    image: "https://via.placeholder.com/50",
                    type: "Zipper",
                },
            ]
        }
    ];

    const initialData = {
        nomor: "SO123",
        tanggal: "2024-01-05", 
        namaPembeli: "John Doe",
        cashNonCash: PAYMENT_METHODS.NON_CASH,
        metodePembayaran: BANK_OPTIONS.MANDIRI,
        // Data untuk custom products
        customItems: [
            { id: 1, productId: 1, quantity: 10 }, // Gelang Barbie 123
            { id: 2, productId: 2, quantity: 5 },  // Anting Keren 123
            { id: 3, productId: 3, quantity: 3 }   // Cincin Cantik 123
        ],
        // Data untuk biaya
        biayaItems: [
            { id: 1, name: "Jasa Design", amount: 24000 },
            { id: 2, name: "Jasa Pemasangan", amount: 15000 },
            { id: 3, name: "Ongkos Kirim", amount: 10000 }
        ],
        // Data untuk packaging
        packagingItems: [
            { id: 1, productId: 1, quantity: 10 }, // Zipper
            { id: 2, productId: 1, quantity: 5 }   // Zipper lagi
        ],
        catatan: "Catatan pesanan default",
        diskonPersen: 30,
        pajak: 1000 
    };
    
        // Initialize tables
    useEffect(() => {
        // Initialize Custom Items
        if (initialData.customItems?.length > 0) {
            const customItems = initialData.customItems.map((item, index) => {
                const product = dataBarang[0].items.find(p => p.id === item.productId);
                if (!product) return null;
                return createCustomRow(index, product, item.quantity);
            }).filter(Boolean);
            setCustomTableData(customItems);
        }

        // Initialize Biaya Items
        if (initialData.biayaItems?.length > 0) {
            const biayaItems = initialData.biayaItems.map((item, index) => 
                createBiayaRow(index, item.name, item.amount)
            );
            setBiayaTableData(biayaItems);
        }

        // Initialize Packaging Items
        if (initialData.packagingItems?.length > 0) {
            const packagingItems = initialData.packagingItems.map((item, index) => {
                const product = dataBarang[1].items.find(p => p.id === item.productId);
                if (!product) return null;
                return createPackagingRow(index, product, item.quantity);
            }).filter(Boolean);
            setPackagingTableData(packagingItems);
        }
    }, []);

    const [catatan, setCatatan] = useState(initialData.catatan);
    const [diskonPersen, setDiskonPersen] = useState(initialData.diskonPersen);
    const [pajak, setPajak] = useState(initialData.pajak);

    // State management
    const [formData, setFormData] = useState({
        nomor: initialData.nomor,
        tanggal: initialData.tanggal,
        namaPembeli: initialData.namaPembeli,
    });
    const [selectBayar, setSelectBayar] = useState(initialData.cashNonCash);
    const [selectMetode, setSelectMetode] = useState(initialData.metodePembayaran);
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

    const selectedBayarLabel = useMemo(() => {
        const option = dataBayar.find(opt => opt.id === selectBayar);
        return option?.label || "";
    }, [selectBayar]);
    
    const selectedMetodeLabel = useMemo(() => {
        const option = dataMetode.find(opt => opt.id === selectMetode);
        return option?.label || "";
    }, [selectMetode]);

    // Table headers configuration
    const customHeaders = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Bahan", key: "Nama Bahan", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left" },
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" }
    ];
    
    const biayaHeaders = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama Biaya", key: "Nama Biaya", align: "text-left" },
        { label: "Jumlah Biaya", key: "Jumlah Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" }
    ];
    
    const packagingHeaders = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Packaging", key: "Nama Packaging", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left" },
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" }
    ];

    // Helper functions untuk masing-masing tabel
    const createCustomRow = (index, product, quantity = 0) => {
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
            "Nama Bahan": (
                <InputDropdown
                    showRequired={false}
                    value={product.name}
                    options={dataBarang[0].items.map(p => ({
                        id: p.id,
                        label: p.name,
                        value: p.name  // Changed from p.price to p.name to match the value type
                    }))}
                    onSelect={(selected) => handleCustomProductSelect(index, selected)}
                />
            ),
            "Harga Satuan": `Rp${product.price.toLocaleString()}`,
            "Kuantitas": (
                <Input
                    type="number"
                    value={quantity}
                    onChange={(value) => handleCustomQuantityChange(index, value)}
                    showRequired={false}
                    min={0}
                />
            ),
            "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
            "Aksi": (
                <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleCustomDeleteRow(index)}
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

const createBiayaRow = (index, name = "", amount = 0) => {
    return {
        No: index + 1,
        "Nama Biaya": (
            <Input
                type="text"
                value={name}
                onChange={(value) => handleBiayaNameChange(index, value)}
                showRequired={false}
            />
        ),
        "Jumlah Biaya": (
            <Input
                type="number"
                value={amount}
                onChange={(value) => handleBiayaAmountChange(index, value)}
                showRequired={false}
                min={0}
            />
        ),
        "Aksi": (
            <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => handleBiayaDeleteRow(index)}
            >
                Hapus
            </button>
        ),
        name,
        amount,
        numericTotalBiaya: amount
    };
};

const createPackagingRow = (index, product, quantity = 0) => {
    quantity = Math.max(0, Number(quantity) || 0);
    const totalBiaya = product.price * quantity;

    return {
        No: index + 1,
        "Foto Produk": (
            <img
                src={product.image}
                alt={product.type}
                className="w-16 h-16 object-cover rounded-md"
            />
        ),
        "Nama Packaging": (
            <InputDropdown
                showRequired={false}
                value={product.type}
                options={dataBarang[1].items.map(p => ({
                    id: p.id,
                    label: p.type,
                    value: p.type  // Changed from p.price to p.type
                }))}
                onSelect={(selected) => handlePackagingProductSelect(index, selected)}
            />
        ),
        "Harga Satuan": `Rp${product.price.toLocaleString()}`,
        "Kuantitas": (
            <Input
                type="number"
                value={quantity}
                onChange={(value) => handlePackagingQuantityChange(index, value)}
                showRequired={false}
                min={0}
            />
        ),
        "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
        "Aksi": (
            <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => handlePackagingDeleteRow(index)}
            >
                Hapus
            </button>
        ),
        productType: product.type,
        productPrice: product.price,
        quantity: quantity,
        numericTotalBiaya: totalBiaya,
        productId: product.id
    };
};


    // Handle functions untuk custom products
const handleCustomAddRow = () => {
    const defaultProduct = dataBarang[0].items[0];
    const newRow = createCustomRow(customTableData.length, defaultProduct, 1);
    setCustomTableData([...customTableData, newRow]);
};

const handleCustomProductSelect = (rowIndex, selectedProduct) => {
    const product = dataBarang[0].items.find(p => p.name === selectedProduct.value);
    if (!product) return;

    setCustomTableData(prevData => {
        const updatedData = [...prevData];
        const currentQuantity = updatedData[rowIndex]?.quantity || 1;
        updatedData[rowIndex] = createCustomRow(rowIndex, product, currentQuantity);
        return updatedData.map((row, index) => ({...row, No: index + 1}));
    });
};

const handleCustomQuantityChange = (rowIndex, newQuantity) => {
    setCustomTableData(prevData => {
        const updatedData = [...prevData];
        const currentRow = {...updatedData[rowIndex]};
        const product = dataBarang[0].items.find(p => p.name === currentRow.productName);
        updatedData[rowIndex] = createCustomRow(rowIndex, product, newQuantity);
        return updatedData.map((row, index) => ({...row, No: index + 1}));
    });
};

const handleCustomDeleteRow = (rowIndex) => {
    setCustomTableData(prevData => 
        prevData
            .filter((_, index) => index !== rowIndex)
            .map((row, index) => ({...row, No: index + 1}))
    );
};

// Handle functions untuk biaya
const handleBiayaAddRow = () => {
    const newRow = createBiayaRow(biayaTableData.length);
    setBiayaTableData([...biayaTableData, newRow]);
};

const handleBiayaNameChange = (rowIndex, newName) => {
    setBiayaTableData(prevData => {
        const updatedData = [...prevData];
        const currentRow = {...updatedData[rowIndex]};
        updatedData[rowIndex] = createBiayaRow(rowIndex, newName, currentRow.amount);
        return updatedData.map((row, index) => ({...row, No: index + 1}));
    });
};

const handleBiayaAmountChange = (rowIndex, newAmount) => {
    setBiayaTableData(prevData => {
        const updatedData = [...prevData];
        const currentRow = {...updatedData[rowIndex]};
        updatedData[rowIndex] = createBiayaRow(rowIndex, currentRow.name, newAmount);
        return updatedData.map((row, index) => ({...row, No: index + 1}));
    });
};

const handleBiayaDeleteRow = (rowIndex) => {
    setBiayaTableData(prevData => 
        prevData
            .filter((_, index) => index !== rowIndex)
            .map((row, index) => ({...row, No: index + 1}))
    );
};

// Handle functions untuk packaging
const handlePackagingAddRow = () => {
    const defaultProduct = dataBarang[1].items[0];
    const newRow = createPackagingRow(packagingTableData.length, defaultProduct, 1);
    setPackagingTableData([...packagingTableData, newRow]);
};

const handlePackagingProductSelect = (rowIndex, selectedProduct) => {
    const product = dataBarang[1].items.find(p => p.type === selectedProduct.value);
    if (!product) return;

    setPackagingTableData(prevData => {
        const updatedData = [...prevData];
        const currentQuantity = updatedData[rowIndex]?.quantity || 1;
        updatedData[rowIndex] = createPackagingRow(rowIndex, product, currentQuantity);
        return updatedData.map((row, index) => ({...row, No: index + 1}));
    });
};

const handlePackagingQuantityChange = (rowIndex, newQuantity) => {
    setPackagingTableData(prevData => {
        const updatedData = [...prevData];
        const currentRow = {...updatedData[rowIndex]};
        const product = dataBarang[1].items.find(p => p.type === currentRow.productType);
        updatedData[rowIndex] = createPackagingRow(rowIndex, product, newQuantity);
        return updatedData.map((row, index) => ({...row, No: index + 1}));
    });
};

const handlePackagingDeleteRow = (rowIndex) => {
    setPackagingTableData(prevData => 
        prevData
            .filter((_, index) => index !== rowIndex)
            .map((row, index) => ({...row, No: index + 1}))
    );
};

// Update useEffect for calculating totals
useEffect(() => {
    const customTotal = customTableData.reduce((sum, row) => sum + (row.numericTotalBiaya || 0), 0);
    const biayaTotal = biayaTableData.reduce((sum, row) => sum + (row.amount || 0), 0);
    const packagingTotal = packagingTableData.reduce((sum, row) => sum + (row.numericTotalBiaya || 0), 0);
    
    setTotalHarga(customTotal + biayaTotal + packagingTotal);
    setTotalItems(
        customTableData.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0) +
        packagingTableData.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
    );
}, [customTableData, biayaTableData, packagingTableData]);

    // Navigation configuration
    const breadcrumbItems = [
        { label: "Daftar Penjualan", href: "/penjualanToko" },
        { label: "Detail Penjualan", href: "" },
        { label: "Edit Penjualan", href: "" },
    ];

    useEffect(() => {
        setIsMetodeDisabled(selectBayar === PAYMENT_METHODS.CASH);
    }, [selectBayar]);


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

    const handleSelectMetode = (selected) => {
        const selectedOption = dataMetode.find(opt => opt.label === selected.value);
        if (selectedOption) {
            setSelectMetode(selectedOption.id);
        }
    };

    const handleSelectBayar = (selected) => {
        const selectedOption = dataBayar.find(opt => opt.label === selected.value);
        if (selectedOption) {
            setSelectBayar(selectedOption.id);
            if (selectedOption.id === PAYMENT_METHODS.CASH) {
                setSelectMetode(BANK_OPTIONS.NONE);
                setIsMetodeDisabled(true);
            } else {
                setSelectMetode(BANK_OPTIONS.MANDIRI);
                setIsMetodeDisabled(false);
            }
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
    

    // Initialize tables
    useEffect(() => {
        // Initialize Custom Items
        if (initialData.customItems?.length > 0) {
            const customItems = initialData.customItems.map((item, index) => {
                const product = dataBarang[0].items.find(p => p.id === item.productId);
                if (!product) return null;
                return createCustomRow(index, product, item.quantity);
            }).filter(Boolean);
            setCustomTableData(customItems);
        }
    
        // Initialize Biaya Items
        if (initialData.biayaItems?.length > 0) {
            const biayaItems = initialData.biayaItems.map((item, index) => 
                createBiayaRow(index, item.name, item.amount)
            );
            setBiayaTableData(biayaItems);
        }
    
        // Initialize Packaging Items
        if (initialData.packagingItems?.length > 0) {
            const packagingItems = initialData.packagingItems.map((item, index) => {
                const product = dataBarang[1].items.find(p => p.id === item.productId);
                if (!product) return null;
                return createPackagingRow(index, product, item.quantity);
            }).filter(Boolean);
            setPackagingTableData(packagingItems);
        }
    }, []);
    
    // Handle submit untuk data terpisah
    const handleSubmit = async () => {
        try {
            const { subtotal, finalTotal } = calculateFinalTotals();
            
            const formattedData = {
                ...formData,
                cashNonCash: selectBayar,
                metodePembayaran: selectMetode,
                // Data terpisah untuk setiap kategori
                customItems: customTableData.map(row => ({
                    productId: row.productId,
                    quantity: row.quantity
                })),
                biayaItems: biayaTableData.map(row => ({
                    name: row.name,
                    amount: row.amount
                })),
                packagingItems: packagingTableData.map(row => ({
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
                                options={dataBayar.map(option => ({
                                    id: option.id,
                                    label: option.label,
                                    value: option.label
                                }))} 
                                value={selectedBayarLabel} 
                                onSelect={handleSelectBayar}
                                required={true}
                            />

                            <InputDropdown 
                                label="Metode Pembayaran" 
                                disabled={isMetodeDisabled} 
                                options={dataMetode.map(option => ({
                                    id: option.id,
                                    label: option.label,
                                    value: option.label
                                }))}
                                value={selectedMetodeLabel} 
                                onSelect={handleSelectMetode}
                                required={!isMetodeDisabled}
                            />
                        </div>

                        <div className="mt-10 space-y-8">
                        {/* Custom Products Table */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Rincian Jumlah dan Bahan*</h2>
                                <Table
                                    headers={customHeaders}
                                    data={customTableData}
                                    text_header="text-primary"
                                    hasSearch={false}
                                    hasPagination={false}
                                />
                                <button 
                                    onClick={handleCustomAddRow}
                                    className="mt-4 flex items-center gap-2 text-primary hover:text-primary-dark"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Tambah Baris
                                </button>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-4">Rincian Biaya</h2>
                                <Table
                                    headers={biayaHeaders}
                                    data={biayaTableData}
                                    text_header="text-primary"
                                    hasSearch={false}
                                    hasPagination={false}
                                />
                                <button 
                                    onClick={handleBiayaAddRow}
                                    className="mt-4 flex items-center gap-2 text-primary hover:text-primary-dark"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                Tambah Baris
                                </button>
                            </div>

                            {/* Packaging Table */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Packaging</h2>
                                <Table
                                    headers={packagingHeaders}
                                    data={packagingTableData}
                                    text_header="text-primary"
                                    hasSearch={false}
                                    hasPagination={false}
                                />
                                <button 
                                    onClick={handlePackagingAddRow}
                                    className="mt-4 flex items-center gap-2 text-primary hover:text-primary-dark"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Tambah Baris
                                </button>
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

                            {/* Section dengan tombol di bagian paling bawah */}
                            <div className="flex justify-end gap-4 mt-8">
                                <Button 
                                    label="Kembali"
                                    bgColor="bg-white border-secondary border"
                                    textColor="text-gray-700"
                                    hoverColor="hover:bg-gray-50"
                                    onClick={() => {/* handle kembali */}}
                                />
                                <Button 
                                    label="Simpan"
                                    bgColor="bg-primary"
                                    hoverColor="hover:bg-primary-dark"
                                    onClick={handleSubmit}
                                />
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