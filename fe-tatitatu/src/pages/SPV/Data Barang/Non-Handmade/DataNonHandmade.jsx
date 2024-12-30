import { useState } from "react";
import Button from "../../../../components/Button";
import Navbar from "../../../../components/Navbar";
import { menuItems, userOptions } from "../../../../data/menuSpv";
import Gallery from "../../../../components/Gallery";
import { useNavigate } from "react-router-dom";

export default function DataNonHandmade(){
    const navigate = useNavigate()
    const handleBtnAdd = () => {
      navigate('/dataBarang/non-handmade/tambah')
    }
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

    return(
        <>
        <Navbar menuItems={menuItems} userOptions={userOptions} label={'Data Barang'}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        {/* Left Section */}
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar Barang Non-Handmade</p>
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
                                    onClick={handleBtnAdd}
                                />
                            </div>
                        </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Gallery data={data} url="/dataBarang/non-handmade/edit" onItemClick={(item) => navigate(`/dataBarang/non-handmade/detail/${item.id}`)}/>
                    </div>
                </section>
            </div>
        </Navbar>
        </>
    )
}