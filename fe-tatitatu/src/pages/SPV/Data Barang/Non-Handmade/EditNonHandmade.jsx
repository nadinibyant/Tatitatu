import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../../components/Navbar";
import { menuItems, userOptions } from "../../../../data/menuSpv";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import FileInput from "../../../../components/FileInput";
import Input from "../../../../components/Input";
import ButtonDropdown from "../../../../components/ButtonDropdown";
import Table from "../../../../components/Table";
import Button from "../../../../components/Button";

export default function EditNonHandmade({ existingData }) {
  const { id } = useParams();
  const breadcrumbItems = [
    { label: "Daftar Barang Non-Handmade", href: "/dataBarang/non-handmade" },
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

  const headers2 = [
    { label: "No", key: "No", align: "text-left" },
    { label: "Nama Packaging", key: "Nama Packaging", align: "text-left" },
    { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
    { label: "Kuantitas", key: "Kuantitas", align: "text-left" },
    { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
    { label: "", key: "Aksi", align: "text-left" },
  ];

  const [data, setData] = useState({
    info_barang: {
        Nomor: "BN123",
        "Nama Barang": "BARANG AJA",
        Kategori: "Gelang",
        "Jumlah Minimum Stok": 2000,
        Foto: null,
        "Total HPP": 0,
        Keuntungan: 0,
        "Harga Jual": 15000,
    },
    rincian_biaya: [
      {
        id: 1,
        "Nama Biaya": "Biaya Operasional Gor Agus",
        "Jumlah Biaya": 24000,
        isEditable: false,
      },
      {
        id: 2,
        "Nama Biaya": "Biaya Maintenance",
        "Jumlah Biaya": 15000,
        isEditable: false,
      },
      {
        id: 3,
        "Nama Biaya": "Biaya Lain-lain",
        "Jumlah Biaya": 10000,
        isEditable: false,
      },
    ],
    packaging: [
      {
        id: 1,
        "Nama Packaging": "Zipper",
        "Harga Satuan": 1000,
        Kuantitas: 1,
        "Total Biaya": 1000,
      },
    ],
  });

  const dataPackaging = [
    { label: "Zipper", value: "Zipper", "Harga Satuan": 1000 },
    { label: "Box", value: "Box", "Harga Satuan": 2000 },
    { label: "Pouch", value: "Pouch", "Harga Satuan": 1500 },
  ];

  const calculateTotalHPP = () => {
    const totalRincianBiaya = data.rincian_biaya.reduce(
      (sum, item) => sum + (item["Jumlah Biaya"] || 0),
      0
    );
    const totalPackaging = data.packaging.reduce(
      (sum, item) => sum + (item["Total Biaya"] || 0),
      0
    );

    return totalRincianBiaya + totalPackaging;
  };

  const calculateKeuntungan = () => {
    return (
      data.info_barang["Harga Jual"] - data.info_barang["Total HPP"] || 0
    );
  };

  useEffect(() => {
    const totalHPP = calculateTotalHPP();
    const keuntungan = calculateKeuntungan();

    setData((prevData) => ({
      ...prevData,
      info_barang: {
        ...prevData.info_barang,
        "Total HPP": totalHPP,
        Keuntungan: keuntungan,
      },
    }));
  }, [data.rincian_biaya, data.packaging, data.info_barang["Harga Jual"]]);

  const handleInfoBarangChange = (key, value) => {
    setData((prevData) => ({
      ...prevData,
      info_barang: {
        ...prevData.info_barang,
        [key]: value,
      },
    }));
  };

  const handlePackagingChange = (key, value, index) => {
    setData((prevData) => {
      const updatedPackaging = prevData.packaging.map((row, i) => {
        if (i === index) {
          if (key === "Nama Packaging") {
            const selectedPackaging = dataPackaging.find(
              (packaging) => packaging.value === value
            );
            return {
              ...row,
              [key]: value,
              "Harga Satuan": selectedPackaging["Harga Satuan"],
              "Total Biaya": selectedPackaging["Harga Satuan"] * row.Kuantitas,
            };
          } else if (key === "Kuantitas") {
            return {
              ...row,
              [key]: parseInt(value, 10) || 0,
              "Total Biaya": row["Harga Satuan"] * (parseInt(value, 10) || 0),
            };
          }
        }
        return row;
      });

      return {
        ...prevData,
        packaging: updatedPackaging,
      };
    });
  };

  const handleInputChange = (section, rowIndex, key, value) => {
    const updatedData = data[section].map((row, index) =>
      index === rowIndex ? { ...row, [key]: value } : row
    );
    setData((prevData) => ({
      ...prevData,
      [section]: updatedData,
    }));
  };

  const handleDeleteRow = (section, rowId) => {
    setData((prevData) => {
      const updatedSectionData = prevData[section].filter(
        (row) => row.id !== rowId
      );
      return {
        ...prevData,
        [section]: updatedSectionData,
      };
    });
  };

  const handleAddRow = (section) => {
    const newRow = {
      id: Date.now(),
      "Nama Biaya": "",
      "Jumlah Biaya": "",
      isEditable: true,
    };

    setData((prevData) => ({
      ...prevData,
      [section]: [...prevData[section], newRow],
    }));
  };

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString("id-ID")}`
  };

  console.log(data)

  return (
    <Navbar
      menuItems={menuItems}
      userOptions={userOptions}
    >
      <div className="p-5">
        <Breadcrumbs items={breadcrumbItems} />

        <section className="mt-5 bg-white rounded-xl">
          <form>
            <div className="p-5">
                <p className="font-bold pb-3">Masukan Foto Barang</p>
                <FileInput
                    label={"Masukan Foto Barang"}
                    file={data.info_barang.Foto}
                    onFileChange={(file) => handleInfoBarangChange("Foto", file)}
                />
            </div>

            {/* Input Information */}
            <div className="pt-3 px-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={"Nomor"}
                value={data.info_barang.Nomor}
                required
                onChange={(value) => handleInfoBarangChange("Nomor", value)}
              />
              <Input
                label={"Nama Barang"}
                value={data.info_barang["Nama Barang"]}
                required
                onChange={(value) =>
                  handleInfoBarangChange("Nama Barang", value)
                }
              />
              <div className="">
                <p>Kategori</p>
                <ButtonDropdown
                    label={"Pilih Kategori Barang"}
                    value={data.info_barang.Kategori}
                    options={dataKategori}
                    onSelect={(value) => handleInfoBarangChange("Kategori", value)}
                />
              </div>
              
              <Input
                label={"Jumlah Minimum Stok"}
                type="number"
                value={data.info_barang["Jumlah Minimum Stok"]}
                required
                onChange={(value) =>
                  handleInfoBarangChange("Jumlah Minimum Stok", value)
                }
              />
              
            </div>

            {/* Rincian Biaya */}
            <div className="p-5">
              <p className="font-bold pb-5">Rincian Biaya</p>
              <Table
                headers={headers}
                data={data.rincian_biaya.map((row, index) => ({
                  No: index + 1,
                  "Nama Biaya": (
                    <Input
                    showRequired={false}
                      value={row["Nama Biaya"]}
                      onChange={(value) =>
                        handleInputChange("rincian_biaya", index, "Nama Biaya", value)
                      }
                    />
                  ),
                  "Jumlah Biaya": (
                    <Input
                    showRequired={false}
                      type="number"
                      value={row["Jumlah Biaya"]}
                      onChange={(value) =>
                        handleInputChange("rincian_biaya", index, "Jumlah Biaya", value)
                      }
                    />
                  ),
                  Aksi: (
                    <Button
                      label="Hapus"
                      bgColor=""
                      textColor="text-red-600"
                      onClick={() => handleDeleteRow("rincian_biaya", row.id)}
                    />
                  ),
                }))}
              />
              <Button
                label="Tambah Baris"
                bgColor=""
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
                textColor="text-primary"
                onClick={() => handleAddRow("rincian_biaya")}
              />
            </div>

            {/* Packaging */}
            <div className="p-5">
              <p className="font-bold pb-5">Packaging</p>
              <Table
                headers={headers2}
                data={data.packaging.map((row, index) => ({
                  No: index + 1,
                  "Nama Packaging": (
                    <ButtonDropdown
                      label={row["Nama Packaging"]}
                      value={row["Nama Packaging"]}
                      options={dataPackaging}
                      onSelect={(value) =>
                        handlePackagingChange("Nama Packaging", value, index)
                      }
                    />
                  ),
                  "Harga Satuan": formatCurrency(row["Harga Satuan"]),
                  Kuantitas: (
                    <Input
                    showRequired={false}
                      type="number"
                      value={row.Kuantitas}
                      onChange={(value) =>
                        handlePackagingChange("Kuantitas", value, index)
                      }
                    />
                  ),
                  "Total Biaya": formatCurrency(row["Total Biaya"]),
                  Aksi: (
                    <Button
                      label="Hapus"
                      textColor="text-red-600"
                      bgColor=""
                      onClick={() => handleDeleteRow("packaging", row.id)}
                    />
                  ),
                }))}
              />
            </div>

            {/* Total Section */}
            <div className="p-5 flex justify-end">
              <div className="w-full md:w-1/2 lg:w-1/3">
                <div className="flex justify-between pb-3">
                  <p className="font-bold">Total HPP</p>
                  <p>{formatCurrency(data.info_barang["Total HPP"])}</p>
                </div>
                <div className="flex justify-between pb-3">
                  <p className="font-bold">Keuntungan</p>
                  <p>{formatCurrency(data.info_barang.Keuntungan)}</p>
                </div>
                <div className="flex justify-between pb-3">
                  <p className="font-bold">Harga Jual</p>
                  <Input
                  showRequired={false}
                    width="w-full md: w-1/2"
                    type="number"
                    value={data.info_barang["Harga Jual"]}
                    onChange={(value) =>
                      handleInfoBarangChange("Harga Jual", parseInt(value, 10))
                    }
                  />
                </div>
                <Button label="Simpan" bgColor="bg-primary w-full" textColor="text-white" type="submit" />
              </div>
            </div>
          </form>
        </section>
      </div>
    </Navbar>
  );
}
