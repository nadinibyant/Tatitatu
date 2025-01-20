import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import AlertError from "../../../components/AlertError";

export default function TambahKPISeluruhDivisi() {
    const [divisions, setDivisions] = useState([]);
    const [isLoading, setLoading] = useState(false)
    const [isAlertSuccess, setAlertSucc] = useState(false)
    const [isErrorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    // Fungsi untuk fetch data divisi
    const fetchDivisi = async () => {
        try {
            setLoading(true);
            const response = await api.get('/divisi-karyawan');
            
            const formattedDivisions = response.data.data.map(div => ({
                id: div.divisi_karyawan_id,
                label: div.nama_divisi
            }));
            
            setDivisions(formattedDivisions);
        } catch (error) {
            console.error('Error fetching divisi:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDivisi();
    }, []);
    const breadcrumbItems = [
        { label: "Daftar KPI Seluruh Divisi", href: "/daftarPenilaianKPI/seluruh-divisi" },
        { label: "Tambah", href: "" },
    ];

    const [data, setData] = useState({
        divisi: "",
        data: [],
    });
    

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
    ];

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

    const navigate = useNavigate()
    const handleBtnCancel = () => {
        navigate('/daftarPenilaianKPI/seluruh-divisi')
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const selectedDivision = divisions.find(div => div.label === data.divisi);
            
            const formattedData = data.data.map(row => ({
                divisi_karyawan_id: selectedDivision.id, 
                nama_kpi: row.NamaKPI,
                persentase: parseInt(row.Persentase),
                waktu: row.Waktu
            }));
            const response = await api.post('/kpi', formattedData);
    
            if (response.data.success) {
                setAlertSucc(true);
                setTimeout(() => {
                    navigate('/daftarPenilaianKPI/seluruh-divisi');
                }, 2000);
            } else {
                setErrorMessage(response.data.message);
                setErrorAlert(true);
            }
        } catch (error) {
            console.error('Error saving KPI:', error);
            alert("Terjadi kesalahan saat menyimpan data");
        } finally {
            setLoading(false)
        } 
    };

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
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
                                            options={divisions} 
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
                                                    required={true}
                                                    onChange={(value) => handleInputChange(index, "NamaKPI", value)}
                                                />
                                            ),
                                            Persentase: (
                                                <Input
                                                showRequired={false}
                                                    type="number"
                                                    required={true}
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
                                                    required={true}
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
                                        onClick={handleBtnCancel}
                                        label={"Batal"} 
                                        bgColor="bg-none border border-black" 
                                        textColor="text-black" 
                                        type="button" 
                                        hoverColor="hover:bg-primary hover:text-white" 
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
                {isAlertSuccess && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data Berhasil Ditambahkan"
                        confirmLabel="Ok"
                        onConfirm={() => setAlertSucc(false)}
                    />
                )}

                {isLoading && (
                    <Spinner/>
                )}

                {isErrorAlert && (
                <AlertError
                    title="Gagal!!"
                    description={errorMessage}
                    confirmLabel="Ok"
                    onConfirm={() => setErrorAlert(false)}
                />
                )}
            </LayoutWithNav>
        </>
    );
}
