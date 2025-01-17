import { useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function BiayaGudang() {
  const [isEditing, setIsEditing] = useState(false);

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
        branch.id === branchId ? { ...branch, rataTerjual: parseFloat(value) } : branch
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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0Z" fill="#7B0C42"/>
                </svg>
                <h2 className="text-base font-bold">{branch.name}</h2>
              </div>
              <Button
                label="Edit"
                bgColor="bg-white border border-orange-500"
                textColor="text-orange-500"
                onClick={() => setIsEditing(!isEditing)}
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
                    </tr>
                  </thead>
                  <tbody>
                    {branch.operasional.data.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">
                          {isEditing ? (
                            <Input
                              showRequired={false}
                              value={item["Nama Biaya"]}
                              onChange={(value) => handleInputChange(branch.id, 'operasional', index, "Nama Biaya", value)}
                            />
                          ) : item["Nama Biaya"]}
                        </td>
                        <td className="py-2 px-4">
                          {isEditing ? (
                            <Input
                              showRequired={false}
                              type="number"
                              value={item["Jumlah Biaya"]}
                              onChange={(value) => handleInputChange(branch.id, 'operasional', index, "Jumlah Biaya", value)}
                            />
                          ) : `Rp${item["Jumlah Biaya"].toLocaleString("id-ID")}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Biaya Staff */}
              <div>
                <h3 className="font-bold mb-4 text-black">Biaya Staff</h3>
                <table className="w-full">
                  <thead className="bg-pink ">
                    <tr>
                      <th className="py-2 px-4 text-left text-black">No</th>
                      <th className="py-2 px-4 text-left text-black">Nama Biaya</th>
                      <th className="py-2 px-4 text-left text-black">Jumlah Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branch.staff.data.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">
                          {isEditing ? (
                            <Input
                              showRequired={false}
                              value={item["Nama Biaya"]}
                              onChange={(value) => handleInputChange(branch.id, 'staff', index, "Nama Biaya", value)}
                            />
                          ) : item["Nama Biaya"]}
                        </td>
                        <td className="py-2 px-4">
                          {isEditing ? (
                            <Input
                              showRequired={false}
                              type="number"
                              value={item["Jumlah Biaya"]}
                              onChange={(value) => handleInputChange(branch.id, 'staff', index, "Jumlah Biaya", value)}
                            />
                          ) : `Rp${item["Jumlah Biaya"].toLocaleString("id-ID")}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
                      {isEditing ? (
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
            </div>
          </div>
        ))}
      </div>
    </LayoutWithNav>
  );
}