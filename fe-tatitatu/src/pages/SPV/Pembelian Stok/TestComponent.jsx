import { useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Navbar from "../../../components/Navbar";
import Table from "../../../components/Table";
import InputDropdown from "../../../components/InputDropdown";
import FileInput2 from "../../../components/FileInput";
import FileInput from "../../../components/FileInput";
import Gallery from "../../../components/Gallery";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Gallery2 from "../../../components/Gallery2";

export default function TestComponent() {
    const [value, setValue] = useState("");
    const [selectedOption, setSelectedOption] = useState("");
    
    const handleSelect = (value) => {
        setSelectedOption(value);
        console.log("Selected: ", value);
    };
    

    const menuItems = [
        {
          label: "Menu 1",
          link: "/menu1",
          icon: "📂",
          submenu: [
            { label: "Submenu 1", link: "/submenu1" },
            { label: "Submenu 2", link: "/submenu2" },
          ],
        },
        {
          label: "Menu 2",
          link: "/menu2",
          icon: "⚙️",
          submenu: [
            { label: "Submenu A", link: "/submenuA" },
            { label: "Submenu B", link: "/submenuB" },
          ],
        },
      ];
      
      const userOptions = [
        { label: "Profile", link: "/profile" },
        { label: "Logout", link: "/logout" },
      ];

      const headers = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-center" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Jumlah Barang", key: "Jumlah Barang", align: "text-right" },
        { label: "Diskon", key: "Diskon", align: "text-center" },
        { label: "Pajak", key: "Pajak", align: "text-center" },
        { label: "Total Transaksi", key: "Total Transaksi", align: "text-right" },
      ];
    
      const data = [
        {
          Nomor: "STK1323",
          Tanggal: "31/05/2024",
          "Nama Barang": "Gelang Barbie, Gelang Bulan, +3 Lainnya",
          "Jumlah Barang": "30%",
          Diskon: "11%",
          Pajak: "11%",
          "Total Transaksi": "Rp.200.000",
        },
        {
          Nomor: "STK1324",
          Tanggal: "01/06/2024",
          "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
          "Jumlah Barang": "40%",
          Diskon: "15%",
          Pajak: "10%",
          "Total Transaksi": "Rp.300.000",
        },
        {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
            Nomor: "STK1324",
            Tanggal: "01/06/2024",
            "Nama Barang": "Kalung Emas, Kalung Perak, +2 Lainnya",
            "Jumlah Barang": "40%",
            Diskon: "15%",
            Pajak: "10%",
            "Total Transaksi": "Rp.300.000",
          },
          {
          Nomor: "STK1324",
          Tanggal: "01/06/2024",
          "Nama Barang": "Kalung Emas dini",
          "Jumlah Barang": "40%",
          Diskon: "15%",
          Pajak: "10%",
          "Total Transaksi": "Rp.300.000",
        },
      ];

      const filterFields = [
        { label: "Nomor", key: "Nomor", placeholder: "Masukkan nomor" },
        { label: "Tanggal", key: "Tanggal", type: "date" },
        { label: "Nama Barang", key: "Nama Barang", placeholder: "Cari nama barang" },
      ];
    
      const handleFileChange = (file) => {
        console.log("File uploaded: ", file);
      };

      const items = [
        {
          image: "https://via.placeholder.com/150",
          code: "MMM453",
          name: "Gelang Besi",
          price: "Rp10.000",
        },
        {
          image: "https://via.placeholder.com/150",
          code: "ZIPPER",
          name: "Zipper",
          price: "Rp10.000",
        },
        {
          image: "https://via.placeholder.com/150",
          code: "PLASTIK",
          name: "Plastik",
          price: "Rp10.000",
        },
        {
            image: "https://via.placeholder.com/150",
            code: "MMM453",
            name: "Gelang Besi",
            price: "Rp10.000",
          },
          {
            image: "https://via.placeholder.com/150",
            code: "ZIPPER",
            name: "Zipper",
            price: "Rp10.000",
          },
          {
            image: "https://via.placeholder.com/150",
            code: "PLASTIK",
            name: "Plastik",
            price: "Rp10.000",
          },
          {
            image: "https://via.placeholder.com/150",
            code: "MMM453",
            name: "Gelang Besi",
            price: "Rp10.000",
          },
          {
            image: "https://via.placeholder.com/150",
            code: "ZIPPER",
            name: "Zipper",
            price: "Rp10.000",
          },
          {
            image: "https://via.placeholder.com/150",
            code: "PLASTIK",
            name: "Plastik",
            price: "Rp10.000",
          },
      ];

      const handleItemClick = (item) => {
        console.log("Item clicked: ", item);
      };

      const filterGallery = [
        { label: "Nama Barang", key: "name", placeholder: "Masukkan nama barang" },
        { label: "Kode Barang", key: "code", placeholder: "Masukkan kode barang" },
        { label: "Harga", key: "price", placeholder: "Masukkan harga" },
      ];

      const breadcrumbItems = [
        { label: "Daftar Pemasukan", href: "/daftar-pemasukan" },
        { label: "Detail Pemasukan", href: "" },
      ];
    
      const items2 = [
        {
          id: 1,
          image: "https://via.placeholder.com/150",
          code: "MMM453",
          name: "Gelang Barbie 123",
          price: "Rp10.000",
        },
        {
          id: 2,
          image: "https://via.placeholder.com/150",
          code: "MMM454",
          name: "Gelang Barbie 124",
          price: "Rp12.000",
        },
        {
          id: 3,
          image: "https://via.placeholder.com/150",
          code: "MMM455",
          name: "Gelang Barbie 125",
          price: "Rp15.000",
        },
      ];
    
      const [selectedItems2, setSelectedItems2] = useState({});
    
      const handleSelect2 = (item, count) => {
        setSelectedItems2((prev) => {
          if (count === 0) {
            const { [item.id]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [item.id]: { ...item, count } };
        });
      };
    
    return (
        <>
            <Navbar menuItems={menuItems} userOptions={userOptions}>
            <div>
                <h1>Your Custom Content Here</h1>
                <p>This is dynamic content in the main area.</p>
            </div>
            {/* Button with icon */}
            <Button
                label="Tambah"
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
                // onClick={handleClick}
                bgColor="bg-blue-600"
                hoverColor="hover:bg-blue-700"
                textColor="text-white"
            />

            {/* Button without icon */}
            <Button
                label="Submit"
                // onClick={handleClick}
                bgColor="bg-green-600"
                hoverColor="hover:bg-green-700"
                textColor="text-white"
            />

            <Table headers={headers} data={data} hasFilter={true} filterFields={filterFields} />

            <Input label="Masukkan Data" type="number" value={value} onChange={setValue}/>
            <Input type="text" value={value} onChange={setValue} width="w-9/12"/>

            <InputDropdown 
            label="Divisi"
            options={["Marketing", "HRD", "Finance", "IT Support", "Logistik"]}
            onSelect={handleSelect}/>

             <div className="p-4">
                <FileInput label="Masukkan Foto Barang" onFileChange={handleFileChange} />
            </div>

            <div>
            <h1 className="text-xl font-bold mb-4">Gallery</h1>
            <Gallery
                items={items}
                onSearch={(term) => console.log("Search Term: ", term)}
                filterFields={filterGallery}
                onItemClick={handleItemClick}
            />
            </div>

            <div className="p-4">
            <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="p-4">
            <Gallery2 items={items2} onSelect={handleSelect2} />
            <div className="mt-4">
                <h2 className="text-lg font-bold">Selected Items:</h2>
                <pre>{JSON.stringify(Object.values(selectedItems2), null, 2)}</pre>
            </div>
            </div>

            </Navbar>
        </>
    );
}
