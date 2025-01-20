import { useState, useEffect } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Gallery from "../../../components/Gallery";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";

export default function DataBarang(){
    const [id, setId] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [isModalDelete, setModalDelete] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);

    const [subMenus, setSubMenus] = useState([]);

    const navigate = useNavigate();

    // Fetch Sub Menus
    const fetchSubMenus = async () => {
      try {
          setIsLoading(true);
          const response = await api.get('/kategori-barang');
          
          if (response.data.success) {
              const subMenuOptions = response.data.data.map(item => item.nama_kategori_barang);

              setSubMenus(['Semua', ...subMenuOptions]);
          }
      } catch (error) {
          console.error('Error fetching sub menus:', error);
      } finally {
          setIsLoading(false);
      }
    };
    
    const fetchDataBarang = async () => {
      try {
          setIsLoading(true);
          const response = await api.get('/barang-handmadenon');
          
          if (response.data.success) {
              const transformedData = response.data.data.map(item => {
                  return {
                      id: item.barang_id,
                      title: item.nama_barang,
                      price: `Rp${item.harga_jual.toLocaleString('id-ID')}`,
                      image: item.img || "https://via.placeholder.com/50",
                      type: item.packaging.nama_packaging,
                      category: item.jenis.jenis_barang
                  };
              });
              
              setData(transformedData);
          }
      } catch (error) {
          console.error('Error fetching data barang:', error);
      } finally {
          setIsLoading(false);
      }
  };
  
  useEffect(() => {
      fetchSubMenus();
      fetchDataBarang(); 
  }, []);

    const handleAdd = () => {
        navigate('/dataBarang/handmade/tambah');
    };

    const handleBtnEdit = (id) => {
        navigate(`/dataBarang/handmade/edit/${id.id}`);
    };
  
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

    // Tampilkan loading jika sedang memuat
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return(
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className="text-primary text-base font-bold">Daftar Barang Handmade</p>
                    </div>

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
                        <Gallery 
                            data={data} 
                            subMenus={subMenus} 
                            enableSubMenus={true} 
                            onEdit={handleBtnEdit} 
                            onDelete={handleBtnDelete} 
                            onItemClick={(item) => navigate(`/dataBarang/handmade/detail/${item.id}`)}
                        />
                    </div>
                </section>

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
                {isModalSucc && (
                    <AlertSuccess
                    title="Berhasil!!"
                    description="Data berhasil dihapus"
                    confirmLabel="Ok"
                    onConfirm={handleConfirmSucc}
                    />
                )}
            </div>
        </LayoutWithNav>
    );
}