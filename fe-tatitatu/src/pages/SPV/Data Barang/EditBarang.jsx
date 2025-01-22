import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import ButtonDropdown from "../../../components/ButtonDropdown";
import FileInput from "../../../components/FileInput";
import Input from "../../../components/Input";
import { menuItems, userOptions } from "../../../data/menu";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import { useParams, useNavigate } from "react-router-dom";

export default function EditBarang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCabang, setSelectedCabang] = useState("GOR HAS");
  
  const breadcrumbItems = [
    { label: "Daftar Barang Handmade", href: "/dataBarang/handmade" },
    { label: "Edit", href: "" },
  ];

  const dataKategori = [
    { label: "Gelang", value: "Gelang" },
    { label: "Cincin", value: "Cincin" },
    { label: "Anting-Anting", value: "Anting-Anting" },
  ];

  const headers = [
    { label: "No", key: "No", align: "text-left" },
    { label: "Nama Biaya", key: "Nama Biaya", align: "text-left" },
    { label: "Jumlah Biaya", key: "Jumlah Biaya", align: "text-left" },
    { label: "", key: "Aksi", align: "text-left" },
  ];

  const dataCabangOptions = [
    { label: "GOR HAS", value: "GOR HAS" },
    { label: "Lubeg", value: "Lubeg" },
    { label: "Bypass", value: "Bypass" }
  ];

  const [rincianBiayaPerCabang, setRincianBiayaPerCabang] = useState({
    "GOR HAS": [
      {
        id: 1,
        "Nama Biaya": "Biaya Operasional dan Staff GOR. Haji Agus Salim",
        "Jumlah Biaya": 24000,
        isEditable: false,
      },
      {
        id: 2,
        "Nama Biaya": "Modal",
        "Jumlah Biaya": 24000,
        isEditable: true,
      },
      {
        id: 3,
        "Nama Biaya": "Packaging",
        "Jumlah Biaya": 4000,
        isEditable: true,
      }
    ],
    "Lubeg": [
      {
        id: 1,
        "Nama Biaya": "Biaya Operasional dan Staff Lubeg",
        "Jumlah Biaya": 20000,
        isEditable: false,
      }
    ],
    "Bypass": [
      {
        id: 1,
        "Nama Biaya": "Biaya Operasional dan Staff Bypass",
        "Jumlah Biaya": 22000,
        isEditable: false,
      }
    ]
  });

  const [data, setData] = useState({
    info_barang: {
      Nomor: "1910111",
      "Nama Barang": "Gelang Matahari",
      Kategori: "Gelang",
      "Jumlah Minimum Stok": "17",
      Foto: null,
      "Total HPP": 0,
      Keuntungan: 0,
      "Harga Jual": 20000,
    },
    hargaPerCabang: {
      "GOR HAS": { totalHPP: 52000, hargaJual: 65000, keuntungan: 13000 },
      "Lubeg": { totalHPP: 20000, hargaJual: 30000, keuntungan: 10000 },
      "Bypass": { totalHPP: 22000, hargaJual: 32000, keuntungan: 10000 }
    }
  });

  useEffect(() => {
    // Here you would typically fetch the existing data using the id
    // and populate the state
    console.log("Fetching data for id:", id);
  }, [id]);

  const calculateTotalHPP = (cabang) => {
    return rincianBiayaPerCabang[cabang]?.reduce(
      (sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0),
      0
    ) || 0;
  };

  const calculateKeuntungan = (hargaJual, totalHPP) => {
    return (hargaJual || 0) - (totalHPP || 0);
  };

  useEffect(() => {
    const totalHPP = calculateTotalHPP(selectedCabang);
    const keuntungan = calculateKeuntungan(
      data.hargaPerCabang[selectedCabang].hargaJual,
      totalHPP
    );

    setData((prevData) => ({
      ...prevData,
      hargaPerCabang: {
        ...prevData.hargaPerCabang,
        [selectedCabang]: {
          ...prevData.hargaPerCabang[selectedCabang],
          totalHPP,
          keuntungan
        }
      }
    }));
  }, [selectedCabang, rincianBiayaPerCabang, data.hargaPerCabang[selectedCabang].hargaJual]);

  const handleInfoBarangChange = (key, value) => {
    setData((prevData) => ({
      ...prevData,
      info_barang: {
        ...prevData.info_barang,
        [key]: value,
      },
    }));
  };

  const handleHargaJualChange = (cabang, value) => {
    const numValue = Number(value) || 0;
    const totalHPP = calculateTotalHPP(cabang);
    const keuntungan = calculateKeuntungan(numValue, totalHPP);

    setData((prevData) => ({
      ...prevData,
      hargaPerCabang: {
        ...prevData.hargaPerCabang,
        [cabang]: {
          ...prevData.hargaPerCabang[cabang],
          hargaJual: numValue,
          keuntungan
        }
      }
    }));
  };

  const handleInputChange = (cabang, rowIndex, key, value) => {
    setRincianBiayaPerCabang(prevData => ({
      ...prevData,
      [cabang]: prevData[cabang].map((row, index) =>
        index === rowIndex ? { ...row, [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value } : row
      )
    }));
  };

  const handleDeleteRow = (cabang, rowId) => {
    setRincianBiayaPerCabang(prevData => ({
      ...prevData,
      [cabang]: prevData[cabang].filter(row => row.id !== rowId)
    }));
  };

  const handleAddRow = (cabang) => {
    const newRow = {
      id: Date.now(),
      "Nama Biaya": "",
      "Jumlah Biaya": 0,
      isEditable: true,
    };
  
    setRincianBiayaPerCabang(prevData => ({
      ...prevData,
      [cabang]: [...prevData[cabang], newRow]
    }));
  };

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('id-ID');
  };

  const handleCancel = () => {
    navigate('/dataBarang/handmade');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your form submission logic here
    // This would typically include an API call to update the data
    console.log("Submitting updated data:", { data, rincianBiayaPerCabang });
  };

  return (
    <LayoutWithNav
      menuItems={menuItems}
      userOptions={userOptions}
      label={"Edit Data Barang Handmade"}
    >
      <div className="p-5">
        <Breadcrumbs items={breadcrumbItems} />

        <section className="mt-5 bg-white rounded-xl">
          <div className="pt-5 px-5">
            <form onSubmit={handleSubmit}>
              {/* File Input Section */}
              <div>
                <p className="pb-5 font-bold">Masukan Foto Barang</p>
                <FileInput 
                  label={"Masukan Foto Barang"}
                  file={data.info_barang.Foto}
                  onFileChange={(file) => handleInfoBarangChange("Foto", file)}
                />
              </div>

              {/* Basic Info Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                <Input 
                  label={"Nomor"} 
                  required={true}
                  value={data.info_barang.Nomor}
                  onChange={(value) => handleInfoBarangChange("Nomor", value)}
                />
                <Input
                  label={"Nama Barang"}
                  required={true}
                  value={data.info_barang["Nama Barang"]}
                  placeholder="Masukan Nama Barang"
                  onChange={(value) => handleInfoBarangChange("Nama Barang", value)}
                />
                <div>
                  <p className="text-gray-700 font-medium">
                    Kategori<span className="text-red-500">*</span>
                  </p>
                  <ButtonDropdown
                    label={data.info_barang.Kategori || "Pilih Kategori Barang"}
                    options={dataKategori}
                    value={data.info_barang.Kategori}
                    onSelect={(value) => handleInfoBarangChange("Kategori", value)}
                  />
                </div>
                <Input
                  label={"Jumlah Minimum Stok"}
                  type={"number"}
                  required={true}
                  value={data.info_barang["Jumlah Minimum Stok"]}
                  placeholder="Masukan Jumlah Minimum Stok Untuk mendapatkan Notifikasi"
                  onChange={(value) => handleInfoBarangChange("Jumlah Minimum Stok", value)}
                />
              </div>

              {/* Branch Selection Section */}
              <section className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-bold text-base text-primary">Rincian Berdasarkan Cabang</p>
                  <div className="w-60">
                    <ButtonDropdown
                      label={selectedCabang}
                      options={dataCabangOptions}
                      onSelect={setSelectedCabang}
                      icon={
                        <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                        </svg>
                      }
                    />
                  </div>
                </div>
              </section>

              {/* Cost Details Table */}
              <section className="pt-5">
                <p className="font-bold">Rincian Biaya</p>
                <div className="pt-3">
                  <Table
                    headers={headers}
                    data={rincianBiayaPerCabang[selectedCabang]?.map((row, index) => ({
                      No: index + 1,
                      "Nama Biaya": row.isEditable ? (
                        <Input
                          showRequired={false}
                          className="w-full max-w-xs sm:max-w-sm"
                          value={row["Nama Biaya"]}
                          onChange={(value) =>
                            handleInputChange(selectedCabang, index, "Nama Biaya", value)
                          }
                        />
                      ) : (
                        row["Nama Biaya"]
                      ),
                      "Jumlah Biaya": row.isEditable ? (
                        <Input
                          showRequired={false}
                          type="number"
                          width="w-full"
                          value={row["Jumlah Biaya"]}
                          onChange={(value) =>
                            handleInputChange(selectedCabang, index, "Jumlah Biaya", value)
                          }
                        />
                      ) : (
                        `Rp${formatCurrency(row["Jumlah Biaya"])}`
                      ),
                      Aksi: row.isEditable && (
                        <Button
                          label="Hapus"
                          bgColor=""
                          textColor="text-red-600"
                          hoverColor="hover:text-red-800"
                          onClick={() => handleDeleteRow(selectedCabang, row.id)}
                        />
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
                    bgColor="focus:ring-primary"
                    hoverColor="hover:border-primary hover:border"
                    textColor="text-primary"
                    onClick={() => handleAddRow(selectedCabang)}
                  />
                </div>
              </section>

              {/* Totals Section */}
              <section className="flex justify-end text-base p-5">
                <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <p className="font-bold">Total HPP</p>
                    <p>Rp{formatCurrency(data.hargaPerCabang[selectedCabang].totalHPP)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-bold">Keuntungan</p>
                    <p>Rp{formatCurrency(data.hargaPerCabang[selectedCabang].keuntungan)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-bold">Harga Jual</p>
                    <Input
                      showRequired={false}
                      type={"number"}
                      width="w-1/2"
                      value={data.hargaPerCabang[selectedCabang].hargaJual}
                      onChange={(value) => handleHargaJualChange(selectedCabang, value)}
                    />
                  </div>
                </div>
              </section>

              {/* Branch Summary Section */}
              <section className="px-5">
                <p className="font-bold text-base mb-4">Ringkasan Harga Jual Seluruh Cabang</p>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  {Object.entries(data.hargaPerCabang).map(([cabangName, cabangData]) => (
                    <div 
                      key={cabangName} 
                      className="border border-[#7E7E7E] bg-[#F9F9F9] rounded-2xl p-4"
                    >
                      <h3 className="text-primary mb-4 font-medium">Cabang {cabangName}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Total HPP</p>
                          <p className="font-medium">Rp{formatCurrency(cabangData.totalHPP)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Harga Jual</p>
                          <p className="font-medium">Rp{formatCurrency(cabangData.hargaJual)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Action Buttons */}
              <section className="p-5">
                <div className="flex w-full justify-end gap-4">
                  <Button 
                    label={'Batal'} 
                    bgColor="bg-white border border-secondary" 
                    textColor="text-gray-600"
                    className="border border-gray-300"
                    onClick={handleCancel}
                  />
                  <Button 
                    label={'Simpan'} 
                    bgColor="bg-primary" 
                    textColor="text-white" 
                    type="submit"
                  />
                </div>
              </section>
            </form>
          </div>
        </section>
      </div>
    </LayoutWithNav>
  );
}