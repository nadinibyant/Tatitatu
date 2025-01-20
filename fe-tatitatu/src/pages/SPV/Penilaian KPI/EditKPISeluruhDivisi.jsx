import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import api from "../../../utils/api";

export default function EditKPISeluruhDivisi() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [dataDivisi, setDataDivisi] = useState([]);

    const breadcrumbItems = [
        { label: "Daftar KPI Seluruh Divisi", href: "/daftarPenilaianKPI/seluruh-divisi" },
        { label: "Edit KPI", href: "" },
    ];

    const [data, setData] = useState({
        divisi: "",
        data: [],
    });

    const fetchDivisi = async () => {
        try {
            const response = await api.get('/divisi-karyawan'); 
            const formattedDivisi = response.data.data
                .filter(div => !div.is_deleted)
                .map(div => ({
                    id: div.divisi_karyawan_id,
                    label: div.nama_divisi
                }));
            setDataDivisi(formattedDivisi);
        } catch (error) {
            console.error('Error fetching divisi:', error);
        }
    };

    useEffect(() => {
        fetchDivisi();
    }, []);

    console.log(data)
    const headers = [
        { label: "No", key: "Nomor", align: "text-left" },
        { label: "Nama KPI", key: "NamaKPI", align: "text-left" },
        { label: "Persentase", key: "Persentase", align: "text-left", width: '110px' },
        { label: "Waktu", key: "Waktu", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    const dataWaktu = [
        { id: 1, label: "Bulanan" },
        { id: 2, label: "Harian" },
        { id: 3, label: "Mingguan" },
        { id: 4, label: "Tahunan" },
    ];

    // Current code
    useEffect(() => {
        // Add check for location.state
        if (location.state?.divisionData) {
            const divisionData = location.state.divisionData;
            
            // Log to verify data
            console.log('Received division data:', divisionData);
            
            try {
                setData({
                    divisi: divisionData.nama_divisi,
                    data: divisionData.kpi.map((item, index) => ({
                        Nomor: index + 1,
                        NamaKPI: item.nama_kpi,
                        Persentase: item.persentase.toString(), 
                        Waktu: item.waktu,
                        kpi_id: item.kpi_id
                    }))
                });
            } catch (error) {
                console.error('Error processing division data:', error);
            }
        } else {
            console.warn('No division data received in location state');
        }
    }, [location.state]);

    const handleDivisiChange = (value) => {
        setData((prevState) => ({ ...prevState, divisi: value }));
    };

    const handleAddRow = () => {
        const newRow = {
            Nomor: data.data.length + 1,
            NamaKPI: "",
            Persentase: "",
            Waktu: "",
        };

        setData((prevState) => ({ ...prevState, data: [...prevState.data, newRow] }));
    };

    const handleInputChange = (rowIndex, key, value) => {
        const updatedData = data.data.map((row, index) =>
            index === rowIndex ? { ...row, [key]: value } : row
        );
        setData((prevState) => ({ ...prevState, data: updatedData }));
    };

    const handleDeleteRow = (rowIndex) => {
        const updatedData = data.data.filter((_, index) => index !== rowIndex);
        setData((prevState) => ({ ...prevState, data: updatedData }));
    };

    const handleCancel = () => {
        navigate('/daftarPenilaianKPI/seluruh-divisi');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement API call to update KPI
        console.log("Submitted data:", data);
    };

    return (
        <>
            <Navbar menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <Breadcrumbs items={breadcrumbItems} />

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="p-5">
                            <form onSubmit={handleSubmit}>
                                <div className="sm:w-1/3">
                                    <label className="p-2">
                                        Divisi <span className="text-merah">*</span>
                                    </label>
                                    <div className="pt-3">
                                        <ButtonDropdown 
                                            label={data.divisi || "Masukan Divisi"} 
                                            options={dataDivisi} 
                                            selectedStore={data.divisi}
                                            onSelect={handleDivisiChange} 
                                        />
                                    </div>
                                </div>

                                <div className="px-2 pt-5">
                                    <p className="font-bold py-5">Rincian KPI</p>
                                    <Table
                                        headers={headers}
                                        data={data.data.map((row, index) => ({
                                            Nomor: row.Nomor,
                                            NamaKPI: (
                                                <Input
                                                    showRequired={false}
                                                    type1="text"
                                                    value={row.NamaKPI}
                                                    onChange={(value) => handleInputChange(index, "NamaKPI", value)}
                                                />
                                            ),
                                            Persentase: (
                                                <Input
                                                    showRequired={false}
                                                    type="number"
                                                    value={row.Persentase}
                                                    onChange={(value) => handleInputChange(index, "Persentase", value)}
                                                />
                                            ),
                                            Waktu: (
                                                <ButtonDropdown
                                                    options={dataWaktu}
                                                    label={row.Waktu || "Pilih Waktu"}
                                                    onSelect={(value) => handleInputChange(index, "Waktu", value)}
                                                />
                                            ),
                                            Aksi: (
                                                <button
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDeleteRow(index);
                                                    }}
                                                >
                                                    Hapus
                                                </button>
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
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleAddRow();
                                        }}
                                    />
                                </div>

                                <div className="pt-5 flex justify-end space-x-4">
                                    <Button 
                                        label={"Batal"} 
                                        bgColor="bg-none border border-black" 
                                        textColor="text-black" 
                                        type="button" 
                                        hoverColor="hover:bg-primary hover:text-white" 
                                        onClick={handleCancel}
                                    />
                                    <Button 
                                        label={"Simpan"} 
                                        bgColor="bg-primary" 
                                        textColor="text-white" 
                                        type="submit" 
                                        hoverColor="hover:bg-white hover:border hover:border-primary hover:text-black" 
                                    />
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </Navbar>
        </>
    );
}