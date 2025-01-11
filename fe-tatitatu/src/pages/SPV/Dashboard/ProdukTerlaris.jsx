import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function ProdukTerlaris() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedJenis, setSelectedJenis] = useState("Semua");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [selectedStore, setSelectedStore] = useState("Semua");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const userData = JSON.parse(localStorage.getItem('userData'));
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';

  useEffect(() => {
    setSelectedStore("Semua");
  }, []);

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilter = () => {
    setIsFilterModalOpen(false);
  };

  const handleToday = () => {
    const today = moment().startOf("day");
    setStartDate(today.format("YYYY-MM-DD"));
    setEndDate(today.format("YYYY-MM-DD"));
    setIsModalOpen(false);
  };

  const handleLast7Days = () => {
    const today = moment().startOf("day");
    const sevenDaysAgo = today.clone().subtract(7, "days");
    setStartDate(sevenDaysAgo.format("YYYY-MM-DD"));
    setEndDate(today.format("YYYY-MM-DD"));
    setIsModalOpen(false);
  };

  const handleThisMonth = () => {
    const startMonth = moment().startOf("month");
    const endMonth = moment().endOf("month");
    setStartDate(startMonth.format("YYYY-MM-DD"));
    setEndDate(endMonth.format("YYYY-MM-DD"));
    setIsModalOpen(false);
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const dataCabang = [
    { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' },
    { label: 'Gor Agus', value: 'Gor Agus', icon: '/icon/toko.svg' },
    { label: 'Lubeg', value: 'Lubeg', icon: '/icon/toko.svg' },
  ];

  const data = {
    dashboard: {
        barang_handmade: {
          nama: 'Mutiara Hitam',
          jumlah: 100
        },
        barang_non_handmade: {
          nama: 'Gelang Besi',
          jumlah: 500
        },
        packging: {
          nama: 'Zipper',
          jumlah: 12000
        },
        barang_custom: {
          nama: 'Butiran Debu',
          jumlah: 10000
        },
    },
    data_handmade: {
        data: [
          {
            id: 1,
            Nama: "Mutiara Hitam",
            Kategori: "Gelang",
            id_kategori: 1,
            Jenis: "Barang Handmade",
            id_jenis: 1,
            Terjual: 100,
            Tanggal: "2024-12-12",
            Cabang: "Gor Agus"
          },
          {
            id: 2,
            Nama: "Mutiara Hitam",
            Kategori: "Gelang",
            id_kategori: 1,
            Jenis: "Barang Handmade",
            id_jenis: 1,
            Terjual: 100,
            Tanggal: "2024-12-13",
            Cabang: "Lubeg"
          },
          {
            id: 3,
            Nama: "Mutiara Hitam",
            Kategori: "Gelang",
            id_kategori: 1,
            Jenis: "Barang Handmade",
            id_jenis: 1,
            Terjual: 100,
            Tanggal: "2024-12-14",
            Cabang: "Gor Agus"
          },
        ]
      },
      data_non_handmade: {
        data: [
          {
            id: 1,
            Nama: "Gelang Besi",
            Kategori: "Gelang",
            id_kategori: 1,
            Jenis: "Barang Non-Handmade",
            id_jenis: 2,
            Terjual: 150,
            Tanggal: "2024-12-12",
            Cabang: "Lubeg"
          },
        ]
      },
      data_custom: {
        data: [
          {
            id: 1,
            Nama: "Butiran Debu",
            Kategori: "Packaging",
            id_kategori: 3,
            Jenis: "Barang Custom",
            id_jenis: 3,
            Terjual: 200,
            Tanggal: "2024-12-12",
            Cabang: "Gor Agus"
          },
        ]
    },
    barang_terlaris: [
      {
        Foto: 'https://via.placeholder.com/150',
        "Nama Barang": 'Mutiara Hitam',
        Terjual: 6000,
        Tanggal: "2024-12-12",
        Cabang: "Gor Agus"
      },
      {
        Foto: 'https://via.placeholder.com/150',
        "Nama Barang": 'Gelang Besi',
        Terjual: 1000,
        Tanggal: "2024-12-13",
        Cabang: "Lubeg"
      }
    ]
  };

  const headers = [
    { label: "#", key: "nomor", align: "text-left" },
    { label: "Nama", key: "Nama", align: "text-center" },
    { label: "Kategori", key: "Kategori", align: "text-left" },
    { label: "Jenis", key: "Jenis", align: "text-left" },
    { label: "Terjual", key: "Terjual", align: "text-center" },
  ];

  const headers2 = [
    { label: "#", key: "nomor", align: "text-left" },
    { label: "Foto", key: "Foto", align: "text-left" },
    { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
    { label: "Terjual", key: "Terjual", align: "text-center" },
  ]

  const filteredData = () => {
    let dataToDisplay = [];

    // Apply filter for 'Jenis'
    if (selectedJenis === "Semua") {
      // Combine all data when "Semua" is selected
      dataToDisplay = [
        ...data.data_handmade.data,
        ...data.data_non_handmade.data,
        ...data.data_custom.data,
      ];
    } else if (selectedJenis === "Barang Handmade") {
      dataToDisplay = data.data_handmade.data;
    } else if (selectedJenis === "Barang Non-Handmade") {
      dataToDisplay = data.data_non_handmade.data;
    } else if (selectedJenis === "Barang Custom") {
      dataToDisplay = data.data_custom.data;
    }

    // Apply filter for 'Kategori'
    if (selectedKategori !== "Semua") {
      dataToDisplay = dataToDisplay.filter(item => item.Kategori === selectedKategori);
    }

    return dataToDisplay;
  };

  const filterFields = isOwner ? [
    {
        label: "Kategori",
        key: "Kategori",
        options: [
            { label: "Semua", value: "Semua" },
            { label: "Gelang", value: "Gelang" },
            { label: "Cincin", value: "Cincin" },
            { label: "Anting", value: "Anting" },
            { label: "Tas", value: "Tas" },
        ]
    }
] : [
    {
        label: "Jenis",
        key: "Jenis",
        options: [
            { label: "Semua", value: "Semua" },
            { label: "Barang Handmade", value: "Barang Handmade" },
            { label: "Barang Non-Handmade", value: "Barang Non-Handmade" },
            { label: "Barang Custom", value: "Barang Custom" },
        ]
    },
    {
        label: "Kategori",
        key: "Kategori",
        options: [
            { label: "Semua", value: "Semua" },
            { label: "Gelang", value: "Gelang" },
            { label: "Cincin", value: "Cincin" },
            { label: "Anting", value: "Anting" },
            { label: "Tas", value: "Tas" },
        ]
    }
];

  const selectedData = filteredData().filter((item) => {
    const isStoreMatch = selectedStore === "Semua" || item.Cabang === selectedStore;
    const itemDate = moment(item.Tanggal);
    const isDateMatch = itemDate.isBetween(startDate, endDate, null, "[]");

    return isStoreMatch && isDateMatch;
  });

  function formatNumberWithDots(number) {
    return number.toLocaleString('id-ID');
  }

  return (
    <>
      <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
        <div className="p-5">
          <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
            <div className="left w-full md:w-auto">
              <p className="text-primary text-base font-bold">
                  {isOwner ? 'Produk Terlaris Perusahaan' : 'Produk Terlaris'}
              </p>
            </div>

            <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
              <div className="w-full md:w-auto">
                  <Button 
                      label="Export" 
                      icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                      </svg>} 
                      bgColor="border border-secondary" 
                      hoverColor="hover:bg-white" 
                      textColor="text-black" 
                  />
              </div>
              {/* ButtonDropdown untuk cabang hanya muncul jika bukan headgudang */}
              {!isHeadGudang && (
                  <div className="w-full md:w-auto">
                      <ButtonDropdown 
                          selectedIcon={'/icon/toko.svg'} 
                          options={dataCabang} 
                          onSelect={(value) => setSelectedStore(value)} 
                      />
                  </div>
              )}
              <div className="w-full md:w-auto">
                  <Button 
                      label={`${formatDate(startDate)} - ${formatDate(endDate)}`} 
                      icon={<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.59961 1V4.2M11.9996 1V4.2" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14.3996 2.60004H3.19961C2.31595 2.60004 1.59961 3.31638 1.59961 4.20004V15.4C1.59961 16.2837 2.31595 17 3.19961 17H14.3996C15.2833 17 15.9996 16.2837 15.9996 15.4V4.20004C15.99961 3.31638 15.2833 2.60004 14.3996 2.60004Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M1.59961 7.39996H15.9996" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>} 
                      bgColor="border border-secondary" 
                      hoverColor="hover:bg-white" 
                      textColor="text-black" 
                      onClick={toggleModal} 
                  />
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
                      <label className="text-sm font-medium text-gray-600 pb-3">Dari</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label className="text-sm font-medium text-gray-600 pb-3">Ke</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3 w-full">
                    <button
                      onClick={handleToday}
                      className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                    >
                      Hari Ini
                    </button>
                    <button
                      onClick={handleLast7Days}
                      className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                    >
                      7 Hari Terakhir
                    </button>
                    <button
                      onClick={handleThisMonth}
                      className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                    >
                      Bulan Ini
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="mt-5 bg-white rounded-xl">
            <div className="p-5">
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* handmade */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-sm">Barang Handmade Terlaris</p>
                                <p className="font-bold text-lg truncate">{data.dashboard.barang_handmade.nama}</p>
                                <p>{formatNumberWithDots(data.dashboard.barang_handmade.jumlah)} Pcs</p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <img src="/Dashboard Produk/handmade.svg" alt="handmade" className="w-12 h-12" />
                            </div>
                        </div>
                    </div>

                    {/* non handmade */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-sm">Barang Non-Handmade Terlaris</p>
                                <p className="font-bold text-lg truncate">{data.dashboard.barang_non_handmade.nama}</p>
                                <p>{formatNumberWithDots(data.dashboard.barang_non_handmade.jumlah)} Pcs</p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <img src="/Dashboard Produk/nonhandmade.svg" alt="nonhandmade" className="w-12 h-12" />
                            </div>
                        </div>
                    </div>

                    {/* packaging */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-sm">Packaging Terlaris</p>
                                <p className="font-bold text-lg truncate">{data.dashboard.packging.nama}</p>
                                <p>{formatNumberWithDots(data.dashboard.packging.jumlah)} Pcs</p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <img src="/Dashboard Produk/packaging.svg" alt="packaging" className="w-12 h-12" />
                            </div>
                        </div>
                    </div>

                    {/* custom */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-sm">Barang Custom Terlaris</p>
                                <p className="font-bold text-lg truncate">{data.dashboard.barang_custom.nama}</p>
                                <p>{formatNumberWithDots(data.dashboard.barang_custom.jumlah)} Pcs</p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <img src="/Dashboard Produk/custom.svg" alt="Custom" className="w-12 h-12" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


          <section className="mt-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5">
                      <Table
                          headers={headers}
                          data={selectedData.map((item, index) => ({
                              ...item,
                              nomor: index + 1,
                              Terjual: `${item.Terjual} Pcs`,
                          }))}
                          hasFilter={true}
                          onFilterClick={handleFilterClick}
                      />
                  </div>

                  <div className="bg-white rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base">
                            {isOwner ? '10 Barang Terlaris di Perusahaan' : '10 Barang Terlaris di Toko'}
                        </h3>
                      </div>
                      <Table
                          headers={headers2}
                          data={data.barang_terlaris.map((item, index) => ({
                              ...item,
                              "Foto": <img src={item["Foto"]} className="w-8 h-8 object-cover rounded-lg" />,
                              nomor: index + 1,
                              Terjual: `${formatNumberWithDots(item.Terjual)} Pcs`,
                          }))}
                          bg_header="bg-none"
                          text_header="text-gray-400"
                          hasSearch={false}
                          hasPagination={false}
                      />
                  </div>
              </div>
          </section>
        </div>
        {/* Filter Modal */}
        {isFilterModalOpen && (
            <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
              <div className="relative flex flex-col items-start p-6 space-y-4 border w-full bg-white rounded-lg shadow-md max-w-lg">
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold mb-4">Filter</h2>
                <form className="w-full" onSubmit={(e) => { e.preventDefault(); handleApplyFilter(); }}>
                  {filterFields.map((field, index) => (
                    <div className="mb-4" key={index}>
                      <label className="block text-gray-700 font-medium mb-2">
                        {field.label}
                      </label>
                      <ButtonDropdown
                        options={field.options}
                        selectedStore={field.key === "Jenis" ? selectedJenis : selectedKategori}
                        onSelect={(value) => field.key === "Jenis" ? setSelectedJenis(value) : setSelectedKategori(value)}
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="py-2 px-4 w-full bg-primary text-white rounded-md hover:bg-white hover:border hover:border-primary hover:text-black focus:outline-none"
                  >
                    Terapkan
                  </button>
                </form>
              </div>
            </div>
          )}
      </LayoutWithNav>
    </>
  );
}
