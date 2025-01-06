import { useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Gallery from "../../../components/Gallery";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";

export default function DataBarang(){
    const [id,setId] = useState('')
    const [selectedId, setSelectedId] = useState(null);
    const [isModalDelete, setModalDelete] = useState(false)
    const [isModalSucc, setModalSucc] = useState(false)
    const [data,setData] = useState([
        {
            id: 1,
            title: "Gelang Barbie 123",
            price: "Rp10.000",
            image: "https://via.placeholder.com/50",
            type: "Zipper",
            category: "Gelang"
          },
          {
            id: 2,
            title: "Cincin Diamond",
            price: "Rp15.000",
            image: "https://via.placeholder.com/50",
            type: "Box",
            category: "Cincin"
          },
          {
            id: 3,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 4,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 5,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 6,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 7,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 8,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 9,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 10,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 11,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 12,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 13,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 14,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 15,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 16,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 17,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 18,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 19,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 20,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 21,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 22,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 23,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
          {
            id: 24,
            title: "Anting Kristal",
            price: "Rp12.000",
            image: "https://via.placeholder.com/50",
            type: "Paper Bag",
            category: "Anting-Anting"
          },
    ])

      const subMenus = ["Gelang", "Cincin", "Anting-Anting"]

      const navigate = useNavigate()
      const handleAdd = () => {
        navigate('/dataBarang/handmade/tambah')
      }

      // const handleEdit = () => {
      //   navigate('/dataBarang/handmade/edit')
      // }

      const handleBtnEdit = (id) => {
        navigate(`/dataBarang/handmade/edit/${id.id}`)
      }
  
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
    return(
        <>
        <Navbar menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        {/* Left Section */}
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar Barang Handmade</p>
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
                                                d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z"
                                                fill="white"
                                            />
                                        </svg>
                                    }
                                    bgColor="bg-primary"
                                    hoverColor="hover:bg-opacity-90 hover:border hover:border-primary hover:text-white"
                                    textColor="text-white"
                                    onClick={handleAdd}
                                />
                            </div>
                        </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Gallery data={data} subMenus={subMenus} enableSubMenus={true} onEdit={handleBtnEdit} onDelete={handleBtnDelete} onItemClick={(item) => navigate(`/dataBarang/handmade/detail/${item.id}`)}/>
                    </div>
                </section>
            </div>

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
    )
}