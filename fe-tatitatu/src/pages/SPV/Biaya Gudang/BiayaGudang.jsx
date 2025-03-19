import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";

export default function BiayaGudang() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBranches, setEditingBranches] = useState({});
  const [data, setData] = useState({ branches: [] });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const userData = JSON.parse(localStorage.getItem('userData'))
  const toko_id = userData.userId
  const isAdminGudang = userData?.role === 'admingudang'
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance'

  const themeColor = (isAdminGudang || isHeadGudang) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
      ? "hitam"
      : "pink";

      const themeColor2 = (isAdminGudang || isHeadGudang) 
      ? 'coklatTua' 
      : (isManajer || isOwner || isFinance) 
        ? "biruTua" 
        : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
          ? "hitam"
          : "primary"; 

      const textHeader = (isAdminGudang || isHeadGudang) 
      ? 'coklatMuda' 
      : (isManajer || isOwner || isFinance) 
        ? "biruMuda" 
        : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
          ? "white"
          : "primary";

  useEffect(() => {
    fetchData();
  }, []);

  const toggleEdit = (branchId) => {
    setEditingBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [branchResponse, biayaResponse] = await Promise.all([
        api.get(`/cabang?toko_id=${toko_id}`),
        api.get('/biaya-toko')
      ]);
  
      if (branchResponse.data.success && biayaResponse.data.success) {
        const branches = branchResponse.data.data
          .filter(branch => !branch.is_deleted);
        
        const combinedData = {
          branches: branches.map(branch => {
            const biaya = biayaResponse.data.data.find(b => b.cabang_id === branch.cabang_id && !b.is_deleted);
            
            return {
              id: branch.cabang_id,
              name: branch.nama_cabang,
              operasional: biaya ? {
                data: biaya.biaya_operasional
                  .filter(op => !op.is_deleted)
                  .map(op => ({
                    id: op.biaya_operasional_id,
                    "Nama Biaya": op.nama_biaya,
                    "Jumlah Biaya": op.jumlah_biaya,
                    isEditable: false
                  })),
                total: biaya.biaya_operasional
                  .filter(op => !op.is_deleted)
                  .reduce((sum, op) => sum + op.jumlah_biaya, 0)
              } : {
                data: [],
                total: 0
              },
              staff: biaya ? {
                data: biaya.biaya_staff
                  .filter(staff => !staff.is_deleted)
                  .map(staff => ({
                    id: staff.biaya_staff_id,
                    "Nama Biaya": staff.nama_biaya,
                    "Jumlah Biaya": staff.jumlah_biaya,
                    isEditable: false
                  })),
                total: biaya.biaya_staff
                  .filter(staff => !staff.is_deleted)
                  .reduce((sum, staff) => sum + staff.jumlah_biaya, 0)
              } : {
                data: [],
                total: 0
              },
              rataTerjual: biaya ? biaya.rata_rata : 0
            };
          })
        };
  
        setData(combinedData);
      } else {
        setErrorMessage('Gagal mengambil data');
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan saat mengambil data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (branchId) => {
    setEditingBranches(prev => ({
      ...prev,
      [branchId]: false
    }));
  };

  const handleSave = async (branchId) => {
    try {
      setLoading(true);
      const branch = data.branches.find(b => b.id === branchId);
      
      const payload = {
        cabang_id: branchId,
        biaya_operasional: branch.operasional.data.map(op => ({
          nama_biaya: op["Nama Biaya"],
          jumlah_biaya: parseInt(op["Jumlah Biaya"])
        })),
        biaya_staff: branch.staff.data.map(staff => ({
          nama_biaya: staff["Nama Biaya"],
          jumlah_biaya: parseInt(staff["Jumlah Biaya"])
        })),
        total: branch.operasional.data.reduce((sum, op) => sum + parseInt(op["Jumlah Biaya"]), 0) +
               branch.staff.data.reduce((sum, staff) => sum + parseInt(staff["Jumlah Biaya"]), 0),
        rata_rata: parseInt(branch.rataTerjual),
        total_biaya: calculateTotalBiaya(branch)
      };
  
      // Get current biaya data
      const biayaResponse = await api.get('/biaya-toko');
      const existingData = biayaResponse.data.data.find(
        b => b.cabang_id === branchId && !b.is_deleted
      );
  
      let response;
      if (existingData) {
        response = await api.put(`/biaya-toko/${branchId}`, payload);
      } else {
        response = await api.post('/biaya-toko', payload);
      }
      
      if (response.data.success) {
        setEditingBranches(prev => ({
          ...prev,
          [branchId]: false
        }));
        await fetchData();
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

  const handleAddOperasionalRow = (branchId) => {
    setData(prevData => ({
      ...prevData,
      branches: prevData.branches.map(branch => {
        if (branch.id === branchId) {
          return {
            ...branch,
            operasional: {
              ...branch.operasional,
              data: [
                ...branch.operasional.data,
                {
                  id: branch.operasional.data.length + 1,
                  "Nama Biaya": "",
                  "Jumlah Biaya": "",
                  isEditable: true,
                }
              ]
            }
          };
        }
        return branch;
      })
    }));
  };

  const handleAddStaffRow = (branchId) => {
    setData(prevData => ({
      ...prevData,
      branches: prevData.branches.map(branch => {
        if (branch.id === branchId) {
          return {
            ...branch,
            staff: {
              ...branch.staff,
              data: [
                ...branch.staff.data,
                {
                  id: branch.staff.data.length + 1,
                  "Nama Biaya": "",
                  "Jumlah Biaya": "",
                  isEditable: true,
                }
              ]
            }
          };
        }
        return branch;
      })
    }));
  };

  const handleDeleteRow = (branchId, section, index) => {
    setData(prevData => ({
      ...prevData,
      branches: prevData.branches.map(branch => {
        if (branch.id === branchId) {
          const updatedData = branch[section].data.filter((_, idx) => idx !== index);
          return {
            ...branch,
            [section]: {
              ...branch[section],
              data: updatedData.map((item, idx) => ({
                ...item,
                id: idx + 1
              }))
            }
          };
        }
        return branch;
      })
    }));
  };


  const calculateTotalBiaya = (branch) => {
    const totalOperasional = branch.operasional.data.reduce((sum, item) => sum + (parseFloat(item["Jumlah Biaya"]) || 0), 0);
    const totalStaff = branch.staff.data.reduce((sum, item) => sum + (parseFloat(item["Jumlah Biaya"]) || 0), 0);
    const total = totalOperasional + totalStaff;
    return branch.rataTerjual ? Math.round(total / branch.rataTerjual) : 0;
  };

  const handleInputChange = (branchId, section, rowIndex, key, value) => {
    setData(prevData => ({
      ...prevData,
      branches: prevData.branches.map(branch => {
        if (branch.id === branchId) {
          const updatedData = branch[section].data.map((row, index) =>
            index === rowIndex ? { ...row, [key]: value } : row
          );
          return {
            ...branch,
            [section]: {
              ...branch[section],
              data: updatedData
            }
          };
        }
        return branch;
      })
    }));
  };

  const handleRataTerjualChange = (branchId, value) => {
    setData(prevData => ({
      ...prevData,
      branches: prevData.branches.map(branch => 
        branch.id === branchId ? { 
          ...branch, 
          rataTerjual: value === "" ? 0 : parseFloat(value)
        } : branch
      )
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
      <div className="p-5">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : data.branches.length === 0 ? (
          <EmptyState />
        ) : (
          data.branches.map(branch => (
            <div key={branch.id} className="bg-white rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M10 0.625C6.25875 0.625 3.125 3.75875 3.125 7.5C3.125 12.6562 9.25625 18.8937 9.5475 19.1912C9.67691 19.3229 9.84977 19.3965 10.0306 19.3965C10.2115 19.3965 10.3843 19.3229 10.5137 19.1912C10.8437 18.8937 16.875 12.6562 16.875 7.5C16.875 3.75875 13.7412 0.625 10 0.625ZM10 10C9.38194 10 8.77775 9.82405 8.26384 9.49441C7.74994 9.16477 7.34542 8.69623 7.09865 8.14805C6.85188 7.59987 6.77193 6.99667 6.86767 6.41473C6.9634 5.83279 7.23085 5.29824 7.63388 4.89521C8.03691 4.49218 8.57146 4.22473 9.1534 4.129C9.73534 4.03326 10.3385 4.11321 10.8867 4.35998C11.4349 4.60675 11.9034 5.01127 12.2331 5.52518C12.5627 6.03908 12.7387 6.64327 12.7387 7.26133C12.7387 8.08569 12.4116 8.87646 11.8291 9.45892C11.2466 10.0414 10.4559 10.3685 9.63154 10.3685L10 10Z" 
                    fill={themeColor === 'hitam' ? '#2D2D2D' : '#7B0C42'}
                  />
                </svg>
                  <h2 className="text-base font-bold">{branch.name}</h2>
                </div>
                <Button
                  label="Edit"
                  bgColor="bg-white border border-orange-500"
                  textColor="text-orange-500"
                  onClick={() => toggleEdit(branch.id)}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Biaya Operasional */}
                <div>
                  <h3 className="font-bold mb-4 text-black">Biaya Operasional<span className="text-red-500">*</span></h3>
                  <table className="w-full">
                    <thead className={`bg-${themeColor}`}>
                      <tr>
                        <th className={`py-2 px-4 text-left text-${textHeader}`}>No</th>
                        <th className={`py-2 px-4 text-left text-${textHeader}`}>Nama Biaya</th>
                        <th className={`py-2 px-4 text-left text-${textHeader}`}>Jumlah Biaya</th>
                        {editingBranches[branch.id] && (
                          <th className={`py-2 px-4 text-left text-${textHeader}`}>Aksi</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {branch.operasional.data.map((item, index) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-4">{index + 1}</td>
                          <td className="py-2 px-4">
                            {editingBranches[branch.id] ? (
                              <Input
                                showRequired={false}
                                value={item["Nama Biaya"]}
                                onChange={(value) => handleInputChange(branch.id, 'operasional', index, "Nama Biaya", value)}
                              />
                            ) : item["Nama Biaya"]}
                          </td>
                          <td className="py-2 px-4">
                            {editingBranches[branch.id] ? (
                              <Input
                                showRequired={false}
                                type="number"
                                value={item["Jumlah Biaya"]}
                                onChange={(value) => handleInputChange(branch.id, 'operasional', index, "Jumlah Biaya", value)}
                              />
                            ) : `Rp${item["Jumlah Biaya"].toLocaleString("id-ID")}`}
                          </td>
                          {editingBranches[branch.id] && (
                            <td className="py-2 px-4">
                              <button 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteRow(branch.id, 'operasional', index)}
                              >
                                Hapus
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {editingBranches[branch.id] && (
                    <button 
                      onClick={() => handleAddOperasionalRow(branch.id)}
                      className={`mt-4 flex items-center gap-2 text-${themeColor} hover:text-${themeColor}-dark`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Tambah Baris
                    </button>
                  )}
                </div>

                {/* Biaya Staff */}
                <div>
                  <h3 className="font-bold mb-4 text-black">Biaya Staff</h3>
                  <table className="w-full">
                    <thead className={`bg-${themeColor}`}>
                      <tr>
                        <th className={`py-2 px-4 text-left text-${textHeader}`}>No</th>
                        <th className={`py-2 px-4 text-left text-${textHeader}`}>Nama Biaya</th>
                        <th className={`py-2 px-4 text-left text-${textHeader}`}>Jumlah Biaya</th>
                        {editingBranches[branch.id] && (
                          <th className={`py-2 px-4 text-left text-${textHeader}`}>Aksi</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {branch.staff.data.map((item, index) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-4">{index + 1}</td>
                          <td className="py-2 px-4">
                            {editingBranches[branch.id] ? (
                              <Input
                                showRequired={false}
                                value={item["Nama Biaya"]}
                                onChange={(value) => handleInputChange(branch.id, 'staff', index, "Nama Biaya", value)}
                              />
                            ) : item["Nama Biaya"]}
                          </td>
                          <td className="py-2 px-4">
                            {editingBranches[branch.id] ? (
                              <Input
                                showRequired={false}
                                type="number"
                                value={item["Jumlah Biaya"]}
                                onChange={(value) => handleInputChange(branch.id, 'staff', index, "Jumlah Biaya", value)}
                              />
                            ) : `Rp${item["Jumlah Biaya"].toLocaleString("id-ID")}`}
                          </td>
                          {editingBranches[branch.id] && (
                            <td className="py-2 px-4">
                              <button 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteRow(branch.id, 'staff', index)}
                              >
                                Hapus
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {editingBranches[branch.id] && (
                    <button 
                      onClick={() => handleAddStaffRow(branch.id)}
                      className={`mt-4 flex items-center gap-2 text-${themeColor} hover:text-${themeColor}-dark`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Tambah Baris
                    </button>
                    )}
                  

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center border-b py-2">
                      <span className="font-bold">Total</span>
                      <span>Rp{(
                        branch.staff.data.reduce((sum, item) => sum + (parseFloat(item["Jumlah Biaya"]) || 0), 0) +
                        branch.operasional.data.reduce((sum, item) => sum + (parseFloat(item["Jumlah Biaya"]) || 0), 0)
                      ).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center border-b py-2">
                      <span className="font-bold">Rata-Rata Terjual</span>
                      <span>
                        {editingBranches[branch.id] ? (
                          <Input
                            showRequired={false}
                            type="number"
                            value={branch.rataTerjual}
                            onChange={(value) => handleRataTerjualChange(branch.id, value)}
                          />
                        ) : `${branch.rataTerjual.toLocaleString('id-iD')}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className={`font-bold text-${themeColor}`}>Total Biaya</span>
                      <span className={`text-${themeColor} font-bold`}>Rp{calculateTotalBiaya(branch).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                {editingBranches[branch.id] && (
                  <div className="col-span-2 flex justify-end gap-4 mt-4">
                    <Button 
                      label="Batal"
                      bgColor="bg-white border-secondary border"
                      textColor="text-gray-700"
                      onClick={() => handleCancel(branch.id)}
                    />
                    <Button 
                      label="Simpan"
                      bgColor={`bg-${themeColor2}`}
                      textColor="text-white"
                      onClick={() => handleSave(branch.id)}
                    />
                  </div>
                )}
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