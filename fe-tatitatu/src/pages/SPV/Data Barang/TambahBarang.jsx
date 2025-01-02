import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import ButtonDropdown from "../../../components/ButtonDropdown";
import FileInput from "../../../components/FileInput";
import Input from "../../../components/Input";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menuSpv";
import Table from "../../../components/Table";
import Button from "../../../components/Button";

export default function TambahBarang() {
  const breadcrumbItems = [
    { label: "Daftar Barang Handmade", href: "/dataBarang/handmade" },
    { label: "Tambah", href: "" },
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
        Nomor: "",
        "Nama Barang": "",
        Kategori: "",
        "Jumlah Minimum Stok": "",
        Foto: null,
        "Total HPP": 0,
        Keuntungan: 0,
        "Harga Jual": 0,
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
    return amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
    });
    };

  return (
    <>
      <Navbar
        menuItems={menuItems}
        userOptions={userOptions}
        label={"Tambah Data Barang Handmade"}
      >
        <div className="p-5">
          <Breadcrumbs items={breadcrumbItems} />

          <section className="mt-5 bg-white rounded-xl">
            <section className="">
              <div className="pt-5 px-5">
                <form action="">
                  <div className="">
                    <p className="pb-5 font-bold">Masukan Foto Barang</p>
                    <FileInput 
                        label={"Masukan Foto Barang"}
                        onFileChange={(file) =>
                            handleInfoBarangChange("Foto", file)
                        }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                    {/* Input Nomor */}
                    <div className="">
                      <Input label={"Nomor"} required={true} onChange={(value) =>
                          handleInfoBarangChange("Nomor", value)
                        }/>
                    </div>

                    {/* Input Nama Barang */}
                    <div className="">
                      <Input
                        label={"Nama Barang"}
                        required={true}
                        placeholder="Masukan Nama Barang"
                        onChange={(value) =>
                            handleInfoBarangChange("Nama Barang", value)
                          }
                      />
                    </div>

                    {/* Dropdown Kategori */}
                    <div className="">
                      <p className="text-gray-700 font-medium">
                        Kategori<span className="text-red-500">*</span>
                      </p>
                      <ButtonDropdown
                        label={"Pilih Kategori Barang"}
                        options={dataKategori}
                        onSelect={(value) =>
                            handleInfoBarangChange("Kategori", value)
                          }
                      />
                    </div>

                    {/* Input Jumlah Barang */}
                    <div className="">
                      <Input
                        label={"Jumlah Minimum Stok"}
                        type={"number"}
                        required={true}
                        placeholder="Masukan Jumlah Minimum Stok Untuk mendapatkan Notifikasi"
                        onChange={(value) =>
                            handleInfoBarangChange("Jumlah Minimum Stok", value)
                          }
                      />
                    </div>
                  </div>

                  <section className="">
                    <div className="pt-5">
                        <p className="font-bold">Rincian Biaya</p>
                        <div className="pt-3">
                        <Table
                            headers={headers}
                            data={data.rincian_biaya.map((row, index) => ({
                            No: index + 1,
                            "Nama Biaya": row.isEditable ? (
                                <Input
                                showRequired={false}
                                className="w-full max-w-xs sm:max-w-sm"
                                value={row["Nama Biaya"]}
                                onChange={(value) =>
                                    handleInputChange("rincian_biaya", index, "Nama Biaya", value)
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
                                    handleInputChange("rincian_biaya", index, "Jumlah Biaya", value)
                                }
                                />
                            ) : (
                                `Rp${row["Jumlah Biaya"].toLocaleString("id-ID")}`
                            ),
                            Aksi: (
                                <Button
                                label="Hapus"
                                bgColor=""
                                textColor="text-red-600"
                                hoverColor="hover:text-red-800"
                                onClick={() =>
                                    handleDeleteRow("rincian_biaya", row.id)
                                }
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
                            onClick={() => handleAddRow("rincian_biaya")}
                        />
                        </div>
                    </div>
                    </section>

                    <section className="">
                        <div className="pt-5">
                            <p className="font-bold">Packaging</p>
                            <div className="pt-3">
                            <Table
                                headers={headers2}
                                data={data.packaging.map((row, index) => ({
                                No: index + 1,
                                "Nama Packaging": (
                                    <ButtonDropdown
                                    showRequired={false}
                                    label={row["Nama Packaging"]}
                                    options={dataPackaging}
                                    onSelect={(value) =>
                                        handlePackagingChange("Nama Packaging", value, index)
                                    }
                                    />
                                ),
                                "Harga Satuan": `Rp${row["Harga Satuan"].toLocaleString(
                                    "id-ID"
                                )}`,
                                Kuantitas: (
                                    <Input
                                    showRequired={false}
                                    type={"number"}
                                    value={row.Kuantitas}
                                    onChange={(value) =>
                                        handlePackagingChange("Kuantitas", value, index)
                                    }
                                    />
                                ),
                                "Total Biaya": `Rp${row["Total Biaya"].toLocaleString(
                                    "id-ID"
                                )}`,
                                }))}
                            />
                            </div>
                        </div>
                        </section>

                        {/* Section Total */}
                        <section className="flex justify-end text-base p-5">
                            <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 text-sm">
                                <div className="flex justify-between">
                                <p className="font-bold">Total HPP</p>
                                <p>{formatCurrency(data.info_barang["Total HPP"])}</p>
                                </div>
                                <div className="flex justify-between">
                                <p className="font-bold">Keuntungan</p>
                                <p>{formatCurrency(data.info_barang.Keuntungan)}</p>
                                </div>
                                <div className="flex justify-between">
                                <p className="font-bold">Harga Jual</p>
                                <Input
                                showRequired={false}
                                    type={"number"}
                                    width="w-1/2"
                                    onChange={(value) =>
                                    handleInfoBarangChange("Harga Jual", parseInt(value, 10))
                                    }
                                />
                                </div>

                                <div className="">
                                    <Button label={'Simpan'} bgColor="bg-primary w-full" textColor="text-white" type="submit"/>
                                </div>
                            </div>
                        </section>
                </form>
              </div>
            </section>
          </section>
        </div>
      </Navbar>
    </>
  );
}
