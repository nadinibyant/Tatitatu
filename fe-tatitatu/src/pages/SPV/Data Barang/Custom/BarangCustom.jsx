import { useEffect, useState } from "react";
import Button from "../../../../components/Button";
import Navbar from "../../../../components/Navbar";
import { menuItems, userOptions } from "../../../../data/menu";
import Gallery from "../../../../components/Gallery";
import FileInput from "../../../../components/FileInput";
import { X } from "lucide-react";
import Input from "../../../../components/Input";
import Table from "../../../../components/Table";
import Alert from "../../../../components/Alert";
import AlertSuccess from "../../../../components/AlertSuccess";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import InputDropdown from "../../../../components/InputDropdown";
import api from "../../../../utils/api";
import Spinner from "../../../../components/Spinner";
import AlertError from "../../../../components/AlertError";

export default function BarangCustom() {
  const [isModal, setModal] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdminGudang = userData?.role === 'admingudang';
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance'
  const [isModalDelete, setModalDelete] = useState(false)
  const [isModalSucc, setModalSucc] = useState(false)
  const [modalMode, setModalMode] = useState("add");
  const [isModalDetail, setModalDetail] = useState(false)
  const [id, setId] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [isAlertSUcc, setAlertSucc] = useState(false)
  const [data,setData] = useState([])
    const [isErrorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const toko_id = userData.userId

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

    const fetchDataBarang = async () => {
      try {
        setIsLoading(true);
        const endpoint = isAdminGudang ? '/barang-mentah' : '/barang-custom';

        const url = isAdminGudang ? endpoint : `${endpoint}?toko_id=${toko_id}`;
        
        const response = await api.get(url);
        
        if (response.data.success) {
          const transformedData = response.data.data.map(item => ({
            id: isAdminGudang ? item.barang_mentah_id : item.barang_custom_id,
            title: item.nama_barang,
            price: `Rp${item.harga.toLocaleString('id-ID')}`,
            image: item.image 
              ? `${import.meta.env.VITE_API_URL}/images-${isAdminGudang ? 'barang-mentah' : 'barang-custom'}/${item.image}` 
              : "https://via.placeholder.com/50",
            type: isAdminGudang ? item.barang_mentah_id : item.barang_custom_id,
            category: item.kategori_barang_id,
            jumlah_minimum_stok: item.jumlah_minimum_stok,
            isi: item.isi,
            harga_satuan: item.harga_satuan,
            harga_jual: item.harga_jual
          }));
          
          setData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

const [categoryOptions, setCategoryOptions] = useState([]);

const [data2, setData2] = useState({
  info_barang: {
    Nomor: "",
    "Nama Barang": "",
    "Jumlah Minimum Stok": "",
    Kategori: "",
    Foto: null,
  },
  rincian_biaya: [
    {
      Harga: "",
      Isi: "",
      HargaSatuan: "",
      HargaJual: ""
    },
  ],
});

const fetchCategories = async () => {
 try {
   const endpoint = isAdminGudang ? '/kategori-barang-gudang' : `/kategori-barang?toko_id=${toko_id}`;
   const response = await api.get(endpoint);
   if (response.data.success) {
     const options = response.data.data.map(item => ({
       value: item.kategori_barang_id.toString(),
       label: item.nama_kategori_barang
     }));
     setCategoryOptions(options);
   }
 } catch (error) {
   console.error('Error fetching categories:', error);
 }
};

useEffect(() => {
  fetchCategories();
  fetchDataBarang(); 
}, []);

const handleAddBtn = () => {
  setModalMode("add");
  setModal(true);
  setData2({
    info_barang: {
      Nomor: "",
      "Nama Barang": "",
      "Jumlah Minimum Stok": "",
      Kategori: "",
      Foto: null,
    },
    rincian_biaya: [
      {
        Harga: "",
        Isi: "",
        HargaSatuan: "",
        HargaJual: ""
      },
    ],
  });
};

  const handleEdit = (itemId) => {
    setModalMode("edit");
    setId(itemId.id);
    setModal(true);
    
    const itemToEdit = data.find(item => item.id === itemId.id);
    const priceNumber = parseInt(itemToEdit.price.replace(/\D/g, ''));
    
    setData2({
      info_barang: {
        Nomor: itemToEdit.id.toString(),
        "Nama Barang": itemToEdit.title,
        "Jumlah Minimum Stok": itemToEdit.jumlah_minimum_stok,
        Kategori: itemToEdit.category,
        Foto: itemToEdit.image,
      },
      rincian_biaya: [
        {
          Harga: priceNumber,
          Isi: itemToEdit.isi,
          HargaSatuan: itemToEdit.harga_satuan,
          HargaJual: itemToEdit.harga_jual
        },
      ],
    });
  };

  const handleInfoBarangChange = (key, value) => {
    setData2((prevData) => ({
      ...prevData,
      info_barang: {
        ...prevData.info_barang,
        [key]: value,
      },
    }));
  };

  const handleInputChange = (key, value) => {
    setData2((prevData) => {
      const updatedRincian = { ...prevData.rincian_biaya[0], [key]: value };

      // Kalkulasi Harga Satuan jika Harga dan Isi valid
      if (key === "Harga" || key === "Isi") {
        const harga = parseFloat(updatedRincian.Harga) || 0;
        const isi = parseFloat(updatedRincian.Isi) || 0;
        updatedRincian.HargaSatuan = isi > 0 ? (harga / isi) : "";
      }

      return {
        ...prevData,
        rincian_biaya: [updatedRincian],
      };
    });
  };

  const headers = [
    { label: "No", key: "No", align: "text-left" },
    { label: "Harga", key: "Harga", align: "text-left" },
    { label: "Isi", key: "Isi", align: "text-left", width: '110px' },
    { label: "Harga Satuan", key: "HargaSatuan", align: "text-left" },
    { label: "Harga Jual", key: "HargaJual", align: "text-left" },
  ];

  const formatCurrency = (amount) => {
      if (!amount || amount === 0) return 0;
      return amount.toLocaleString('id-ID', {
          style: 'currency',
          currency: 'IDR'
      });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (modalMode === "add" && !data2.info_barang.Foto) {
      setErrorMessage('Silakan upload foto barang');
      setErrorAlert(true);
      return;
    }

    if (!isAdminGudang) {
      if (!data2.info_barang.Kategori) {
        setErrorMessage("Kategori harus dipilih");
        setErrorAlert(true);
        return;
      }
    }


    setIsLoading(true);
    try {
      const formData = new FormData();
      
      if (isAdminGudang) {
        // barang-mentah
        if ((modalMode === "add" && data2.info_barang.Foto) || 
            (modalMode === "edit" && data2.info_barang.Foto instanceof File)) {
          formData.append('image', data2.info_barang.Foto);
        }
        formData.append('nama_barang', data2.info_barang["Nama Barang"]);
        formData.append('jumlah_minimum_stok', data2.info_barang["Jumlah Minimum Stok"]);
        formData.append('harga', data2.rincian_biaya[0].Harga); 
        formData.append('isi', data2.rincian_biaya[0].Isi);    
        formData.append('harga_satuan', data2.rincian_biaya[0].HargaSatuan); 
      } else {
        // barang-custom
        if (modalMode === "add") {
          formData.append('image', data2.info_barang.Foto);
        } else if (modalMode === "edit" && data2.info_barang.Foto instanceof File) {
          formData.append('image', data2.info_barang.Foto);
        }
        formData.append('kategori_barang_id', data2.info_barang.Kategori);
        formData.append('nama_barang', data2.info_barang["Nama Barang"]);
        formData.append('jumlah_minimum_stok', data2.info_barang["Jumlah Minimum Stok"]);
        formData.append('harga', data2.rincian_biaya[0].Harga);
        formData.append('isi', data2.rincian_biaya[0].Isi);
        formData.append('harga_satuan', data2.rincian_biaya[0].HargaSatuan);
        formData.append('harga_jual', data2.rincian_biaya[0].HargaJual)
        formData.append('toko_id', toko_id)
      }
  
      const endpoint = isAdminGudang 
        ? (modalMode === "add" ? '/barang-mentah' : `/barang-mentah/${id}`)
        : (modalMode === "add" ? '/barang-custom' : `/barang-custom/${id}`);
  
      const response = modalMode === "add"
        ? await api.post(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await api.put(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
  
      if (response.data.success) {
        setAlertSucc(true);
        setModal(false);
        fetchDataBarang();
      }
    } catch (error) {
      setErrorMessage(error.response.data.message);
      setErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };


  const [selectedId, setSelectedId] = useState(null);
  
  const handleBtnDelete = (item) => {
    setSelectedId(item.id);
    setModalDelete(true);
  };
  
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const endpoint = isAdminGudang ? `/barang-mentah/${selectedId}` : `/barang-custom/${selectedId}`;
      const response = await api.delete(endpoint);
      
      if (response.data.success) {
        await fetchDataBarang();
        setModalSucc(true);
        setModalDelete(false);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    } finally {
      setIsLoading(false);
    }
   };
  
  const handleBtnDelCancel = () => {
    setSelectedId(null);
    setModalDelete(false);
  };
  
  const handleConfirmSucc = () => {
    setSelectedId(null);
    setModalSucc(false);
  };

  const handleDetail = (itemId) => {
    setId(itemId.id);
    setModalDetail(true);
    
    const itemToShow = data.find(item => item.id === itemId.id);
    const priceNumber = parseInt(itemToShow.price.replace(/\D/g, ''));
    
    setData2({
      info_barang: {
        Nomor: itemToShow.id.toString(),
        "Nama Barang": itemToShow.title,
        "Jumlah Minimum Stok": itemToShow.jumlah_minimum_stok,
        Kategori: itemToShow.category,
        Foto: itemToShow.image,
      },
      rincian_biaya: [
        {
          Harga: priceNumber,
          Isi: itemToShow.isi,
          HargaSatuan: itemToShow.harga_satuan,
          HargaJual: itemToShow.harga_jual
        },
      ],
    });
  }

  return (
    <>
      <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
        <div className="p-5">
          <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
            {/* Left Section */}
            <div className="left w-full md:w-auto">
              <p className={`text-${themeColor} text-base font-bold`}>{isAdminGudang ? "Daftar Barang Mentah" : "Daftar Bahan Custom"}</p>
            </div>

            {/* Right Section */}
            <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
              <div className="w-full md:w-auto">
              <Button
                  label="Tambah"
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.8946 13.2652 8 13 8Z"
                        fill="white"
                      />
                    </svg>
                  }
                  bgColor={`bg-${themeColor}`}
                  hoverColor={`hover:bg-opacity-90 hover:border hover:border-${themeColor} hover:text-white`}
                  textColor="text-white"
                  onClick={handleAddBtn}
                />
              </div>
            </div>
          </section>

          <section className="mt-5 bg-white rounded-xl">
            <div className="p-1">
              <Gallery data={data} onEdit={handleEdit} onDelete={handleBtnDelete} onItemClick={handleDetail}/>
            </div>
          </section>
        </div>

        {/* Modal */}
        {isModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full md:w-1/2 max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {modalMode === "add" ? "Tambah Data Barang" : "Edit Data Barang"}
                  </h2>
                  <button
                    onClick={() => setModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <div className="flex flex-wrap gap-4">
                      <FileInput
                        label={"Foto Barang"}
                        width="w-1/3"
                        onFileChange={(file) => handleInfoBarangChange("Foto", file)}
                        defaultValue={modalMode === "edit" ? data2.info_barang.Foto : null}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                    <div className="">
                      <Input
                        label={"Nomor"}
                        disabled={true}
                        value={data2.info_barang.Nomor}
                        onChange={(value) => handleInfoBarangChange("Nomor", value)}
                      />
                    </div>

                    <div className="">
                      <Input
                        label={"Nama Barang"}
                        required={true}
                        placeholder="Masukan Nama Barang"
                        value={data2.info_barang["Nama Barang"]}
                        onChange={(value) => handleInfoBarangChange("Nama Barang", value)}
                      />
                    </div>

                    <div className="">
                      <Input
                        label={"Jumlah Minimum Stok"}
                        type={"number"}
                        required={true}
                        placeholder="Masukan Jumlah Minimum Stok"
                        value={data2.info_barang["Jumlah Minimum Stok"]}
                        onChange={(value) =>
                          handleInfoBarangChange("Jumlah Minimum Stok", value)
                        }
                      />
                    </div>

                    {!isAdminGudang && (
                      <div className="">
                        <InputDropdown
                          label="Kategori"
                          options={categoryOptions}
                          value={data2.info_barang.Kategori} 
                          onSelect={(selectedValue) => handleInfoBarangChange("Kategori", selectedValue)}
                          onChange={(e) => handleInfoBarangChange("Kategori", e.target.value)}
                          name="kategori"
                          required={true}
                        />
                      </div>
                    )}
                  </div>

                  <section className="">
                    <div className="pt-5">
                      <p className="font-bold">Rincian Biaya</p>
                      <div className="pt-3">
                        <Table
                          hasPagination={false}
                          hasSearch={false}
                          headers={headers}
                          data={[
                            {
                              No: 1,
                              Harga: (
                                <Input
                                  showRequired={false}
                                  type={'number'}
                                  className="w-full max-w-xs sm:max-w-sm"
                                  value={data2.rincian_biaya[0].Harga}
                                  onChange={(value) => handleInputChange("Harga", value)}
                                />
                              ),
                              Isi: (
                                <Input
                                showRequired={false}
                                  type={'number'}
                                  width="w-full"
                                  value={data2.rincian_biaya[0].Isi}
                                  onChange={(value) => handleInputChange("Isi", value)}
                                />
                              ),
                              HargaJual: (
                                <Input
                                showRequired={false}
                                  type={'number'}
                                  width="w-full"
                                  value={data2.rincian_biaya[0].HargaJual}
                                  onChange={(value) => handleInputChange("HargaJual", value)}
                                />
                              ),
                              HargaSatuan: `${formatCurrency(data2.rincian_biaya[0].HargaSatuan) || "-"}`,
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </section>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setModal(false)}
                      className={`px-4 py-2 border border-${themeColor} rounded-md hover:bg-gray-50 transition-colors`}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-${themeColor} text-white rounded-md hover:bg-black-800 transition-colors`}
                    >
                      {modalMode === "add" ? "Daftar" : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {isModalDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg w-full max-w-2xl">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">{data2.info_barang["Nama Barang"]}</h2>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" onClick={() => setModalDetail(false)}/>
                </button>
              </div>
      
              {/* Content */}
              <div className="p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Image */}
                  <div className="flex">
                    <img 
                      src={data2.info_barang.Foto} 
                      alt={data2.info_barang["Nama Barang"]}
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                  </div>
      
                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500">Nama Barang</p>
                      <p className="font-medium">{data2.info_barang["Nama Barang"]}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Jumlah Minimum Stok</p>
                      <p className="font-medium">{data2.info_barang["Jumlah Minimum Stok"].toLocaleString('id-ID')}</p>
                    </div>
      
                    <div>
                      <p className="text-gray-500">Nomor</p>
                      <p className="font-medium">{data2.info_barang.Nomor}</p>
                    </div>
                  </div>
                </div>
    

                <div className="mt-5">
                  <p className="font-bold">Rincian Biaya</p>
                  <Table
                    headers={headers}
                    data={data2.rincian_biaya.map((item, index) => ({
                        ...item,
                        No: index + 1,
                        Harga: `${formatCurrency(item.Harga)}`,
                        Isi: formatCurrency(item.Isi),
                        HargaSatuan: `${formatCurrency(item.HargaSatuan)}`,
                        HargaJual: `${formatCurrency(item.HargaJual)}`
                    }))}
                    hasPagination={false}
                    hasSearch={false}
                  />
                </div>
              </div>
      
              {/* Footer */}
              <div className="p-4 border-t flex justify-end">
                <Button
                  label={'Edit Barang'}
                  bgColor="border-oren border"
                  textColor={'text-oren'}
                  icon={
                    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z" fill="#DA5903"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z" fill="#DA5903"/>
                    </svg>
                  } 
                  hoverColor="hover:bg-gray-100"
                  onClick={() => {
                    handleEdit({ id: id }); 
                    setModalDetail(false); 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {isLoading && (<Spinner/>)}

        {/* modal delete */}
        {isModalDelete && (
            <Alert
            title="Hapus Data"
            description="Apakah kamu yakin ingin menghapus data ini?"
            confirmLabel="Hapus"
            cancelLabel="Kembali"
            onConfirm={handleDelete}
            onCancel={handleBtnDelCancel}
            open={isModalDelete}
            onClose={() => setModalDelete(false)}
            />
        )} 

        {/* modal success */}
        {isModalSucc&& (
            <AlertSuccess
            title="Berhasil!!"
            description="Data berhasil dihapus"
            confirmLabel="Ok"
            onConfirm={handleConfirmSucc}
            />
        )}

        {isAlertSUcc&& (
            <AlertSuccess
            title="Berhasil!!"
            description="Data berhasil ditambahkan/diperbaharui"
            confirmLabel="Ok"
            onConfirm={handleConfirmSucc}
            />
        )}

        {isErrorAlert && (
            <AlertError
            title="Gagal!!"
            description={errorMessage}
            confirmLabel="Ok"
            onConfirm={() => setErrorAlert(false)}
          />
        )}       
      </LayoutWithNav>
    </>
  );
}
