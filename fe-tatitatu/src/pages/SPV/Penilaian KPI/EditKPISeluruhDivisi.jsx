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
import AlertError from "../../../components/AlertError";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";

export default function EditKPISeluruhDivisi() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [dataDivisi, setDataDivisi] = useState([]);
    const [isLoading, setLoading] = useState(false)
    const [isAlertSuccess, setAlertSucc] = useState(false)
    const [isErrorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [percentageError, setPercentageError] = useState(false);

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

    const calculateTotalPercentage = (dataRows) => {
        return dataRows.reduce((sum, row) => sum + (parseFloat(row.Persentase) || 0), 0);
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

    console.log(data)

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
        const currentTotal = calculateTotalPercentage(data.data);
        if (currentTotal >= 100) {
            setPercentageError(true);
            setErrorMessage("Tidak dapat menambah KPI baru karena total persentase sudah 100%");
            setErrorAlert(true);
            return;
        }

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

        if (key === "Persentase") {
            // Validate the input is a number and not negative
            if (isNaN(value) || parseFloat(value) < 0) {
                return;
            }

            const totalPercentage = calculateTotalPercentage(updatedData);
            if (totalPercentage > 100) {
                setPercentageError(true);
                setErrorMessage("Total persentase tidak boleh melebihi 100%");
                setErrorAlert(true);
            } else {
                setPercentageError(false);
                setErrorAlert(false);
            }
        }

        setData((prevState) => ({ ...prevState, data: updatedData }));
    };

    const handleDeleteRow = (rowIndex) => {
        const updatedData = data.data.filter((_, index) => index !== rowIndex);
        setData((prevState) => ({ ...prevState, data: updatedData }));
    };

    const handleCancel = () => {
        navigate('/daftarPenilaianKPI/seluruh-divisi');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const totalPercentage = calculateTotalPercentage(data.data);
        if (totalPercentage > 100) {
            setErrorMessage("Total persentase tidak boleh melebihi 100%");
            setErrorAlert(true);
            return;
        }

        if (totalPercentage < 100) {
            setErrorMessage("Total persentase harus mencapai 100%");
            setErrorAlert(true);
            return;
        }

        try {
            setLoading(true);
            
            const kpiPayload = data.data.map(item => ({
                divisi_karyawan_id: dataDivisi.find(div => div.label === data.divisi)?.id,
                nama_kpi: item.NamaKPI,
                persentase: parseInt(item.Persentase),
                waktu: item.Waktu,
                ...(item.kpi_id && { kpi_id: item.kpi_id })
            }));
     
            await api.put(`/kpi/${id}`, kpiPayload);
            
            setAlertSucc(true);
            setTimeout(() => {
                navigate('/daftarPenilaianKPI/seluruh-divisi');
            }, 2000);
        } catch (error) {
            console.error('Error updating KPI:', error);
            setErrorMessage(error.response?.data?.message || 'Gagal mengupdate KPI');
            setErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };
    const currentTotal = calculateTotalPercentage(data.data);

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
                {isAlertSuccess && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data Berhasil Ditambahkan/Diperbaharui"
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
            </Navbar>
        </>
    );
}