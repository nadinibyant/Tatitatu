import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import { useLocation } from "react-router-dom";

export default function BiayaGudang() {
  const [isEditing, setIsEditing] = useState({});
  const [branches, setBranches] = useState([]);
  const [branchData, setBranchData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const toko_id = userData.userId;
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const branchResponse = await api.get(`/cabang?toko_id=${toko_id}`);
      
      if (!branchResponse.data.success) {
        setErrorMessage('Gagal mengambil data cabang');
        return;
      }
      
      const activeBranches = branchResponse.data.data.filter(branch => !branch.is_deleted);
      setBranches(activeBranches);
      const branchDataMap = {};
      
      for (const branch of activeBranches) {
        try {
          const biayaResponse = await api.get(`/biaya-toko/${branch.cabang_id}`);
          
          if (biayaResponse.data.success) {
            branchDataMap[branch.cabang_id] = biayaResponse.data.data;
          } else {
            branchDataMap[branch.cabang_id] = {
              cabang_id: branch.cabang_id,
              persentase: 0,
              exists: false
            };
          }
        } catch (error) {
          branchDataMap[branch.cabang_id] = {
            cabang_id: branch.cabang_id,
            persentase: 0,
            exists: false
          };
        }
      }
      
      setBranchData(branchDataMap);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branchId) => {
    setIsEditing(prev => ({
      ...prev,
      [branchId]: true
    }));
  };

  const handleCancel = (branchId) => {
    setIsEditing(prev => ({
      ...prev,
      [branchId]: false
    }));
    
    // Reset to original value by refetching
    fetchData();
  };

  const handleSave = async (branchId) => {
    try {
      setLoading(true);
      const branch = branches.find(b => b.cabang_id === branchId);
      const branchPercentage = branchData[branchId]?.persentase || 0;
      
      // Create payload
      const payload = {
        cabang_id: branchId,
        persentase: branchPercentage
      };
      
      let response;
      
      // Check if data already exists for this branch
      if (branchData[branchId]?.exists === false) {
        // If data doesn't exist, use POST to create new
        response = await api.post('/biaya-toko', payload);
      } else {
        // If data exists, use PUT to update
        response = await api.put(`/biaya-toko/${branchId}`, {
          persentase: branchPercentage
        });
      }
      
      if (response.data.success) {
        setIsEditing(prev => ({
          ...prev,
          [branchId]: false
        }));
        await fetchData(); // Refresh data
      } else {
        setErrorMessage('Gagal menyimpan perubahan');
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan saat menyimpan data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePercentageChange = (branchId, value) => {
    setBranchData(prev => ({
      ...prev,
      [branchId]: {
        ...prev[branchId],
        persentase: value === "" ? 0 : parseFloat(value)
      }
    }));
  };

  const EmptyState = () => (
    <div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Data Cabang Belum Tersedia</h3>
      <p className="text-gray-500 text-center mb-6">
        Belum ada cabang yang terdaftar. Silakan tambahkan cabang terlebih dahulu.
      </p>
    </div>
  );

  return (
    <LayoutWithNav>
      <div className="p-3 md:p-5">
          <div className="left w-full md:w-auto pb-5">
            <p className={`text-${themeColor} text-base font-bold`}>Persentase HPP Toko</p>
          </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : branches.length === 0 ? (
          <EmptyState />
        ) : (
          branches.map(branch => (
            <div key={branch.cabang_id} className="bg-white rounded-xl p-4 md:p-6 mb-8 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.8217 13.6253C17.5093 12.3348 17.8675 10.8945 17.8647 9.43233C17.8647 4.49906 13.8656 0.5 8.93235 0.5C3.99907 0.5 1.37724e-05 4.49906 1.37724e-05 9.43233C-0.00369351 11.5395 0.741157 13.5794 2.10174 15.1884L2.11225 15.2016L2.12171 15.2121H2.10174L7.40229 20.8394C7.59878 21.048 7.83585 21.2142 8.09893 21.3278C8.362 21.4414 8.64553 21.5 8.93208 21.5C9.21864 21.5 9.50216 21.4414 9.76524 21.3278C10.0283 21.2142 10.2654 21.048 10.4619 20.8394L15.763 15.2121H15.743L15.7514 15.2021L15.7524 15.201C15.7903 15.1559 15.8279 15.1103 15.8654 15.0644C16.23 14.6166 16.5502 14.135 16.8217 13.6253ZM8.93497 12.8471C8.09886 12.8471 7.29698 12.515 6.70576 11.9237C6.11453 11.3325 5.78238 10.5306 5.78238 9.69452C5.78238 8.85841 6.11453 8.05653 6.70576 7.46531C7.29698 6.87408 8.09886 6.54194 8.93497 6.54194C9.77109 6.54194 10.573 6.87408 11.1642 7.46531C11.7554 8.05653 12.0876 8.85841 12.0876 9.69452C12.0876 10.5306 11.7554 11.3325 11.1642 11.9237C10.573 12.515 9.77109 12.8471 8.93497 12.8471Z" fill="#7B0C42"/>
                  </svg>
                  <h2 className="text-base font-bold break-words">Cabang {branch.nama_cabang}</h2>
                </div>
                
                {!isEditing[branch.cabang_id] ? (
                  <Button
                    label="Edit"
                    bgColor="bg-white border border-orange-500"
                    textColor="text-orange-500"
                    onClick={() => handleEdit(branch.cabang_id)}
                    className="w-full sm:w-auto"
                  />
                ) : (
                  <div className="flex gap-2">
                    <Button
                      label="Batal"
                      bgColor="bg-white border-secondary border"
                      textColor="text-gray-700"
                      onClick={() => handleCancel(branch.cabang_id)}
                      className="w-full sm:w-auto"
                    />
                    <Button
                      label="Simpan"
                      bgColor={`bg-${themeColor}`}
                      textColor="text-white"
                      onClick={() => handleSave(branch.cabang_id)}
                      className="w-full sm:w-auto"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-sm text-gray-800 mb-2">Persentase Untuk Harga Ideal <span className="text-red-500">*</span></h3>
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
                        {isEditing[branch.cabang_id] ? (
                          <div className="max-w-[120px]">
                            <Input
                              showRequired={false}
                              type="number"
                              value={branchData[branch.cabang_id]?.persentase || 0}
                              onChange={(value) => handlePercentageChange(branch.cabang_id, value)}
                              className="w-full text-sm"
                              suffixText="%"
                            />
                          </div>
                        ) : (
                          `${branchData[branch.cabang_id]?.persentase || 0}%`
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}
      </div>
    </LayoutWithNav>
  );
}