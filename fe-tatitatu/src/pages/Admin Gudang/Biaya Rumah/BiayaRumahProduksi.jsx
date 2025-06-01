import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import LayoutWithNav from "../../../components/LayoutWithNav";
import Spinner from "../../../components/Spinner";
import api from "../../../utils/api";
import AlertSuccess from "../../../components/AlertSuccess";
import AlertError from "../../../components/AlertError";
import { useLocation } from "react-router-dom";
import { menuItems, userOptions } from "../../../data/menu";

export default function BiayaRumahProduksi() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [alertSucc, setAlertSucc] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [persentase, setPersentase] = useState(0);
  const location = useLocation();

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdminGudang = userData?.role === 'admingudang';
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance';
  const isKaryawanProduksi = userData?.role === 'karyawanproduksi';
  
  const isAbsensiRoute = 
    location.pathname === '/absensi-karyawan' || 
    location.pathname === '/absensi-karyawan-transport' || 
    location.pathname === '/absensi-karyawan-produksi' ||
    location.pathname === '/izin-cuti-karyawan' ||
    location.pathname === '/profile' ||
    location.pathname.startsWith('/absensi-karyawan-produksi/tambah');
    
  const store_id = userData?.tokoId;
  
  const themeColor = isAbsensiRoute
    ? (!store_id 
        ? "biruTua" 
        : store_id === 1 
          ? "coklatTua" 
          : store_id === 2 
            ? "primary" 
            : "hitam")
    : (isAdminGudang || isHeadGudang || isKaryawanProduksi) 
      ? 'coklatTua' 
      : (isManajer || isOwner || isFinance) 
        ? "biruTua" 
        : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
          ? "hitam"
          : "primary";
          
  const bgColor = themeColor === 'primary' ? 'pink' : 
                 themeColor === 'hitam' ? 'hitam' : 
                 themeColor === 'biruTua' ? 'biruTua' :
                 'coklatMuda';
                 
  const textColor = themeColor === 'primary' ? 'primary' : 
                   themeColor === 'hitam' ? 'white' : 
                   themeColor === 'biruTua' ? 'biruMuda' :
                   'coklatTua';

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/biaya-gudang'); // tetap menggunakan endpoint biaya-gudang
      
      if (response.data.success) {
        // Mengambil persentase dari respons API
        const apiData = response.data.data;
        setPersentase(apiData?.persentase || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage(error.response?.data?.message || "Error fetching data");
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Payload berdasarkan struktur baru
      const formDataToSend = {
        persentase: persentase
      };

      // Tetap menggunakan endpoint yang sama
      const response = await api.put('/biaya-gudang/1', formDataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setAlertSucc(true);
        setIsEditing(false);
        
        setTimeout(() => {
          setAlertSucc(false);
        }, 3000);
      } else {
        setErrorMessage(response.data.message || "Gagal menyimpan data");
        setErrorAlert(true);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setErrorMessage(error.response?.data?.message || "Error saving data");
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchData(); 
  };

  const handlePercentageChange = (value) => {
    setPersentase(value === "" ? 0 : parseFloat(value));
  };

  return (
    <LayoutWithNav
      menuItems={menuItems}
      userOptions={userOptions}
    >
      <div className="p-3 md:p-5">
        
        
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="bg-white rounded-xl p-4 md:p-6 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div className="left w-full md:w-auto pb-5">
                <p className={`text-${themeColor} text-base font-bold`}>Persentase HPP Dansa</p>
              </div>
              {!isEditing ? (
                <Button
                  label="Edit"
                  bgColor="bg-white border border-orange-500"
                  textColor="text-orange-500"
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto"
                  icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3043 2.75 17.863 2.75C18.421 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.571 21.275 6.113C21.2917 6.65433 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z" fill="#FB6D3A"/>
                  </svg>}
                />
              ) : (
                <div className="flex gap-2">
                  <Button
                    label="Batal"
                    bgColor="bg-white border-secondary border"
                    textColor="text-gray-700"
                    onClick={handleCancel}
                    className="w-full sm:w-auto"
                  />
                  <Button
                    label="Simpan"
                    bgColor={`bg-${themeColor}`}
                    textColor="text-white"
                    onClick={handleSave}
                    className="w-full sm:w-auto"
                  />
                </div>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg">
              <table className="w-full min-w-[640px]">
                <thead className={`bg-${bgColor} rounded-t-lg`}>
                  <tr>
                    <th className={`py-3 px-4 text-left text-${textColor} text-sm font-semibold rounded-tl-lg w-16`}>No</th>
                    <th className={`py-3 px-4 text-left text-${textColor} text-sm font-semibold`}>Nama Biaya</th>
                    <th className={`py-3 px-4 text-left text-${textColor} text-sm font-semibold rounded-tr-lg`}>Persentase</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-b">
                    <td className="py-3 px-4 text-sm">1</td>
                    <td className="py-3 px-4 text-sm">Persentase HPP</td>
                    <td className="py-3 px-4 text-sm">
                      {isEditing ? (
                        <div className="max-w-[120px]">
                          <Input
                            showRequired={false}
                            type="number"
                            value={persentase}
                            onChange={(value) => handlePercentageChange(value)}
                            className="w-full text-sm"
                            suffixText="%"
                          />
                        </div>
                      ) : (
                        `${persentase}%`
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {alertSucc && (
          <AlertSuccess
            title="Berhasil!!"
            description="Data berhasil diperbaharui"
            confirmLabel="Ok"
            onConfirm={() => setAlertSucc(false)}
          />
        )}

        {errorAlert && (
          <AlertError
            title="Gagal!!"
            description={errorMessage}
            confirmLabel="Ok"
            onConfirm={() => setErrorAlert(false)}
          />
        )}
      </div>
    </LayoutWithNav>
  );
}