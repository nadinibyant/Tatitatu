import { useState, useEffect, useRef } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import Table from "../../../components/Table";
import { menuItems, userOptions } from "../../../data/menuSpv";
import Input from "../../../components/Input";

export default function BiayaGudang() {
  const headers = [
    { label: "No", key: "No", align: "text-left" },
    { label: "Nama Biaya", key: "Nama Biaya", align: "text-left" },
    { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
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

  const handleAddRow = (section) => {
    console.log("Adding row to section:", section); // Debug log
    const newRow = {
      id: data[section].data.length + 1,
      "Nama Biaya": "",
      "Total Biaya": "",
      isEditable: true,
    };
  
    setData((prevData) => {
      console.log("Previous data:", prevData); // Debug log
      const updatedData = {
        ...prevData,
        [section]: {
          ...prevData[section],
          data: [...prevData[section].data, newRow],
        },
      };
      console.log("Updated data:", updatedData); // Debug log
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
            // Save valid row and mark it as non-editable
            return { ...row, isEditable: false };
          }
          // Remove empty rows
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

//   const operasionalTotals = calculateSectionTotals("operasional");
//   const produksiTotals = calculateSectionTotals("produksi");

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [data]);

//   console.log(data)

  return (
    <>
      <Navbar menuItems={menuItems} userOptions={userOptions} label={"Biaya Gudang"}>
        <div className="p-5">
        <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
            <div className="left w-full md:w-auto">
              <p className="text-primary text-base font-bold">Rincian Biaya Gudang</p>
            </div>
            <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
              <div className="w-full md:w-auto">
                <Button
                  label="Edit"
                  icon={
                    <svg
                      width="17"
                      height="18"
                      viewBox="0 0 17 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z"
                        fill="#DA5903"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z"
                        fill="#DA5903"
                      />
                    </svg>
                  }
                  bgColor="bg-none border border-oren"
                  hoverColor="hover:bg-gray-200 hover:text-oren"
                  textColor="text-oren"
                />
              </div>
            </div>
          </section>

          {/* Operasional Section */}
          <section className="mt-5 bg-white rounded-xl">
            <div className="p-5" >
              <p className="font-bold pb-5">
                Biaya Operasional dan Staff <span className="text-merah">*</span>
              </p>
              <div ref={operasionalTableRef}>
              <Table
                    headers={headers}
                    data={data.operasional.data.map((row, index) => ({
                        No: index + 1,
                        "Nama Biaya": row.isEditable ? (
                        <Input
                            value={row["Nama Biaya"]}
                            onChange={(value) =>
                            handleInputChange("operasional", index, "Nama Biaya", value)
                            }
                        />
                        ) : (
                        row["Nama Biaya"]
                        ),
                        "Total Biaya": row.isEditable ? (
                        <Input
                            type="number"
                            value={row["Total Biaya"]}
                            onChange={(value) =>
                            handleInputChange("operasional", index, "Total Biaya", value)
                            }
                        />
                        ) : (
                        `Rp${row["Total Biaya"].toLocaleString("id-ID")}`
                        ),
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
                  bgColor=""
                  hoverColor="hover:border-primary hover:border"
                  textColor="text-primary"
                  onClick={() => handleAddRow('operasional')}
                />
              </div>
            </div>
          </section>

          {/* Produksi Section */}
          <section className="mt-5 bg-white rounded-xl">
            <div className="p-5" >
              <p className="font-bold pb-5">
                Biaya Operasional Produksi <span className="text-merah">*</span>
              </p>
              <div ref={produksiTableRef}>
                <Table
                  headers={headers}
                  data={data.produksi.data.map((row, index) => ({
                    No: index + 1,
                    "Nama Biaya": row.isEditable ? (
                      <Input
                        value={row["Nama Biaya"]}
                        onChange={(value) =>
                          handleInputChange("produksi", index, "Nama Biaya", value)
                        }
                      />
                    ) : (
                      row["Nama Biaya"]
                    ),
                    "Total Biaya": row.isEditable ? (
                      <Input
                        type="number"
                        value={row["Total Biaya"]}
                        onChange={(value) =>
                          handleInputChange("produksi", index, "Total Biaya", value)
                        }
                      />
                    ) : (
                      `Rp${row["Total Biaya"].toLocaleString("id-ID")}`
                    ),
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
                  bgColor=""
                  hoverColor="hover:border-primary hover:border"
                  textColor="text-primary"
                  onClick={() => handleAddRow("produksi")}
                />
              </div>
              <div className="mt-5">
                <div className="flex justify-between items-center px-3">
                  <p className="font-bold text-black">Waktu Kerja</p>
                  <p>{data.produksi["Waktu Kerja"].toLocaleString("id-ID")}</p>
                </div>
                <div className="flex justify-between items-center px-3 py-2">
                  <p className="font-bold text-primary">Total Modal Operasional Produksi</p>
                  <p className="text-primary">{`Rp${data.produksi["Total Modal Operasional Produksi"].toLocaleString("id-ID")}`}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Navbar>
    </>
  );
}
