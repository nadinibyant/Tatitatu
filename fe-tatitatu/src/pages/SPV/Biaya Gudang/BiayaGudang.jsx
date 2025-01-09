import { useState, useEffect, useRef } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import Table from "../../../components/Table";
import { menuItems, userOptions } from "../../../data/menu";
import Input from "../../../components/Input";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function BiayaGudang() {
    const [isEditing, setIsEditing] = useState(false);

  const headers = [
    { label: "No", key: "No", align: "text-left" },
    { label: "Nama Biaya", key: "Nama Biaya", align: "text-left" },
    { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
    { label: "", key: "Aksi", align: "text-center" },
  ];

  const [data, setData] = useState({
    operasional: {
      data: [
        {
          id: 1,
          "Nama Biaya": "Head",
          "Total Biaya": 1500000,
          isEditable: false,
        },
        {
          id: 2,
          "Nama Biaya": "Cleaning",
          "Total Biaya": 500000,
          isEditable: false,
        },
        {
          id: 3,
          "Nama Biaya": "Maintenance",
          "Total Biaya": 750000,
          isEditable: false,
        },
      ],
      total: 1500000,
      "Rata Rata Tercetak": 157689,
      "Total Biaya": 2400,
    },
    produksi: {
      data: [
        {
          id: 1,
          "Nama Biaya": "Head",
          "Total Biaya": 1500000,
          isEditable: false,
        },
      ],
      "Waktu Kerja": 10090,
      "Total Modal Operasional Produksi": 1000,
    },
  });
  

  const operasionalTableRef = useRef(null);
  const produksiTableRef = useRef(null);

  // Fungsi untuk toggle edit mode
    const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };
  
  // Fungsi untuk mengubah nilai rata-rata atau waktu kerja
  const handleSummaryChange = (section, key, value) => {
    setData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [key]: value,
      },
    }));
  };

  const handleAddRow = (section) => {
    console.log("Adding row to section:", section); 
    const newRow = {
        id: Date.now(),
      "Nama Biaya": "",
      "Total Biaya": "",
      isEditable: true,
    };
  
    setData((prevData) => { 
      const updatedData = {
        ...prevData,
        [section]: {
          ...prevData[section],
          data: [...prevData[section].data, newRow],
        },
      };
      return updatedData;
    });
  };
  
  

  const handleInputChange = (section, rowIndex, key, value) => {
    const updatedData = data[section].data.map((row, index) =>
      index === rowIndex ? { ...row, [key]: value } : row
    );
    setData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        data: updatedData,
      },
    }));
  };

  const handleOutsideClick = (event) => {
    const isClickOnDeleteButton = event.target.closest(".delete-button");
    if (isClickOnDeleteButton) return; 
  
    if (
      operasionalTableRef.current &&
      !operasionalTableRef.current.contains(event.target) &&
      produksiTableRef.current &&
      !produksiTableRef.current.contains(event.target)
    ) {
      saveAndCancelEditing();
    }
  };

  const saveAndCancelEditing = () => {
    const updatedData = Object.keys(data).reduce((acc, section) => {
      const sectionData = data[section].data.map((row) => {
        if (row.isEditable) {
          if (row["Nama Biaya"].trim() !== "" && row["Total Biaya"] !== "") {
            return { ...row, isEditable: false };
          }
          return null;
        }
        return row;
      });

      acc[section] = {
        ...data[section],
        data: sectionData.filter(Boolean),
      };
      return acc;
    }, {});
    setData(updatedData);
  };

  const calculateSectionTotals = (section) => {
    const total = data[section].data.reduce(
      (sum, row) => sum + (parseFloat(row["Total Biaya"]) || 0),
      0
    );
    // const average =
    //   total > 0 ? Math.floor(total / data[section].data.length) : 0;

    // return { total, average };
    return { total};
  };

  const operasionalTotals = calculateSectionTotals("operasional");
//   const produksiTotals = calculateSectionTotals("produksi");

