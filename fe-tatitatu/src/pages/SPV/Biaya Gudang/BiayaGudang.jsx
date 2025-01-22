import { useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function BiayaGudang() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBranches, setEditingBranches] = useState({});

  const toggleEdit = (branchId) => {
    setEditingBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };

  // Struktur data baru berdasarkan cabang
  const [data, setData] = useState({
    branches: [
      {
        id: 1,
        name: "Cabang GOR HAS",
        operasional: {
          data: [
            {
              id: 1,
              "Nama Biaya": "Head",
              "Jumlah Biaya": 500000,
              isEditable: false,
            }
          ],
          total: 500000,
        },
        staff: {
          data: [
            {
              id: 1,
              "Nama Biaya": "Produksi",
              "Jumlah Biaya": 500000,
              isEditable: false,
            }
          ],
          total: 500000,
        },
        rataTerjual: 30,
      },
      {
        id: 2,
        name: "Cabang Lubeg",
        operasional: {
          data: [
            {
              id: 1,
              "Nama Biaya": "Head",
              "Jumlah Biaya": 500000,
              isEditable: false,
            }
          ],
          total: 500000,
        },
        staff: {
          data: [
            {
              id: 1,
              "Nama Biaya": "Produksi",
              "Jumlah Biaya": 500000,
              isEditable: false,
            }
          ],
          total: 500000,
        },
        rataTerjual: 30,
      },
    ]
  });

  const handleCancel = (branchId) => {
    setEditingBranches(prev => ({
      ...prev,
      [branchId]: false
    }));
  };

  const handleSave = (branchId) => {
    setEditingBranches(prev => ({
      ...prev,
      [branchId]: false
    }));
    // logic untuk menyimpan ke backend
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

  return (
    <LayoutWithNav>
      <div className="p-5">
        {data.branches.map(branch => (
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
                  fill="#7B0C42"
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
                  <thead className="bg-pink">
                    <tr>
                      <th className="py-2 px-4 text-left text-black">No</th>
                      <th className="py-2 px-4 text-left text-black">Nama Biaya</th>
                      <th className="py-2 px-4 text-left text-black">Jumlah Biaya</th>
                      {editingBranches[branch.id] && (
                        <th className="py-2 px-4 text-left text-black">Aksi</th>
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
                    className="mt-4 flex items-center gap-2 text-primary hover:text-primary-dark"
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
                  <thead className="bg-pink">
                    <tr>
                      <th className="py-2 px-4 text-left text-black">No</th>
                      <th className="py-2 px-4 text-left text-black">Nama Biaya</th>
                      <th className="py-2 px-4 text-left text-black">Jumlah Biaya</th>
                      {editingBranches[branch.id] && (
                        <th className="py-2 px-4 text-left text-black">Aksi</th>
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
                    className="mt-4 flex items-center gap-2 text-primary hover:text-primary-dark"
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
                      ) : `${branch.rataTerjual}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-bold text-primary">Total Biaya</span>
                    <span className="text-primary">Rp{calculateTotalBiaya(branch).toLocaleString("id-ID")}</span>
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
                    bgColor="bg-primary"
                    textColor="text-white"
                    onClick={() => handleSave(branch.id)}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </LayoutWithNav>
  );
}