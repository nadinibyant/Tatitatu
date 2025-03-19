import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import LayoutWithNav from "../../../components/LayoutWithNav";
import Spinner from "../../../components/Spinner";
import api from "../../../utils/api";
import AlertSuccess from "../../../components/AlertSuccess";
import AlertError from "../../../components/AlertError";

export default function BiayaRumahProduksi() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setLoading] = useState(false)
  const [alertSucc, setAlertSucc] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const [data, setData] = useState({
    operasionalStaff: {
      data: [],
      total: 0,
      rataTercetak: 0
    },
    operasionalProduksi: {
      data: [],
      waktuKerja: 0,
      totalModal: 0
    }
  });

  const fetchBiayaGudang = async () => {
    try {
      setLoading(true);
      const response = await api.get('/biaya-gudang');
      
      if (response.data.success) {
        const apiData = response.data.data;

        const transformedData = {
          operasionalStaff: {
            data: apiData?.biaya_staff ? apiData.biaya_staff.map((item, index) => ({
              id: index + 1,
              "Nama Biaya": item.nama_biaya,
              "Total Biaya": parseInt(item.total_biaya)
            })) : [],
            total: parseFloat(apiData?.total || 0),
            rataTercetak: parseInt(apiData?.rata_rata || 0)
          },
          operasionalProduksi: {
            data: apiData?.biaya_operasional ? apiData.biaya_operasional.map((item, index) => ({
              id: index + 1,
              "Nama Divisi": item.nama_biaya,
              "Total Biaya": parseInt(item.total_biaya)
            })) : [], 
            waktuKerja: parseInt(apiData?.waktu_kerja || 0),
            totalModal: parseFloat(apiData?.total_modal || 0)
          }
        };
        
        setData(transformedData);
      } else {
        setData({
          operasionalStaff: {
            data: [],
            total: 0,
            rataTercetak: 0
          },
          operasionalProduksi: {
            data: [],
            waktuKerja: 0,
            totalModal: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData({
        operasionalStaff: {
          data: [],
          total: 0,
          rataTercetak: 0
        },
        operasionalProduksi: {
          data: [],
          waktuKerja: 0,
          totalModal: 0
        }
      });
      setErrorMessage(error.response?.data?.message || "Error fetching data");
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
};

  useEffect(() => {
    fetchBiayaGudang();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true)
      const formDataToSend = {
        biaya_operasional: data.operasionalProduksi.data.map(item => ({
          nama_biaya: item["Nama Divisi"],
          jumlah_biaya: item["Total Biaya"]
        })),
        biaya_staff: data.operasionalStaff.data.map(item => ({
          nama_biaya: item["Nama Biaya"],
          jumlah_biaya: item["Total Biaya"]
        })),
        total: data.operasionalStaff.total,
        rata_rata: data.operasionalStaff.rataTercetak,
        total_biaya: calculateTotalBiaya(),
        waktu_kerja: data.operasionalProduksi.waktuKerja,
        total_modal: calculateTotalModal()
      };

      const response = await api.put('/biaya-gudang/1', formDataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setAlertSucc(true);
        setIsEditing(false);
      } else {
        setErrorMessage(response.data.message);
        setErrorAlert(true);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error saving data");
      setErrorAlert(true);
    } finally {
      setLoading(false)
    }
  };

  const handleAddOperasionalStaffRow = () => {
    setData(prev => ({
      ...prev,
      operasionalStaff: {
        ...prev.operasionalStaff,
        data: [
          ...prev.operasionalStaff.data,
          {
            id: prev.operasionalStaff.data.length + 1,
            "Nama Biaya": "",
            "Total Biaya": 0,
          }
        ]
      }
    }));
  };

  const handleAddOperasionalProduksiRow = () => {
    setData(prev => ({
      ...prev,
      operasionalProduksi: {
        ...prev.operasionalProduksi,
        data: [
          ...prev.operasionalProduksi.data,
          {
            id: prev.operasionalProduksi.data.length + 1,
            "Nama Divisi": "",
            "Total Biaya": 0,
          }
        ]
      }
    }));
  };

  const handleDeleteRow = (section, index) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        data: prev[section].data.filter((_, idx) => idx !== index)
      }
    }));
  };

  const handleInputChange = (section, index, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        data: prev[section].data.map((item, idx) => 
          idx === index ? { ...item, [field]: value } : item
        ),
        ...(section === 'operasionalStaff' && {
          total: field === 'Total Biaya' 
            ? prev.operasionalStaff.data.reduce((sum, item, i) => 
                sum + (i === index ? Number(value) : Number(item["Total Biaya"])), 0)
            : prev.operasionalStaff.total
        })
      }
    }));
  };

  const handleMetricChange = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: Number(value)
      }
    }));
  };

  const calculateTotalBiaya = () => {
    const total = data.operasionalStaff.data.reduce((sum, item) => sum + Number(item["Total Biaya"]), 0);
    return data.operasionalStaff.rataTercetak ? total / data.operasionalStaff.rataTercetak : 0;
  };

  const calculateTotalModal = () => {
    const total = data.operasionalProduksi.data.reduce((sum, item) => sum + Number(item["Total Biaya"]), 0);
    return data.operasionalProduksi.waktuKerja ? total / data.operasionalProduksi.waktuKerja : 0;
  };

  return (
    <LayoutWithNav>
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-coklatTua">Rincian Biaya Dansa</h2>
          {!isEditing ? (
            <Button
              label="Edit"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3043 2.75 17.863 2.75C18.421 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.571 21.275 6.113C21.2917 6.65433 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z" fill="#FB6D3A"/>
              </svg>}
              bgColor="bg-white border border-orange-500"
              textColor="text-orange-500"
              onClick={() => setIsEditing(true)}
            />
          ) : (
            <div className="flex gap-4">
              <Button
                label="Batal"
                bgColor="border border-secondary"
                textColor="text-black"
                onClick={() => setIsEditing(false)}
              />
              <Button
                label="Simpan"
                bgColor="bg-coklatTua"
                textColor="text-white"
                onClick={handleSave}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Biaya Operasional dan Staff */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-bold mb-4 text-black">Biaya Operasional dan Staff<span className="text-red-500">*</span></h3>
            <table className="w-full">
              <thead className="bg-coklatMuda">
                <tr>
                  <th className="py-2 px-4 text-left">No</th>
                  <th className="py-2 px-4 text-left">Nama Biaya</th>
                  <th className="py-2 px-4 text-left">Total Biaya</th>
                  {isEditing && <th className="py-2 px-4">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {data.operasionalStaff.data.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">
                      {isEditing ? (
                        <Input
                          showRequired={false}
                          value={item["Nama Biaya"]}
                          onChange={(value) => handleInputChange("operasionalStaff", index, "Nama Biaya", value)}
                        />
                      ) : item["Nama Biaya"]}
                    </td>
                    <td className="py-2 px-4">
                      {isEditing ? (
                        <Input
                        showRequired={false}
                          type="number"
                          value={item["Total Biaya"]}
                          onChange={(value) => handleInputChange("operasionalStaff", index, "Total Biaya", value)}
                        />
                      ) : `Rp${item["Total Biaya"].toLocaleString()}`}
                    </td>
                    {isEditing && (
                      <td className="py-2 px-4 text-center">
                        <button 
                          onClick={() => handleDeleteRow("operasionalStaff", index)}
                          className="text-red-500"
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {isEditing && (
              <button 
                onClick={handleAddOperasionalStaffRow}
                className="mt-4 text-coklatTua flex items-center gap-2"
              >
                <span>+</span> Tambah Baris
              </button>
            )}
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span>Rp{data.operasionalStaff.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Rata-Rata Tercetak</span>
                <span>
                  {isEditing ? (
                    <Input
                    showRequired={false}
                      type="number"
                      required={true}
                      value={data.operasionalStaff.rataTercetak}
                      onChange={(value) => handleMetricChange("operasionalStaff", "rataTercetak", value)}
                    />
                  ) : data.operasionalStaff.rataTercetak.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-coklatTua font-bold">Total Biaya</span>
                <span className="text-coklatTua font-bold">Rp{Math.round(calculateTotalBiaya()).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Biaya Operasional Produksi */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-bold mb-4">Biaya Operasional Produksi</h3>
            <table className="w-full">
              <thead className="bg-coklatMuda">
                <tr>
                  <th className="py-2 px-4 text-left">No</th>
                  <th className="py-2 px-4 text-left">Nama Divisi</th>
                  <th className="py-2 px-4 text-left">Total Biaya</th>
                  {isEditing && <th className="py-2 px-4">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {data.operasionalProduksi.data.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">
                      {isEditing ? (
                        <Input
                        showRequired={false}
                          value={item["Nama Divisi"]}
                          onChange={(value) => handleInputChange("operasionalProduksi", index, "Nama Divisi", value)}
                        />
                      ) : item["Nama Divisi"]}
                    </td>
                    <td className="py-2 px-4">
                      {isEditing ? (
                        <Input
                        showRequired={false}
                          type="number"
                          value={item["Total Biaya"]}
                          onChange={(value) => handleInputChange("operasionalProduksi", index, "Total Biaya", value)}
                        />
                      ) : `Rp${item["Total Biaya"].toLocaleString()}`}
                    </td>
                    {isEditing && (
                      <td className="py-2 px-4 text-center">
                        <button 
                          onClick={() => handleDeleteRow("operasionalProduksi", index)}
                          className="text-red-500"
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {isEditing && (
              <button 
                onClick={handleAddOperasionalProduksiRow}
                className="mt-4 text-coklatTua flex items-center gap-2"
              >
                <span>+</span> Tambah Baris
              </button>
            )}

            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Waktu Kerja</span>
                <span>
                  {isEditing ? (
                    <Input
                    showRequired={false}
                      type="number"
                      required={true}
                      value={data.operasionalProduksi.waktuKerja}
                      onChange={(value) => handleMetricChange("operasionalProduksi", "waktuKerja", value)}
                    />
                  ) : data.operasionalProduksi.waktuKerja}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-coklatTua font-bold">Total Modal Operasional Produksi</span>
                <span className="text-coklatTua font-bold">Rp{Math.round(calculateTotalModal()).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isLoading && <Spinner/>}

              {alertSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil diperbaharui"
                        confirmLabel="Ok"
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
    </LayoutWithNav>
  );
}