//   useEffect(() => {
//     document.addEventListener("click", handleOutsideClick);
//     return () => {
//       document.removeEventListener("click", handleOutsideClick);
//     };
//   }, [data]);

  const handleDeleteRow = (section, rowId) => {
    setData((prevData) => {
      const updatedSectionData = prevData[section].data.filter(
        (row) => row.id !== rowId
      );
      return {
        ...prevData,
        [section]: {
          ...prevData[section],
          data: updatedSectionData,
        },
      };
    });
  };
  
  const handleSave = () => {
    // Simpan data yang telah diubah
    setData((prevData) => ({
      ...prevData,
      operasional: {
        ...prevData.operasional,
        data: prevData.operasional.data.map((row) => ({
          ...row,
          isEditable: false,
        })),
      },
      produksi: {
        ...prevData.produksi,
        data: prevData.produksi.data.map((row) => ({
          ...row,
          isEditable: false,
        })),
      },
    }));
    setIsEditing(false);
  };

const handleKeyPress = (e, section, index, key, value) => {
    if (e.key === "Enter") {
      setData((prevData) => {
        const updatedSectionData = prevData[section].data.map((row, i) =>
          i === index
            ? {
                ...row,
                [key]: value,
                isEditable: false,
              }
            : row
        );
        return {
          ...prevData,
          [section]: {
            ...prevData[section],
            data: updatedSectionData,
          },
        };
      });
    }
  };

  return (
    <>
      <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
        <div className="p-5">
            <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
            <div className="left w-full md:w-auto">
              <p className="text-primary text-base font-bold">Rincian Biaya Gudang</p>
            </div>
            <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
              <div className="w-full md:w-auto">
                <Button
                    label={isEditing ? "Simpan" : "Edit"} 
                    bgColor={isEditing ? "bg-primary" : "bg-none border border-oren"} 
                    textColor={isEditing ? "text-white" : "text-oren"} 
                    hoverColor={isEditing ? "" : "hover:bg-gray-200 hover:text-oren"} 
                    onClick={isEditing ? handleSave : handleToggleEdit}
                    icon={
                    !isEditing ? ( 
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5 mr-2"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 17l-5-5m0 0l5-5m-5 5h12"
                        />
                        </svg>
                    ) : null // Tidak ada ikon untuk tombol Simpan
                    }
                />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Operasional Section */}
            <section className="mt-5 bg-white rounded-xl">
              <div className="p-5">
                <p className="font-bold pb-5">
                  Biaya Operasional dan Staff <span className="text-merah">*</span>
                </p>
                <div>
                  <Table
                    headers={headers}
                    data={data.operasional.data.map((row, index) => ({
                      No: index + 1,
                      "Nama Biaya": row.isEditable || isEditing ? (
                        <Input
                        showRequired={false}
                          className="w-full max-w-xs sm:max-w-sm"
                          value={row["Nama Biaya"]}
                          onChange={(value) =>
                            handleInputChange("operasional", index, "Nama Biaya", value)
                          }
                          onKeyDown={(e) =>
                            handleKeyPress(e, "operasional", index, "Nama Biaya", row["Nama Biaya"])
                          }
                        />
                      ) : (
                        row["Nama Biaya"]
                      ),
                      "Total Biaya": row.isEditable || isEditing ? (
                        <Input
                        showRequired={false}
                          type="number"
                          width="w-full"
                          value={row["Total Biaya"]}
                          onChange={(value) =>
                            handleInputChange("operasional", index, "Total Biaya", value)
                          }
                          onKeyDown={(e) =>
                            handleKeyPress(e, "operasional", index, "Total Biaya", row["Total Biaya"])
                          }
                        />
                      ) : (
                        `Rp${row["Total Biaya"].toLocaleString("id-ID")}`
                      ),
                      Aksi: row.isEditable || isEditing ? (
                        <Button
                          label="Hapus"
                          textColor="text-red-600"
                          bgColor=""
                          hoverColor="hover:text-red-800"
                          className="delete-button"
                          onClick={() => handleDeleteRow("operasional", row.id)}
                        />
                      ) : null,
                    }))}
                  />

                  <Button
                    label="Tambah Baris"
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
                    bgColor="focus:ring-primary"
                    hoverColor="hover:border-primary hover:border"
                    textColor="text-primary"
                    onClick={() => handleAddRow('operasional')}
                  />
                </div>
                <div className="mt-5">
                  <div className="flex justify-between items-center px-3 py-2">
                    <p className="font-bold text-black">Total</p>
                    <p>Rp{operasionalTotals.total.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex justify-between items-center px-3 py-2">
                    <p className="font-bold text-black">Rata-Rata Tercetak</p>
                    {isEditing ? (
                      <Input
                      showRequired={false}
                        type="number"
                        width="w-full md:w-1/5"
                        value={data.operasional["Rata Rata Tercetak"]}
                        onChange={(value) =>
                          handleSummaryChange(
                            "operasional",
                            "Rata Rata Tercetak",
                            value
                          )
                        }
                      />
                    ) : (
                      <p>{data.operasional["Rata Rata Tercetak"].toLocaleString("id-ID")}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center px-3 py-2">
                    <p className="font-bold text-primary">Total Biaya</p>
                    <p className="text-primary">{`Rp${data.operasional["Total Biaya"].toLocaleString("id-ID")}`}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Produksi Section */}
            <section className="mt-5 bg-white rounded-xl">
              <div className="p-5">
                <p className="font-bold pb-5">
                  Biaya Operasional Produksi <span className="text-merah">*</span>
                </p>
                <div>
                  <Table
                    headers={headers}
                    data={data.produksi.data.map((row, index) => ({
                      No: index + 1,
                      "Nama Biaya": row.isEditable || isEditing ? (
                        <Input
                        showRequired={false}
                          className="w-full max-w-xs sm:max-w-sm"
                          value={row["Nama Biaya"]}
                          onChange={(value) =>
                            handleInputChange("produksi", index, "Nama Biaya", value)
                          }
                          onKeyDown={(e) =>
                            handleKeyPress(e, "produksi", index, "Nama Biaya", row["Nama Biaya"])
                          }
                        />
                      ) : (
                        row["Nama Biaya"]
                      ),
                      "Total Biaya": row.isEditable || isEditing ? (
                        <Input
                        showRequired={false}
                          type="number"
                          width="w-full"
                          value={row["Total Biaya"]}
                          onChange={(value) =>
                            handleInputChange("produksi", index, "Total Biaya", value)
                          }
                          onKeyDown={(e) =>
                            handleKeyPress(e, "produksi", index, "Total Biaya", row["Total Biaya"])
                          }
                        />
                      ) : (
                        `Rp${row["Total Biaya"].toLocaleString("id-ID")}`
                      ),
                      Aksi: row.isEditable || isEditing ? (
                        <Button
                          label="Hapus"
                          bgColor=""
                          textColor="text-red-600"
                          hoverColor="hover:text-red-800"
                          className="delete-button"
                          onClick={() => handleDeleteRow("produksi", row.id)}
                        />
                      ) : null,
                    }))}
                  />
                  <Button
                    label="Tambah Baris"
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
                    bgColor="focus:ring-primary"
                    hoverColor="hover:border-primary hover:border"
                    textColor="text-primary"
                    onClick={() => handleAddRow("produksi")}
                  />
                </div>
                <div className="mt-5">
                  <div className="flex justify-between items-center px-3">
                    <p className="font-bold text-black">Waktu Kerja</p>
                    {isEditing ? (
                      <Input
                      showRequired={false}
                        type="number"
                        width="w-full md:w-1/5"
                        value={data.produksi["Waktu Kerja"]}
                        onChange={(value) =>
                          handleSummaryChange("produksi", "Waktu Kerja", value)
                        }
                      />
                    ) : (
                      <p>{data.produksi["Waktu Kerja"].toLocaleString("id-ID")}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center px-3 py-2">
                    <p className="font-bold text-primary">Total Modal Operasional Produksi</p>
                    <p className="text-primary">{`Rp${data.produksi["Total Modal Operasional Produksi"].toLocaleString("id-ID")}`}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
        </div>
      </LayoutWithNav>
    </>
  );
}
