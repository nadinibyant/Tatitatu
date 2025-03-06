import { useState, useEffect } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";
import api from "../../../utils/api";
import ButtonDropdown from "../../../components/ButtonDropdown";

export default function HariTerlaris(){
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const [tokoData, setTokoData] = useState([]);
    const [storeSelections, setStoreSelections] = useState({});
    const [branchOptions, setBranchOptions] = useState({});
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isHeadGudang = userData?.role === 'headgudang';
    const isAdminGudang = userData?.role === 'adminGudang';
    const isManajer = userData?.role === 'manajer';
    const isOwner = userData?.role === 'owner';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance';
    
    const toko_id = isOwner || isFinance 
        ? null 
        : userData?.userId || userData?.tokoId;

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? "coklatTua" 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";
    const fetchBranchOptions = async (tokoId) => {
        try {
            const response = await api.get(`/cabang?toko_id=${tokoId}`);
            
            if (response.data.success) {
                const options = [
                    { value: "all", label: "Semua" },
                    ...response.data.data.map(branch => ({
                        value: branch.cabang_id.toString(),
                        label: branch.nama_cabang
                    }))
                ];
                
                return options;
            } else {
                console.error("Failed to fetch branch options:", response.data.message);
                return [{ value: "all", label: "Semua" }];
            }
        } catch (error) {
            console.error("Error fetching branch options:", error);
            return [{ value: "all", label: "Semua" }];
        }
    };

    const dummyGudangData = [
        {
            nama_toko: '',
            cabang_id: '',
            toko_id: '',
            data: {
                dashboard: {
                    hari_terlaris: {
                        waktu: '',
                        jumlah: ''
                    },
                    jam_terpanas: {
                        waktu: '',
                        jumlah: ''
                    }
                },
                data_hari: [
                    {
                        Hari: '',
                        'Produk Terjual': '',
                        'Jam Terpanas': '',
                        'Total Transaksi': ''
                    },
                ]
            }
        },
    ];

    useEffect(() => {
        if (isAdmin || isOwner || isFinance || isManajer) {
            fetchHariTerlarisData();
        }
    }, [selectedMonth, selectedYear, isAdmin, isOwner, isFinance, isManajer]);

    const fetchHariTerlarisData = async () => {
        try {
            setIsLoading(true);
            
            const startDate = `${selectedYear}-${selectedMonth}-01`;
            const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
            
            let url;
            if (isAdmin) {
                url = `/penjualan/toko?toko_id=${toko_id}&startDate=${startDate}&endDate=${endDate}`;
            } else if (isOwner || isFinance || isManajer) {
                url = `/penjualan/toko?startDate=${startDate}&endDate=${endDate}`;
            }
                
            const response = await api.get(url);
            
            if (response.data.success) {
                const transformedData = processApiData(response.data.data);
                setTokoData(transformedData);
                
                const initialSelections = {};
                const options = {};
                
                for (const toko of transformedData) {
                    initialSelections[toko.nama_toko] = "Semua";
                    
                    const branchOpts = await fetchBranchOptions(toko.toko_id);
                    options[toko.toko_id] = branchOpts;
                }
                
                setStoreSelections(initialSelections);
                setBranchOptions(options);
            } else {
                console.error("Failed to fetch data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching hari terlaris data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const processApiData = (apiData) => {
        return apiData.map(store => {
            const bestSellingDay = findBestSellingDay(store.daily_stats);
            
            const peakHour = findPeakHour(store.daily_stats);

            return {
                nama_toko: store.toko_name,
                toko_id: store.toko_id,
                data: {
                    dashboard: {
                        hari_terlaris: {
                            waktu: bestSellingDay?.day || '-',
                            jumlah: bestSellingDay?.total_sales || 0
                        },
                        jam_terpanas: {
                            waktu: peakHour ? `${peakHour.start} - ${peakHour.end}` : '-',
                            jumlah: peakHour?.transactions || 0
                        }
                    },
                    data_hari: store.daily_stats.map(day => ({
                        Hari: day.day,
                        'Produk Terjual': day.total_quantity,
                        'Jam Terpanas': `${day.peak_hour.start} - ${day.peak_hour.end}`,
                        'Total Transaksi': day.total_sales
                    }))
                }
            };
        });
    };

    const findBestSellingDay = (dailyStats) => {
        if (!dailyStats || dailyStats.length === 0) return null;
        
        return dailyStats.reduce((best, current) => {
            return (current.total_sales > best.total_sales) ? current : best;
        }, dailyStats[0]);
    };

    const findPeakHour = (dailyStats) => {
        if (!dailyStats || dailyStats.length === 0) return null;
        
        let highestTransactions = 0;
        let peakHourData = null;
        
        dailyStats.forEach(day => {
            if (day.peak_hour && day.peak_hour.transactions > highestTransactions) {
                highestTransactions = day.peak_hour.transactions;
                peakHourData = day.peak_hour;
            }
        });
        
        return peakHourData;
    };

    const handleBranchSelect = async (storeName, branchValue, tokoId) => {
        try {
            setIsLoading(true);
            
            // Update store selection state
            setStoreSelections(prev => ({
                ...prev,
                [storeName]: branchValue
            }));
        
            const startDate = `${selectedYear}-${selectedMonth}-01`;
            const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
    
            let url;
            
            if (branchValue === "all") {
                // Untuk "Semua" cabang, gunakan toko_id saja
                url = `/penjualan/toko?startDate=${startDate}&endDate=${endDate}&toko_id=${tokoId}`;
            } else {
                // Untuk cabang spesifik, gunakan cabang_id dan toko_id
                url = `/penjualan/toko?startDate=${startDate}&endDate=${endDate}&cabang_id=${branchValue}&toko_id=${tokoId}`;
            }
            
            const response = await api.get(url);
            
            if (response.data.success) {
                if (branchValue === "all") {
                    // Format respons untuk semua cabang
                    const transformedData = processApiData(response.data.data);
                    
                    setTokoData(prevData => 
                        prevData.map(store => {
                            if (store.nama_toko === storeName) {
                                if (transformedData.length > 0) {
                                    const matchingStore = transformedData.find(t => String(t.toko_id) === String(tokoId)) || transformedData[0];
                                    return {
                                        ...store,
                                        data: matchingStore.data
                                    };
                                }
                            }
                            return store;
                        })
                    );
                } else {
                    // Respons untuk cabang spesifik sudah berupa array daily_stats
                    const dailyStats = response.data.data;
                    
                    // Jika tidak ada data, tampilkan array kosong
                    if (!dailyStats || dailyStats.length === 0) {
                        setTokoData(prevData => 
                            prevData.map(store => {
                                if (store.nama_toko === storeName) {
                                    return {
                                        ...store,
                                        data: {
                                            dashboard: {
                                                hari_terlaris: {
                                                    waktu: '-',
                                                    jumlah: 0
                                                },
                                                jam_terpanas: {
                                                    waktu: '-',
                                                    jumlah: 0
                                                }
                                            },
                                            data_hari: []
                                        }
                                    };
                                }
                                return store;
                            })
                        );
                        return;
                    }
                    
                    // Temukan hari terlaris dan jam terpanas
                    const bestSellingDay = findBestSellingDay(dailyStats);
                    const peakHour = findPeakHour(dailyStats);
                    
                    // Perbarui data toko dalam tokoData
                    setTokoData(prevData => {
                        return prevData.map(store => {
                            if (store.nama_toko === storeName) {
                                return {
                                    ...store,
                                    data: {
                                        dashboard: {
                                            hari_terlaris: {
                                                waktu: bestSellingDay?.day || '-',
                                                jumlah: bestSellingDay?.total_sales || 0
                                            },
                                            jam_terpanas: {
                                                waktu: peakHour ? `${peakHour.start} - ${peakHour.end}` : '-',
                                                jumlah: peakHour?.transactions || 0
                                            }
                                        },
                                        data_hari: dailyStats.map(day => ({
                                            Hari: day.day,
                                            'Produk Terjual': day.total_quantity,
                                            'Jam Terpanas': `${day.peak_hour.start} - ${day.peak_hour.end}`,
                                            'Total Transaksi': day.total_sales
                                        }))
                                    }
                                };
                            }
                            return store;
                        });
                    });
                }
            } else {
                console.error("Failed to fetch branch data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching branch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const headers = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Hari", key: "Hari", align: "text-left" },
        { label: "Produk Terjual", key: "Produk Terjual", align: "text-left" },
        { label: "Jam Terpanas", key: "Jam Terpanas", align: "text-left" },
        { label: "Total Transaksi", key: "Total Transaksi", align: "text-left" },
    ];

    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    const tokoIcon = (isManajer || isOwner || isFinance) ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
        <path d="M1.18951 1.77346C0.995552 2.15922 0.900181 2.63715 0.709441 3.59085L0.068639 6.79486C-0.0221781 7.23171 -0.0228815 7.68251 0.0665719 8.11964C0.156025 8.55678 0.333753 8.97106 0.588876 9.33712C0.843998 9.70318 1.17115 10.0133 1.55029 10.2486C1.92944 10.4838 2.35261 10.6392 2.79389 10.7052C3.23518 10.7712 3.68529 10.7465 4.11668 10.6325C4.54807 10.5185 4.95166 10.3177 5.30274 10.0423C5.65382 9.76691 5.945 9.42278 6.15846 9.03096C6.37192 8.63914 6.50317 8.20787 6.54417 7.76356L6.61918 7.02418C6.57857 7.49443 6.6365 7.96797 6.78927 8.41457C6.94203 8.86116 7.18628 9.27097 7.5064 9.61783C7.82652 9.96468 8.21547 10.2409 8.6484 10.429C9.08134 10.617 9.54873 10.7126 10.0207 10.7098C10.4927 10.7069 10.9589 10.6057 11.3896 10.4124C11.8202 10.2192 12.2058 9.93829 12.5217 9.58761C12.8376 9.23692 13.0769 8.8242 13.2243 8.3758C13.3717 7.92739 13.4239 7.45318 13.3776 6.98346L13.4558 7.76356C13.4968 8.20787 13.6281 8.63914 13.8415 9.03096C14.055 9.42278 14.3462 9.76691 14.6973 10.0423C15.0483 10.3177 15.4519 10.5185 15.8833 10.6325C16.3147 10.7465 16.7648 10.7712 17.2061 10.7052C17.6474 10.6392 18.0706 10.4838 18.4497 10.2486C18.8289 10.0133 19.156 9.70318 19.4111 9.33712C19.6662 8.97106 19.844 8.55678 19.9334 8.11964C20.0229 7.68251 20.0222 7.23171 19.9314 6.79486L19.2906 3.59085C19.0998 2.63715 19.0044 2.1603 18.8105 1.77346C18.6084 1.37059 18.3238 1.01471 17.9753 0.72894C17.6268 0.443166 17.222 0.233877 16.7874 0.114659C16.3694 1.19758e-07 15.8829 0 14.91 0H5.09004C4.11705 0 3.63056 1.19758e-07 3.21264 0.114659C2.77798 0.233877 2.37324 0.443166 2.0247 0.72894C1.67615 1.01471 1.3916 1.37059 1.18951 1.77346ZM16.7177 12.3231C17.555 12.3252 18.3785 12.1108 19.1084 11.7005V12.8589C19.1084 16.8998 19.1084 18.9208 17.8525 20.1756C16.842 21.1872 15.3364 21.3833 12.6789 21.4219V17.681C12.6789 16.6791 12.6789 16.1786 12.4636 15.8057C12.3225 15.5614 12.1196 15.3585 11.8753 15.2174C11.5023 15.0021 11.0019 15.0021 10 15.0021C8.99808 15.0021 8.49765 15.0021 8.12474 15.2174C7.88041 15.3585 7.67752 15.5614 7.53645 15.8057C7.32106 16.1786 7.32106 16.6791 7.32106 17.681V21.4219C4.66355 21.3833 3.15799 21.1861 2.1475 20.1756C0.891609 18.9208 0.891609 16.8998 0.891609 12.8589V11.7005C1.62179 12.1109 2.44575 12.3254 3.28337 12.3231C4.52172 12.3239 5.71397 11.8534 6.61811 11.0072C7.53936 11.8563 8.74718 12.3262 10 12.3231C11.2528 12.3262 12.4606 11.8563 13.3819 11.0072C14.286 11.8534 15.4793 12.3239 16.7177 12.3231Z" fill="#023F80"/>
        </svg>
      ) : (
          <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.77506 2.27503C1.54232 2.73795 1.42787 3.31146 1.19899 4.4559L0.430023 8.30071C0.321042 8.82494 0.320198 9.36589 0.427543 9.89045C0.534887 10.415 0.74816 10.9122 1.05431 11.3514C1.36045 11.7907 1.75303 12.1629 2.20801 12.4452C2.66299 12.7274 3.17079 12.9139 3.70033 12.9931C4.22987 13.0723 4.77001 13.0426 5.28768 12.9059C5.80534 12.7691 6.28965 12.5281 6.71094 12.1976C7.13224 11.8672 7.48166 11.4542 7.73781 10.984C7.99396 10.5138 8.15146 9.99633 8.20066 9.46316L8.29067 8.57589C8.24194 9.14019 8.31145 9.70845 8.49478 10.2444C8.6781 10.7803 8.97119 11.272 9.35534 11.6883C9.73948 12.1045 10.2062 12.436 10.7257 12.6616C11.2453 12.8873 11.8061 13.002 12.3725 12.9986C12.9389 12.9952 13.4984 12.8737 14.0151 12.6418C14.5319 12.4099 14.9946 12.0728 15.3737 11.652C15.7528 11.2312 16.0399 10.7359 16.2168 10.1978C16.3936 9.65975 16.4563 9.0907 16.4008 8.52703L16.4947 9.46316C16.5439 9.99633 16.7014 10.5138 16.9575 10.984C17.2137 11.4542 17.5631 11.8672 17.9844 12.1976C18.4057 12.5281 18.89 12.7691 19.4076 12.9059C19.9253 13.0426 20.4654 13.0723 20.995 12.9931C21.5245 12.9139 22.0323 12.7274 22.4873 12.4452C22.9423 12.1629 23.3349 11.7907 23.641 11.3514C23.9472 10.9122 24.1604 10.415 24.2678 9.89045C24.3751 9.36589 24.3743 8.82494 24.2653 8.30071L23.4963 4.4559C23.2674 3.31146 23.153 2.73924 22.9202 2.27503C22.6777 1.79158 22.3363 1.36454 21.918 1.02161C21.4998 0.67868 21.0141 0.427534 20.4925 0.284472C19.991 0.146881 19.4072 0.146881 18.2396 0.146881H6.45571C5.28812 0.146881 4.70432 0.146881 4.20283 0.284472C3.68123 0.427534 3.19554 0.67868 2.77729 1.02161C2.35904 1.36454 2.01758 1.79158 1.77506 2.27503ZM20.4089 14.9346C21.4136 14.9372 22.4019 14.6798 23.2777 14.1875V15.5776C23.2777 20.4267 23.2777 22.8518 21.7707 24.3576C20.5581 25.5715 18.7514 25.8068 15.5624 25.8531V21.3641C15.5624 20.1618 15.5624 19.5613 15.3039 19.1138C15.1346 18.8206 14.8912 18.5771 14.598 18.4078C14.1505 18.1493 13.55 18.1493 12.3477 18.1493C11.1453 18.1493 10.5448 18.1493 10.0973 18.4078C9.80415 18.5771 9.56068 18.8206 9.39139 19.1138C9.13293 19.5613 9.13293 20.1618 9.13293 21.3641V25.8531C5.94392 25.8068 4.13725 25.5702 2.92465 24.3576C1.41759 22.8518 1.41759 20.4267 1.41759 15.5776V14.1875C2.29381 14.68 3.28256 14.9374 4.28769 14.9346C5.77372 14.9356 7.20442 14.371 8.28939 13.3555C9.39489 14.3744 10.8443 14.9383 12.3477 14.9346C13.851 14.9383 15.3004 14.3744 16.4059 13.3555C17.4909 14.371 18.9229 14.9356 20.4089 14.9346Z" fill="#7B0C42"/>
          </svg>                            
      );

    const getDashboardIconPath = (baseIconName) => {
        if (isManajer || isOwner || isFinance) {
            return `/Dashboard Produk/${baseIconName}_non.svg`;
        }
        return `/Dashboard Produk/${baseIconName}.svg`;
    };

    let displayData = [];
    
    if (isAdmin) {
        displayData = tokoData;
    } else if (isManajer || isOwner || isFinance) {
        displayData = tokoData.length > 0 ? tokoData : dummyGudangData;
    }

    const locationIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12L12 12.01M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    return(
        <>
        <LayoutWithNav>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className={`text-${themeColor} text-base font-bold`}>Hari Terlaris</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                            <input
                                type="month"
                                value={`${selectedYear}-${selectedMonth}`}
                                onChange={(e) => {
                                    const date = moment(e.target.value);
                                    setSelectedMonth(date.format('MM'));
                                    setSelectedYear(date.format('YYYY'));
                                }}
                                className={`w-full px-4 py-2 border border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5 hover:border-${themeColor}`}
                            />             
                        </div>
                    </div>
                </section>

                {(isAdmin || isOwner || isFinance || isManajer) && isLoading ? (
                    <div className="flex justify-center items-center p-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : displayData.length > 0 ? (
                    displayData.map((toko, index) => (
                        <section key={index} className="mt-5 bg-white rounded-xl">
                            <div className="p-4 pb-0">
                                <div className="w-full flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                                            {tokoIcon}
                                        </div>
                                        <h2 className={`text-lg font-bold text-${themeColor}`}>{toko.nama_toko}</h2>
                                    </div>
                                    
                                    {/* Branch dropdown for each store */}
                                    {(isOwner || isManajer) && (
                                    <div className="w-48">
                                        <ButtonDropdown
                                            options={branchOptions[toko.toko_id] || [{ value: "all", label: "Semua" }]}
                                            selectedIcon={null}
                                            label="Semua"
                                            selectedStore={storeSelections[toko.toko_id] || "Semua"}
                                            onSelect={(branchValue) => handleBranchSelect(toko.toko_id, branchValue, toko.toko_id)}
                                        />
                                    </div>
                                )}
                                </div>
                            </div>

                            <div className="px-5 pb-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="w-full">
                                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                            <div className="flex-1">
                                                <p className="text-gray-400 text-sm">Hari Terlaris</p>
                                                <p className="font-bold text-lg">{toko.data.dashboard.hari_terlaris.waktu}</p>
                                                <p className="">Rp{formatNumberWithDots(toko.data.dashboard.hari_terlaris.jumlah)}</p>
                                            </div>
                                            <div className="flex items-center justify-center ml-4">
                                                <img src={getDashboardIconPath('hariterlaris')} alt="hariterlaris" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                            <div className="flex-1">
                                                <p className="text-gray-400 text-sm">Jam Terpanas</p>
                                                <p className="font-bold text-lg">{toko.data.dashboard.jam_terpanas.waktu}</p>
                                                <p className="">
                                                    {/* Display different format based on whether it's API or dummy data */}
                                                    {(isAdmin || isOwner || isFinance || isManajer) && tokoData.length > 0
                                                        ? `${toko.data.dashboard.jam_terpanas.jumlah} transaksi`
                                                        : `Rp${formatNumberWithDots(toko.data.dashboard.jam_terpanas.jumlah)}`
                                                    }
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center ml-4">
                                                <img src={getDashboardIconPath('hariterlaris')} alt="hariterlaris" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 pt-0">
                                {toko.data.data_hari.length > 0 ? (
                                    <Table
                                        headers={headers}
                                        data={toko.data.data_hari.map((item, index) => ({
                                            ...item,
                                            nomor: index + 1,
                                            "Produk Terjual": `${item["Produk Terjual"]} Pcs`,
                                            "Total Transaksi": `Rp${formatNumberWithDots(item["Total Transaksi"])}`,
                                        }))}
                                        hasSearch={false}
                                        hasPagination={false}
                                    />
                                ) : ( <div className="text-center py-5 text-gray-500">
                                    Tidak ada data transaksi untuk bulan ini
                                </div>
                            )}
                        </div>
                    </section>
                ))
            ) : (
                <div className="mt-5 bg-white rounded-xl p-10 text-center text-gray-500">
                    Tidak ada data untuk ditampilkan
                </div>
            )}
        </div>
    </LayoutWithNav>
    </>
)
}