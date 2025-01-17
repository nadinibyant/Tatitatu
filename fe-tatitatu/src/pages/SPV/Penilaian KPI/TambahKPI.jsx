import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Button from "../../../components/Button";
import { useEffect, useState } from "react";
import moment from "moment";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function TambahKPI(){
    const location = useLocation()
    const {id} = location.state || {}
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("MM-DD"));
    const [daysInMonth, setDaysInMonth] = useState(moment(startDate).daysInMonth()); 

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
        totalPercentage: 80.35,
        bonus: 30000,
        profile: {
        phone: "081357897222239",
        email: "example@gmail.com",
        name: "Hamzah Abdillah Arif",
        role: "Content Creator",
        department: "Tatitatu/GOR. Haji Agus Salim",
        stats: {
            kehadiran: 17,
            izin: 1,
            tanpakejelasan: 10,
            totalBonus: 500000
        }
        },
        kpi1: {
        title: "Ketepatan Waktu Datang",
        percentage: 35,
        checkedDays: [
            true, true, true, true, true, true, true, true, true, true, 
            false, false, false, false, false, false, false, false, false, false,
            false, false, false, false, false, false, false, false, false, false,
            false, false, false, false, false, false, false             
        ],
        stats: {
            tercapai: 28,
            tidakTercapai: 3,
            percentage: 8.35,
            bonus: 30000
        }
        },
        kpi2: {
        title: "Gokil Parah",
        percentage: 40,
        weeks: [
            true, true, true, false           
        ],
        stats: {
            tercapai: 3,
            tidakTercapai: 1,
            percentage: 8.35,
            bonus: 30000
        }
        },
        kpi3: {
        title: "Pecah Parah",
        percentage: 50,
        monthlyCheck: false,
        stats: {
            tercapai: 28,
            tidakTercapai: 3,
            percentage: 8.35,
            bonus: 30000
        }
        }
    });

    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    const handleDayCheck = (day) => {
        setData((prev) => {
          const newCheckedDays = [...prev.kpi1.checkedDays];
          newCheckedDays[day - 1] = !newCheckedDays[day - 1];

          const updatedData = {
            ...prev,
            kpi1: {
              ...prev.kpi1,
              checkedDays: newCheckedDays
            }
          };
          
          const newStats = calculateKPI1Stats();

          return {
            ...updatedData,
            kpi1: {
              ...updatedData.kpi1,
              stats: newStats
            }
          };
        });
      };
      
      const handleWeekCheck = (week) => {
        setData(prev => {
          const newWeeks = [...prev.kpi2.weeks];
          newWeeks[week - 1] = !newWeeks[week - 1];
          
          const newStats = calculateKPI2Stats();
          
          return {
            ...prev,
            kpi2: {
              ...prev.kpi2,
              weeks: newWeeks,
              stats: newStats
            }
          };
        });
      };
      
      const handleMonthCheck = () => {
        setData(prev => {
          const newMonthlyCheck = !prev.kpi3.monthlyCheck;
          
          const newStats = calculateKPI3Stats();
          
          return {
            ...prev,
            kpi3: {
              ...prev.kpi3,
              monthlyCheck: newMonthlyCheck,
              stats: newStats
            }
          };
        });
      };

      useEffect(() => {
        const kpi1Stats = calculateKPI1Stats();
        const kpi2Stats = calculateKPI2Stats();
        const kpi3Stats = calculateKPI3Stats();
        
        const totalBonus = kpi1Stats.bonus + kpi2Stats.bonus + kpi3Stats.bonus;
        const totalPercentage = (
          (Number(kpi1Stats.percentage) + Number(kpi2Stats.percentage) + Number(kpi3Stats.percentage)) / 3
        ).toFixed(2);
        
        setData(prev => ({
          ...prev,
          totalPercentage,
          bonus: totalBonus
        }));
      }, [data.kpi1.checkedDays, data.kpi2.weeks, data.kpi3.monthlyCheck]);

      useEffect(() => {
        setDaysInMonth(moment(startDate).daysInMonth());
      }, [startDate]);

      const calculateKPI1Stats = () => {
        const totalDays = data.kpi1.checkedDays.length;
        
        const tercapai = data.kpi1.checkedDays.filter(day => day).length;
        
        const tidakTercapai = totalDays - tercapai;
        
        const percentage = (tercapai / totalDays) * data.kpi1.percentage;
        
        // Hitung bonus
        const bonus = (data.kpi1.percentage / 100) * tercapai * 50000;
      
        return {
          tercapai, 
          tidakTercapai, 
          percentage: percentage.toFixed(2),
          bonus
        };
      };
      
      const calculateKPI2Stats = () => {
        const totalWeeks = data.kpi2.weeks.length;
        const tercapai = data.kpi2.weeks.filter(week => week).length;
        const tidakTercapai = totalWeeks - tercapai;
        const percentage = (tercapai / totalWeeks) * data.kpi2.percentage;
        const bonus = (data.kpi2.percentage / 100) * tercapai * 200000;
      
        return {
          tercapai,
          tidakTercapai,
          percentage: percentage.toFixed(2),
          bonus
        };
      };
      
      const calculateKPI3Stats = () => {
        const tercapai = data.kpi3.monthlyCheck ? 1 : 0;
        const tidakTercapai = data.kpi3.monthlyCheck ? 0 : 1;
        const percentage = tercapai * data.kpi3.percentage;
        const bonus = (data.kpi3.percentage / 100) * tercapai * 1000000;
      
        return {
          tercapai,
          tidakTercapai,
          percentage: percentage.toFixed(2),
          bonus
        };
      };

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
                            <p className="font-bold text-lg">{data.totalPercentage}%</p>
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
                                src="https://via.placeholder.com/50"
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
                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <p className="text-gray-500 text-sm">Persentase: {data.kpi1.percentage}%</p>
                        <p className="text-primary font-bold">KPI1 - Ketepatan Waktu Datang</p>
                    </div>

                    <section>
                        <p className="text-center font-bold">Bulan {moment(startDate).format("MMMM")}</p>
                        <div className="grid text-center grid-cols-10 gap-10 p-5">
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                <label key={day} className="">
                                    <div className="text-sm mb-1">{day}</div>
                                    <input
                                    type="checkbox"
                                    checked={data.kpi1.checkedDays[day - 1]}
                                    onChange={() => handleDayCheck(day)}
                                    className="w-4 h-4"
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="mt-5 p-5">
                            <div className="flex bg-pink rounded-xl p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-4 w-full">
                                    {/* Tercapai */}
                                    <div className="flex flex-col">
                                        <p className="text-sm text-primary">Tercapai</p>
                                        <p className="text-primary font-bold text-lg">{data.kpi1.checkedDays.filter(day => day).length}</p>
                                    </div>

                                    {/* Tidak Tercapai */}
                                    <div className="flex flex-col">
                                        <p className="text-sm text-primary">Tidak Tercapai</p>
                                        <p className="text-primary font-bold text-lg">
                                            {data.kpi1.checkedDays.length - data.kpi1.checkedDays.filter(day => day).length}
                                        </p>
                                    </div>

                                    {/* Persentase Tercapai */}
                                    <div className="flex flex-col">
                                        <p className="text-sm text-primary">Persentase Tercapai</p>
                                        <p className="text-primary font-bold text-lg">
                                            {((data.kpi1.checkedDays.filter(day => day).length / data.kpi1.checkedDays.length) * data.kpi1.percentage).toFixed(2)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Bonus Yang Diterima */}
                                <div className="text-end w-1/5">
                                    <div className="">
                                        <p className="text-sm text-primary text-start">Bonus Yang Diterima</p>
                                        <p className="text-primary font-bold text-start">
                                            Rp{formatNumberWithDots((data.kpi1.percentage / 100) * data.kpi1.checkedDays.filter(day => day).length * 50000)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>

                {/* kpi2 */}
                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <p className="text-gray-500 text-sm">Persentase: {data.kpi2.percentage}%</p>
                        <p className="text-primary font-bold">KPI2 - Gokil Parah</p>
                    </div>

                    <section>
                        <p className="text-center pb-10 font-bold">Bulan {moment(startDate).format("MMMM")}</p>
                        <div className="grid text-center grid-cols-4 pb-2">
                            {Array.from({ length: 4 }, (_, i) => i + 1).map(week => (
                            <label key={week} className="">
                                <div className="">Minggu {week}</div>
                                <input
                                type="checkbox"
                                checked={data.kpi2.weeks[week - 1]}
                                onChange={() => handleWeekCheck(week)}
                                className="w-4 h-4"
                                />
                            </label>
                            ))}
                        </div>

                        <div className="mt-5 p-5">
                            <div className="flex bg-pink rounded-xl p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-4 w-full">
                                    {/* Tercapai */}
                                    <div className="flex flex-col">
                                        <p className="text-sm text-primary">Tercapai</p>
                                        <p className="text-primary font-bold text-lg">{data.kpi2.weeks.filter(week => week).length}</p>
                                    </div>

                                    {/* Tidak Tercapai */}
                                    <div className="flex flex-col">
                                        <p className="text-sm text-primary">Tidak Tercapai</p>
                                        <p className="text-primary font-bold text-lg">
                                            {data.kpi2.weeks.length - data.kpi2.weeks.filter(week => week).length}
                                        </p>
                                    </div>

                                    {/* Persentase Tercapai */}
                                    <div className="flex flex-col">
                                        <p className="text-sm text-primary">Persentase Tercapai</p>
                                        <p className="text-primary font-bold text-lg">
                                            {((data.kpi2.weeks.filter(week => week).length / data.kpi2.weeks.length) * data.kpi2.percentage).toFixed(2)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Bonus Yang Diterima */}
                                <div className="text-end w-1/5">
                                    <div className="">
                                        <p className="text-sm text-primary text-start">Bonus Yang Diterima</p>
                                        <p className="text-primary font-bold text-start">
                                            Rp{formatNumberWithDots((data.kpi2.percentage / 100) * data.kpi2.weeks.filter(week => week).length * 200000)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>

                {/* kpi3 */}
                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <p className="text-gray-500 text-sm">Persentase: {data.kpi3.percentage}%</p>
                        <p className="text-primary font-bold">KPI3 - Pecah Parah</p>
                    </div>

                    <section>
                        <p className="text-center pb-10 font-bold">Desember</p>
                        <div className="flex justify-center mb-4">
                            <label className="text-center">
                            <div className="mr-2">Bulan Desember</div>
                            <input
                                type="checkbox"
                                checked={data.kpi3.monthlyCheck}
                                onChange={handleMonthCheck}
                                className="w-4 h-4"
                            />
                            </label>
                        </div>

                        <div className="mt-5 p-5">
                            <div className="flex bg-pink rounded-xl p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-4 w-full">
                                    {/* Tercapai */}
                                    <div className="flex flex-col">
                                        <p className="text-sm text-primary">Tercapai</p>
                                        <p className="text-primary font-bold text-lg">{data.kpi3.monthlyCheck ? 1 : 0}</p>
                                    </div>

                                    {/* Tidak Tercapai */}
                                    <div className="flex flex-col">
                                        <p className="text-sm text-primary">Tidak Tercapai</p>
                                        <p className="text-primary font-bold text-lg">{data.kpi3.monthlyCheck ? 0 : 1}</p>
                                    </div>

                                    {/* Persentase Tercapai */}
                                    <div className="flex flex-col">
                                        <p className="text-sm text-primary">Persentase Tercapai</p>
                                        <p className="text-primary font-bold text-lg">
                                            {data.kpi3.monthlyCheck ? data.kpi3.percentage : 0}%
                                        </p>
                                    </div>
                                </div>

                                {/* Bonus Yang Diterima */}
                                <div className="text-end w-1/5">
                                    <div className="">
                                        <p className="text-sm text-primary text-start">Bonus Yang Diterima</p>
                                        <p className="text-primary font-bold text-start">
                                            Rp{formatNumberWithDots((data.kpi3.percentage / 100) * (data.kpi3.monthlyCheck ? 1 : 0) * 1000000)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>

            </div>
        </LayoutWithNav>
        </>
    )
}