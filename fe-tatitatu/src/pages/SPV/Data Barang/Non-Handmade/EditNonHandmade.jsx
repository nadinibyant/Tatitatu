import { useEffect, useState } from "react";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import FileInput from "../../../../components/FileInput";
import Input from "../../../../components/Input";
import ButtonDropdown from "../../../../components/ButtonDropdown";
import Table from "../../../../components/Table";
import Button from "../../../../components/Button";
import api from "../../../../utils/api";
import { useParams } from "react-router-dom";

export default function EditBarang() {
  const { id } = useParams();
  const [selectedCabang, setSelectedCabang] = useState("GOR HAS");
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdminGudang = userData?.role === 'admingudang';
  const [dataKategori, setDataKategori] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKategori = async () => {
    try {
      const endpoint = isAdminGudang ? '/kategori-barang-gudang' : '/kategori-barang';
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const options = response.data.data.map(item => ({
          label: item.nama_kategori_barang,
          value: item.kategori_barang_id.toString()
        }));
        setDataKategori(options);
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
    }
  };

  const fetchBarangData = async () => {
    try {
      const endpoint = isAdminGudang ? `/barang-gudang/${id}` : `/barang/${id}`;
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const barangData = response.data.data;
        
        setData({
          info_barang: {
            Nomor: barangData.nomor,
            "Nama Barang": barangData.nama_barang,
            Kategori: barangData.kategori_barang_id.toString(),
            "Jumlah Minimum Stok": barangData.jumlah_minimum_stok,
            Foto: barangData.foto,
          },
          hargaGudang: isAdminGudang ? {
            totalHPP: barangData.total_hpp || 0,
            hargaJual: barangData.harga_jual || 0,
            keuntungan: barangData.keuntungan || 0
          } : {},
          hargaPerCabang: isAdminGudang ? {} : barangData.harga_per_cabang
        });

        if (isAdminGudang) {
          setRincianBiayaPerCabang(barangData.rincian_biaya);
        } else {
          setRincianBiayaPerCabang(barangData.rincian_biaya_per_cabang);
        }

        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching barang data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
    fetchBarangData();
  }, [id]);

  const breadcrumbItems = [
    { label: "Daftar Barang Non-Handmade", href: "/dataBarang/non-handmade" },
    { label: "Edit", href: "" },
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

  const [rincianBiayaPerCabang, setRincianBiayaPerCabang] = useState(
    isAdminGudang ? [] : {}
  );

  const [data, setData] = useState({
    info_barang: {
      Nomor: "",
      "Nama Barang": "",
      Kategori: "",
      "Jumlah Minimum Stok": "",
      Foto: null,
    },
    hargaGudang: isAdminGudang ? {
      totalHPP: 0,
      hargaJual: 0,
      keuntungan: 0
    } : {},
    hargaPerCabang: isAdminGudang ? {} : {
      "GOR HAS": { totalHPP: 0, hargaJual: 0, keuntungan: 0 },
      "Lubeg": { totalHPP: 0, hargaJual: 0, keuntungan: 0 },
      "Bypass": { totalHPP: 0, hargaJual: 0, keuntungan: 0 },
    }
  });

  const calculateTotalHPP = (cabang) => {
    if (isAdminGudang) {
      return rincianBiayaPerCabang.reduce(
        (sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0),
        0
      );
    }
    return rincianBiayaPerCabang[cabang]?.reduce(
      (sum, item) => sum + (Number(item["Jumlah Biaya"]) || 0),
      0
    ) || 0;
  };

  const calculateKeuntungan = (hargaJual, totalHPP) => {
    return (hargaJual || 0) - (totalHPP || 0);
  };

  useEffect(() => {
    if (isAdminGudang) {
      const totalHPP = calculateTotalHPP();
      const keuntungan = calculateKeuntungan(
        data.hargaGudang.hargaJual,
        totalHPP
      );

      setData(prevData => ({
        ...prevData,
        hargaGudang: {
          ...prevData.hargaGudang,
          totalHPP,
          keuntungan
        }
      }));
    } else {
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
    }
  }, [selectedCabang, rincianBiayaPerCabang, data.hargaPerCabang[selectedCabang]?.hargaJual, data.hargaGudang?.hargaJual]);

  const handleInfoBarangChange = (key, value) => {
    setData(prevData => ({
      ...prevData,
      info_barang: {
        ...prevData.info_barang,
        [key]: value,
      },
    }));
  };

  const handleHargaJualChange = (cabang, value) => {
    const numValue = Number(value) || 0;
    
    if (isAdminGudang) {
      const totalHPP = calculateTotalHPP();
      const keuntungan = calculateKeuntungan(numValue, totalHPP);

      setData(prevData => ({
        ...prevData,
        hargaGudang: {
          ...prevData.hargaGudang,
          hargaJual: numValue,
          keuntungan
        }
      }));
    } else {
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
    }
  };

  const handleInputChange = (cabang, rowIndex, key, value) => {
    if (isAdminGudang) {
      setRincianBiayaPerCabang(prevData => 
        prevData.map((row, index) =>
          index === rowIndex ? { ...row, [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value } : row
        )
      );
    } else {
      setRincianBiayaPerCabang(prevData => ({
        ...prevData,
        [cabang]: prevData[cabang].map((row, index) =>
          index === rowIndex ? { ...row, [key]: key === "Jumlah Biaya" ? Number(value) || 0 : value } : row
        )
      }));
    }
  };

  const handleDeleteRow = (cabang, rowId) => {
    if (isAdminGudang) {
      setRincianBiayaPerCabang(prevData => prevData.filter(row => row.id !== rowId));
    } else {
      setRincianBiayaPerCabang(prevData => ({
        ...prevData,
        [cabang]: prevData[cabang].filter(row => row.id !== rowId)
      }));
    }
  };

  const handleAddRow = (cabang) => {
    const newRow = {
      id: Date.now(),
      "Nama Biaya": "",
      "Jumlah Biaya": 0,
      isEditable: true,
    };
    
    if (isAdminGudang) {
      setRincianBiayaPerCabang(prevData => [...prevData, newRow]);
    } else {
      setRincianBiayaPerCabang(prevData => ({
        ...prevData,
        [cabang]: [...prevData[cabang], newRow]
      }));
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('id-ID');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isAdminGudang ? `/barang-gudang/${id}` : `/barang/${id}`;
      const formData = new FormData();
      
      Object.entries(data.info_barang).forEach(([key, value]) => {
        if (key === "Foto" && value instanceof File) {
          formData.append("foto", value);
        } else {
          formData.append(key.toLowerCase().replace(/ /g, "_"), value);
        }
      });

      if (isAdminGudang) {
        formData.append("rincian_biaya", JSON.stringify(rincianBiayaPerCabang));
        formData.append("harga_gudang", JSON.stringify(data.hargaGudang));
      } else {
        formData.append("rincian_biaya_per_cabang", JSON.stringify(rincianBiayaPerCabang));
        formData.append("harga_per_cabang", JSON.stringify(data.hargaPerCabang));
      }

      const response = await api.put(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Handle success (e.g., show notification, redirect)
        console.log('Data updated successfully');
      }
    } catch (error) {
      console.error('Error updating barang:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <LayoutWithNav label={"Edit Data Barang Handmade"}>
      <div className="p-5">
        <Breadcrumbs items={breadcrumbItems} />

        <section className="mt-5 bg-white rounded-xl">
          <div className="pt-5 px-5">
            <form onSubmit={handleSubmit}>
              <div>
                <p className="pb-5 font-bold">Masukan Foto Barang</p>
                <FileInput 
                  label={"Masukan Foto Barang"}
                  onFileChange={(file) => handleInfoBarangChange("Foto", file)}
                  defaultValue={data.info_barang.Foto}
                />
              </div>

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
                  placeholder="Masukan Nama Barang"
                  value={data.info_barang["Nama Barang"]}
                  onChange={(value) => handleInfoBarangChange("Nama Barang", value)}
                />
                <div>
                  <p className="text-gray-700 font-medium">
                    Kategori<span className="text-red-500">*</span>
                  </p>
                  <ButtonDropdown
                    label={"Pilih Kategori Barang"}
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

              {isAdminGudang ? (
                <>
                  <section className="pt-5">
                    <p className="font-bold">Rincian Biaya</p>
                    <div className="pt-3">
                      <Table
                        headers={headers}
                        data={rincianBiayaPerCabang.map((row, index) => ({
                          No: index + 1,
                          "Nama Biaya": row.isEditable ? (
                            <Input
                              showRequired={false}
                              className="w-full max-w-xs sm:max-w-sm"
                              value={row["Nama Biaya"]}
                              onChange={(value) =>
                                handleInputChange(null, index, "Nama Biaya", value)
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
                                handleInputChange(null, index, "Jumlah Biaya", value)
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
                              onClick={() => handleDeleteRow(null, row.id)}
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
                        onClick={() => handleAddRow(null)}
                      />
                    </div>
                  </section>

                  <section className="flex justify-end text-base p-5">
                    <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 text-sm">
                      <div className="flex justify-between">
                        <p className="font-bold">Total HPP</p>
                        <p>Rp{formatCurrency(data.hargaGudang.totalHPP)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-bold">Keuntungan</p>
                        <p>Rp{formatCurrency(data.hargaGudang.keuntungan)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-bold">Harga Jual</p>
                        <Input
                          showRequired={false}
                          type={"number"}
                          width="w-1/2"
                          value={data.hargaGudang.hargaJual}
                          onChange={(value) => handleHargaJualChange(null, value)}
                        />
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-bold text-base text-primary">Rincian Berdasarkan Cabang</p>
                      <div className="w-60">
                        <ButtonDropdown
                          label={selectedCabang}
                          options={dataCabangOptions}
                          value={selectedCabang}
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
                </>
              )}

              <section className="p-5">
                <div className="flex w-full justify-end gap-4">
                  <Button 
                    label={'Batal'} 
                    bgColor="bg-white border border-secondary" 
                    textColor="text-gray-600"
                    className="border border-gray-300"
                    onClick={() => {
                      // Add your cancel logic here
                    }}
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