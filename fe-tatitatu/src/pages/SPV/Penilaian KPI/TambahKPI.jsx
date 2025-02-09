import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Button from "../../../components/Button";
import { useEffect, useState } from "react";
import moment from "moment";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";

export default function TambahKPI(){
    const location = useLocation()
    const {id} = location.state || {}
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM"));
    const [daysInMonth, setDaysInMonth] = useState(moment(startDate).daysInMonth()); 
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    const breadcrumbItems = [
        { label: "List Data KPI", href: "/daftarPenilaianKPI" },
        { label: "Tambah KPI", href: "" },
    ];

    const [data, setData] = useState({
        totalPercentage: 0,
        bonus: 0,
        profile: {
            phone: "",
            email: "",
            name: "",
            role: "",
            department: "",
            stats: {
                kehadiran: 0,
                izin: 0,
                tanpakejelasan: 0,
                totalBonus: 0
            }
        },
        kpiList: []
    });

     const fetchProfileData = async () => {
        try {
            const response = await api.get(`/data-absensi-karyawan/${id}/${selectedMonth}/${selectedYear}/karyawan`);
            
            if (response.data.success) {
                const profileData = response.data.data;
                const karyawanData = profileData.karyawan;
                
                setData(prev => ({
                    ...prev,
                    profile: {
                        phone: karyawanData.nomor_handphone || "",
                        email: karyawanData.email || "",
                        name: karyawanData.nama_karyawan || "",
                        role: karyawanData.divisi.nama_divisi || "",
                        id_divisi: karyawanData.divisi_karyawan_id || "",
                        department: karyawanData.cabang.nama_cabang || "",
                        image: karyawanData.image || "",
                        stats: {
                            kehadiran: profileData.kehadiran || 0,
                            izin: profileData.totalCutiDays || 0,
                            tanpakejelasan: profileData.tidakHadir || 0,
                            totalBonus: profileData.totalBonus || 0
                        }
                    }
                }));
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    console.log(data)

    const fetchKPIDefinitions = async () => {
        try {
            // First ensure we have the employee's division ID
            if (!data.profile.id_divisi) {
                return;
            }
    
            const response = await api.get(`/kpi`);
            if (response.data.success) {
                // Filter KPIs based on employee's division ID
                const filteredKPIs = response.data.data.filter(kpi => 
                    kpi.divisi_karyawan_id === data.profile.id_divisi
                );
    
                // Format the filtered KPIs
                const formattedKPIs = filteredKPIs.map(kpi => ({
                    kpi_id: kpi.kpi_id,
                    title: kpi.nama_kpi,
                    percentage: kpi.persentase,
                    waktu: kpi.waktu,
                    checks: kpi.waktu === 'Harian' ? Array(daysInMonth).fill(false) 
                          : kpi.waktu === 'Mingguan' ? Array(4).fill(false)
                          : [false], // Bulanan
                    stats: {
                        tercapai: 0,
                        tidakTercapai: 0,
                        percentage: 0,
                        bonus: 0
                    }
                }));
    
                setData(prev => ({
                    ...prev,
                    kpiList: formattedKPIs
                }));
            }
        } catch (error) {
            console.error('Error fetching KPI definitions:', error);
        }
    };

    const fetchKPIData = async () => {
        try {
            const response = await api.get(`/kpi-karyawan/${id}/${selectedMonth}/${selectedYear}/karyawan`);
            
            if (response.data.success) {
                const apiData = response.data.data;
                
                setData(prev => {
                    const updatedKPIList = prev.kpiList.map(kpi => {
                        const karyawanKPI = apiData.result?.find(k => k.kpi_id === kpi.kpi_id);
                        
                        let newChecks;
                        let checkIds = {};
     
                        // Set default checks array based on waktu
                        if (kpi.waktu === 'Harian') {
                            newChecks = Array(daysInMonth).fill(false);
                        } else if (kpi.waktu === 'Mingguan') {
                            newChecks = Array(4).fill(false);
                        } else {
                            newChecks = [false];
                        }
     
                        // If KPI data exists
                        if (karyawanKPI) {
                            if (karyawanKPI.kpiKaryawanList) {
                                karyawanKPI.kpiKaryawanList.forEach(item => {
                                    newChecks[item.point_ke - 1] = true;
                                    checkIds[item.point_ke - 1] = item.kpi_karyawan_id;
                                });
                            }
     
                            return {
                                ...kpi,
                                checks: newChecks,
                                checkIds: checkIds,
                                stats: {
                                    tercapai: karyawanKPI.tercapai,
                                    tidakTercapai: karyawanKPI.tidakTercapai,
                                    percentage: parseFloat(karyawanKPI.persentaseTercapai).toFixed(2),
                                    bonus: karyawanKPI.bonusDiterima
                                }
                            };
                        } else {
                            // If no KPI data (unchecked)
                            return {
                                ...kpi,
                                checks: newChecks,
                                checkIds: {},
                                stats: {
                                    tercapai: 0,
                                    tidakTercapai: 0,
                                    percentage: 0,
                                    bonus: 0
                                }
                            };
                        }
                    });
     
                    return {
                        ...prev,
                        kpiList: updatedKPIList,
                        totalPercentage: apiData.totalPersentaseTercapai || 0,
                        bonus: apiData.totalBonusDiterima || 0
                    };
                });
            }
        } catch (error) {
            console.error('Error fetching KPI data:', error);
        }
     };
    
    useEffect(() => {
        if (data.profile.id_divisi) {
            fetchKPIDefinitions();
        }
    }, [id, data.profile.id_divisi, daysInMonth]); 
    
    useEffect(() => {
        fetchProfileData()
        if (data.kpiList.length > 0) { 
            fetchKPIData(); 
        }
    }, [selectedMonth, selectedYear, data.kpiList.length, id]);

    const handleKPICheck = async (kpiIndex, checkIndex) => {
        const kpi = data.kpiList[kpiIndex];
        const isCurrentlyChecked = kpi.checks[checkIndex];
        const kpiKaryawanId = kpi.checkIds?.[checkIndex];
    
        try {
            // Update UI secara optomatis
            setData(prev => {
                const newKPIList = [...prev.kpiList];
                const newChecks = [...newKPIList[kpiIndex].checks];
                newChecks[checkIndex] = !isCurrentlyChecked;
                
                newKPIList[kpiIndex] = {
                    ...newKPIList[kpiIndex],
                    checks: newChecks
                };
    
                return {
                    ...prev,
                    kpiList: newKPIList
                };
            });
    
            if (isCurrentlyChecked && kpiKaryawanId) {
                // Jika sedang tercentang, kirim DELETE request
                const response = await api.delete(`/kpi-karyawan/${kpiKaryawanId}`);
                if (!response.data.success) {
                    console.error('Failed to delete KPI:', response.data.message);
                    // Kembalikan state jika gagal
                    setData(prev => {
                        const newKPIList = [...prev.kpiList];
                        const newChecks = [...newKPIList[kpiIndex].checks];
                        newChecks[checkIndex] = isCurrentlyChecked;
                        
                        newKPIList[kpiIndex] = {
                            ...newKPIList[kpiIndex],
                            checks: newChecks
                        };
    
                        return {
                            ...prev,
                            kpiList: newKPIList
                        };
                    });
                    return;
                }
            } else {
                // Jika belum tercentang, kirim POST request
                const response = await api.post('/kpi-karyawan', {
                    kpi_id: kpi.kpi_id,
                    karyawan_id: id,
                    point_ke: checkIndex + 1
                });
                if (!response.data.success) {
                    console.error('Failed to update KPI:', response.data.message);
                    // Kembalikan state jika gagal
                    setData(prev => {
                        const newKPIList = [...prev.kpiList];
                        const newChecks = [...newKPIList[kpiIndex].checks];
                        newChecks[checkIndex] = isCurrentlyChecked;
                        
                        newKPIList[kpiIndex] = {
                            ...newKPIList[kpiIndex],
                            checks: newChecks
                        };
    
                        return {
                            ...prev,
                            kpiList: newKPIList
                        };
                    });
                    return;
                }
            }
    
            await fetchKPIData();
        } catch (error) {
            console.error('Error handling KPI check:', error);
            // Kembalikan state jika terjadi error
            setData(prev => {
                const newKPIList = [...prev.kpiList];
                const newChecks = [...newKPIList[kpiIndex].checks];
                newChecks[checkIndex] = isCurrentlyChecked;
                
                newKPIList[kpiIndex] = {
                    ...newKPIList[kpiIndex],
                    checks: newChecks
                };
    
                return {
                    ...prev,
                    kpiList: newKPIList
                };
            });
        }
    };
      

    function formatNumberWithDots(number) {
        if (number == null) return "0";
        
        const num = typeof number === 'string' ? parseFloat(number) : number;

        return num.toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    function formatPercentage(number) {
        if (number == null) return "0";
        const num = typeof number === 'string' ? parseFloat(number) : number;

        return num.toFixed(2);
    }


    const handleMonthChange = async (e) => {
        const value = e.target.value; 
        const [year, month] = value.split('-');
        
        setSelectedMonth(month);
        setSelectedYear(year);
        setStartDate(value);
        
        // Tutup modal setelah memilih bulan
        setIsModalOpen(false);
        
        try {
            // Fetch data baru setelah bulan berubah
            const response = await api.get(`/kpi-karyawan/${id}/${month}/${year}/karyawan`);
            
            if (response.data.success) {
                const apiData = response.data.data;
                
                setData(prev => {
                    const updatedKPIList = prev.kpiList.map(kpi => {
                        const karyawanKPI = apiData.result.find(k => k.kpi_id === kpi.kpi_id);
                        
                        if (karyawanKPI) {
                            let newChecks;
                            let checkIds = {};
    
                            if (kpi.waktu === 'Harian') {
                                newChecks = Array(moment(value).daysInMonth()).fill(false);
                            } else if (kpi.waktu === 'Mingguan') {
                                newChecks = Array(4).fill(false);
                            } else {
                                newChecks = [false];
                            }
                            
                            if (karyawanKPI.kpiKaryawanList) {
                                karyawanKPI.kpiKaryawanList.forEach(item => {
                                    newChecks[item.point_ke - 1] = true;
                                    checkIds[item.point_ke - 1] = item.kpi_karyawan_id;
                                });
                            }
    
                            return {
                                ...kpi,
                                checks: newChecks,
                                checkIds: checkIds,
                                stats: {
                                    tercapai: karyawanKPI.tercapai,
                                    tidakTercapai: karyawanKPI.tidakTercapai,
                                    percentage: parseFloat(karyawanKPI.persentaseTercapai).toFixed(2),
                                    bonus: karyawanKPI.bonusDiterima
                                }
                            };
                        }
                        return kpi;
                    });
    
                    return {
                        ...prev,
                        kpiList: updatedKPIList,
                        totalPercentage: apiData.totalPersentaseTercapai,
                        bonus: apiData.totalBonusDiterima
                    };
                });
            }
        } catch (error) {
            console.error('Error fetching KPI data:', error);
        }
    };

      useEffect(() => {
        setDaysInMonth(moment(startDate).daysInMonth());
      }, [startDate]);


    return(
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions} showAddNoteButton={true}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                    <div className="w-full md:w-auto">
                        <Button label={`${formatDate(startDate)}`} icon={<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.59961 1V4.2M11.9996 1V4.2" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14.3996 2.60004H3.19961C2.31595 2.60004 1.59961 3.31638 1.59961 4.20004V15.4C1.59961 16.2837 2.31595 17 3.19961 17H14.3996C15.2833 17 15.9996 16.2837 15.9996 15.4V4.20004C15.99961 3.31638 15.2833 2.60004 14.3996 2.60004Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1.59961 7.39996H15.9996" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>} bgColor="border border-secondary" hoverColor="hover:bg-white" textColor="text-black" onClick={toggleModal} />
                    </div>
                    </div>

                    {/* Modal */}
                    {isModalOpen && (
                    <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                        <div className="relative flex flex-col items-start p-6 space-y-4 bg-white rounded-lg shadow-md max-w-lg">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex space-x-4 w-full">
                            <div className="flex flex-col w-full">
                            <label className="text-sm font-medium text-gray-600 pb-3">Pilih Bulan KPI</label>
                            <input
                                type="month"
                                value={startDate}
                                onChange={handleMonthChange}
                                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            </div>
                        </div>

                        </div>
                    </div>
                    )}
                </section>

                <section className="mt-5 bg-primary text-white rounded-xl">
                    <div className="p-5 flex justify-between items-center flex-wrap">
                        {/* Bagian Akumulasi KPI */}
                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                        <img src="/icon/akumulasi.svg" alt="akumulasi" className="w-10 h-10" />
                        <div className="flex flex-col">
                            <p className="text-sm">Akumulasi Persentase KPI Tercapai</p>
                            <p className="font-bold text-lg">{formatPercentage(data.totalPercentage)}%</p>
                        </div>
                        </div>

                        {/* Bagian Bonus Diterima */}
                        <div className="flex flex-col items-end w-full sm:w-auto mt-4 sm:mt-0">
                        <p className="text-sm">Bonus Diterima</p>
                        <p className="font-bold text-lg">Rp{formatNumberWithDots(data.bonus)}</p>
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-8 space-y-5 sm:space-y-0 pb-5 border-b border-secondary">
                        {/* Profile Section */}
                        <div className="flex items-center space-x-4">
                            <img
                                src={`${import.meta.env.VITE_API_URL}/images-karyawan/${data.profile.image}`}
                                alt="profile"
                                className="w-20 h-20 rounded-full"
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="w-full">
                            <div className="flex flex-col sm:flex-row sm:space-x-8 w-full">
                                <div className="flex items-center space-x-2">
                                    <img src="/icon/call.svg" alt="call" className="w-5 h-5" />
                                    <p className="text-secondary">{data.profile.phone}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icon/mail.svg" alt="email" className="w-5 h-5" />
                                    <p className="text-secondary">{data.profile.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 w-full mt-5">

                                <div className="">
                                    <p className="text-sm text-gray-500">Nama</p>
                                    <p className="font-bold">{data.profile.name}</p>
                                </div>

                                <div className="">
                                    <p className="text-sm text-gray-500">Toko/Cabang</p>
                                    <p className="font-bold">{data.profile.department}</p>
                                </div>

                                <div className="">
                                    <p className="text-sm text-gray-500">Divisi</p>
                                    <p className="font-bold">{data.profile.role}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Information Section */}
                    <div className="py-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="">
                                <p className="text-sm text-gray-500">Kehadiran</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.stats.kehadiran)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Izin/Cuti</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.stats.izin)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Tidak Ada Kejelasan</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.stats.tanpakejelasan)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Total Bonus Yang Diterima</p>
                                <p className="font-bold">Rp{formatNumberWithDots(data.profile.stats.totalBonus)}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* kpi 1 */}
                {data.kpiList.map((kpi, index) => (
                    <section key={kpi.kpi_id} className="mt-5 bg-white rounded-xl">
                        <div className="p-5">
                            <p className="text-gray-500 text-sm">Persentase: {kpi.percentage}%</p>
                            <p className="text-primary font-bold">KPI{index + 1} - {kpi.title}</p>
                        </div>

                        <section>
                            <p className="text-center font-bold">Bulan {moment(startDate).format("MMMM")}</p>
                            
                            {kpi.waktu === 'Harian' && (
                                <div className="grid text-center grid-cols-10 gap-10 p-5">
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                        <label key={day} className="">
                                            <div className="text-sm mb-1">{day}</div>
                                            <input
                                                type="checkbox"
                                                checked={kpi.checks[day - 1]}
                                                onChange={() => handleKPICheck(index, day - 1)}
                                                className="w-4 h-4"
                                            />
                                        </label>
                                    ))}
                                </div>
                            )}

                            {kpi.waktu === 'Mingguan' && (
                                <div className="grid text-center grid-cols-4 pb-2">
                                    {Array.from({ length: 4 }, (_, i) => i + 1).map(week => (
                                        <label key={week} className="">
                                            <div className="">Minggu {week}</div>
                                            <input
                                                type="checkbox"
                                                checked={kpi.checks[week - 1]}
                                                onChange={() => handleKPICheck(index, week - 1)}
                                                className="w-4 h-4"
                                            />
                                        </label>
                                    ))}
                                </div>
                            )}

                            {kpi.waktu === 'Bulanan' && (
                                <div className="flex justify-center mb-4">
                                    <label className="text-center">
                                        <div className="mr-2">Bulan {moment(startDate).format("MMMM")}</div>
                                        <input
                                            type="checkbox"
                                            checked={kpi.checks[0]}
                                            onChange={() => handleKPICheck(index, 0)}
                                            className="w-4 h-4"
                                        />
                                    </label>
                                </div>
                            )}

                            <div className="mt-5 p-5">
                                <div className="flex bg-pink rounded-xl p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 w-full">
                                        <div className="flex flex-col">
                                            <p className="text-sm text-primary">Tercapai</p>
                                            <p className="text-primary font-bold text-lg">{kpi.stats.tercapai}</p>
                                        </div>

                                        <div className="flex flex-col">
                                            <p className="text-sm text-primary">Tidak Tercapai</p>
                                            <p className="text-primary font-bold text-lg">{kpi.stats.tidakTercapai}</p>
                                        </div>

                                        <div className="flex flex-col">
                                            <p className="text-sm text-primary">Persentase Tercapai</p>
                                            <p className="text-primary font-bold text-lg">{formatPercentage(kpi.stats.percentage)}%</p>
                                        </div>
                                    </div>

                                    <div className="text-end w-1/5">
                                        <div className="">
                                            <p className="text-sm text-primary text-start">Bonus Yang Diterima</p>
                                            <p className="text-primary font-bold text-start">
                                                Rp{formatNumberWithDots(kpi.stats.bonus)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </section>
                ))}

            </div>
        </LayoutWithNav>
        </>
    )
}