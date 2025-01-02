import { useState } from "react";
import Button from "../../../../components/Button";
import Navbar from "../../../../components/Navbar";
import { menuItems, userOptions } from "../../../../data/menuSpv";
import Gallery from "../../../../components/Gallery";
import FileInput from "../../../../components/FileInput";
import { X } from "lucide-react";
import Input from "../../../../components/Input";
import Table from "../../../../components/Table";
import Alert from "../../../../components/Alert";
import AlertSuccess from "../../../../components/AlertSuccess";

export default function Packaging() {
  const [isModal, setModal] = useState(false);
  const [isModalDelete, setModalDelete] = useState(false)
  const [isModalSucc, setModalSucc] = useState(false)
  const [modalMode, setModalMode] = useState("add");
  const [isModalDetail, setModalDetail] = useState(false)
  const [id, setId] = useState("");
  const [data,setData] = useState([
    {
        id: 1,
        title: "Gelang Barbie 123",
        price: "Rp10.000",
        image: "https://via.placeholder.com/50",
        type: "Zipper",
      },
      {
        id: 2,
        title: "Cincin Diamond",
        price: "Rp15.000",
        image: "https://via.placeholder.com/50",
        type: "Box",
      },
      {
        id: 3,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 4,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 5,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 6,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 7,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 8,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 9,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 10,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 11,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 12,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 13,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 14,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 15,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 16,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 17,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 18,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 19,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 20,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 21,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 22,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 23,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
      {
        id: 24,
        title: "Anting Kristal",
        price: "Rp12.000",
        image: "https://via.placeholder.com/50",
        type: "Paper Bag",
      },
])

  const [data2, setData2] = useState({
    info_barang: {
      Nomor: "",
      "Nama Barang": "",
      "Jumlah Minimum Stok": "",
      Foto: null,
    },
    rincian_biaya: [
      {
        Harga: "",
        Isi: "",
        HargaSatuan: "",
      },
    ],
  });

  const handleAddBtn = () => {
    setModalMode("add");
    setModal(true);
    setData2({
      info_barang: {
        Nomor: "",
        "Nama Barang": "",
        "Jumlah Minimum Stok": "",
        Foto: null,
      },
      rincian_biaya: [
        {
          Harga: "",
          Isi: "",
          HargaSatuan: "",
        },
      ],
    });
  };

  const handleEdit = (itemId) => {
    setModalMode("edit");
    setId(itemId.id);
    setModal(true);
    // const itemToEdit = data.find((item) => item.id === itemId);
    setData2({
      info_barang: {
        Nomor: "123",
        "Nama Barang":  "Barbie",
        "Jumlah Minimum Stok": 12, 
        Foto: "https://via.placeholder.com/50",
      },
      rincian_biaya: [
        {
          Harga: 1000,
          Isi: 20, 
          HargaSatuan: 50,
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
    { label: "Isi", key: "Isi", align: "text-left" },
    { label: "Harga Satuan", key: "HargaSatuan", align: "text-left" },
  ];

  const formatCurrency = (amount) => {
    return amount.toLocaleString('id-ID', {});
  };

  // console.log(data2)

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      console.log("Add item", data2);
      setModal(false);
    } else if (modalMode === "edit") {
      console.log("Edit item with id", id, data2);
      setModal(false);
    }
  };

  const [selectedId, setSelectedId] = useState(null);
  const handleBtnDelete = (item) => {
    setSelectedId(item.id);
    setModalDelete(true);
  };
  
  const handleDelete = () => {
    setData(prevData => prevData.filter(item => item.id !== selectedId));
    setModalSucc(true);
    setModalDelete(false);
  };
  
  const handleBtnDelCancel = () => {
    setSelectedId(null);
    setModalDelete(false);
  };
  
  const handleConfirmSucc = () => {
    setSelectedId(null);
    setModalSucc(false);
  };

  const handleDetail = (id) => {
    setId(id.id)
    setModalDetail(true)
    setData2({
      info_barang: {
        Nomor: "123",
        "Nama Barang":  "Barbie",
        "Jumlah Minimum Stok": 12, 
        Foto: "https://via.placeholder.com/50",
      },
      rincian_biaya: [
        {
          Harga: 1000,
          Isi: 20, 
          HargaSatuan: 50,
        },
      ],
    });
  }
  return (
    <>
      <Navbar menuItems={menuItems} userOptions={userOptions}>
        <div className="p-5">
          <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
            {/* Left Section */}
            <div className="left w-full md:w-auto">
              <p className="text-primary text-base font-bold">Daftar Barang Custom</p>
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
                  bgColor="bg-primary"
                  hoverColor="hover:bg-opacity-90 hover:border hover:border-primary hover:text-white"
                  textColor="text-white"
                  onClick={handleAddBtn}
                />
              </div>
            </div>
          </section>

          <section className="mt-5 bg-white rounded-xl">
            <div className="p-5">
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
                    <div className="">
                      <p className="pb-5 font-bold">Foto Barang</p>
                      <FileInput
                        label={"Foto Barang"}
                        width="w-1/3"
                        onFileChange={(file) => handleInfoBarangChange("Foto", file)}
                        defaultValue={data2.info_barang.Foto}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                    <div className="">
                      <Input
                        label={"Nomor"}
                        required={true}
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
                              HargaSatuan: `Rp${formatCurrency(data2.rincian_biaya[0].HargaSatuan) || "-"}`,
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
                      className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-black-800 transition-colors"
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
                      <p className="font-medium">{data2.info_barang["Jumlah Minimum Stok"]}</p>
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
                        Harga: `Rp${formatCurrency(item.Harga)}`,
                        Isi: formatCurrency(item.Isi),
                        HargaSatuan: `Rp${formatCurrency(item.HargaSatuan)}`
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
                  onClick={handleEdit}
                />
              </div>
            </div>
          </div>
        )}

        {/* modal delete */}
        {isModalDelete && (
            <Alert
            title="Hapus Data"
            description="Apakah kamu yakin ingin menghapus data ini?"
            confirmLabel="Hapus"
            cancelLabel="Kembali"
            onConfirm={handleDelete}
            onCancel={handleBtnDelCancel}
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
      </Navbar>
    </>
  );
}
