import { Camera } from "lucide-react";
import Input from "../../../components/Input";
import InputDropdown from "../../../components/InputDropdown";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../components/LayoutWithNav";
import TimeInput from "../../../components/TimeInput";
import api from "../../../utils/api";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import AlertError from "../../../components/AlertError";

export default function TambahAkunKaryawan(){
    const [branchList, setBranchList] = useState([]);
    const [divisiList, setDivisiList] = useState([]);
    const [isLoading, setLoading] = useState(false)
    const [isAlertSuccess, setAlertSucc] = useState(false)
    const [isErrorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        photo: null,
        email: '',
        password: '12345678',
        name: '',
        division: '',
        store: '',
        branch: '',        
        baseSalary: '',
        bonus: '',
        workHours: {
            amount: '',
            unit: 'Menit'
        },
        phone: '',
        jenis_karyawan: '' 
      });

      const jenisKaryawanOptions = [
        { value: 'Umum', label: 'Umum' },
        { value: 'Produksi', label: 'Produksi' },
        { value: 'Transportasi', label: 'Khusus' }
      ];

  const [errors, setErrors] = useState({});
  const userDataLogin = JSON.parse(localStorage.getItem('userData'));
  const toko_id = userDataLogin.userId
  const isHeadGudang = userDataLogin.role === 'headgudang'
  const isAdminGudang = userDataLogin?.role === 'admingudang'
  const isManajer = userDataLogin?.role === 'manajer'
  const isOwner = userDataLogin?.role === 'owner';
  const isAdmin = userDataLogin?.role === 'admin';
  const isFinance = userDataLogin?.role === 'finance'

  const themeColor = (isAdminGudang || isHeadGudang) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userDataLogin?.userId !== 1 && userDataLogin?.userId !== 2)
      ? "hitam"
      : "primary";

  const validateForm = () => {
        const newErrors = {};
        if (!formData.photo) {
            newErrors.photo = 'Foto karyawan harus diupload';
        }
        if (!formData.division) {
            newErrors.division = 'divisi harus dipilih';
        }
        if (!isHeadGudang && !isManajer && !formData.branch) {
            newErrors.branch = 'cabang harus dipilih';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fetchStore = async () => {
        // Skip fetching store data for manager role
        if (isManajer) {
            setFormData(prev => ({
                ...prev,
                store: 'DBI',
                branch: '-'
            }));
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/toko/${toko_id}`);
            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    store: response.data.data.nama_toko
                }));
            }
        } catch (error) {
            console.error('Error fetching store:', error);
            setErrorMessage('Gagal mengambil data toko');
            setErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };

      const fetchBranches = async () => {
        // Skip fetching branches for manager role
        if (isManajer) {
            return;
        }

        try {
            setLoading(true)
            const response = await api.get(`/cabang?toko_id=${toko_id}`);
            if (response.data.success) {
                const options = response.data.data.map(branch => ({
                    value: branch.cabang_id,
                    label: branch.nama_cabang
                }));
                setBranchList(options);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        } finally {
          setLoading(false)
        }
      };

      const fetchDivisi = async () => {
        try {
            setLoading(true)
            // For manajer role, fetch without toko_id
            const url = isManajer ? `/divisi-karyawan` : `/divisi-karyawan?toko_id=${toko_id}`;
            const response = await api.get(url);
            if (response.data.success) {
                const options = response.data.data.map(div => ({
                    value: div.divisi_karyawan_id,
                    label: div.nama_divisi
                }));
                setDivisiList(options);
            }
        } catch (error) {
            console.error('Error fetching divisi:', error);
        } finally {
          setLoading(false)
        }
      };
    
      useEffect(() => {
        fetchBranches();
        fetchDivisi();
        fetchStore();
    }, []);

      const [photoPreview, setPhotoPreview] = useState(null);
  
    
      const handleInputChange = (field) => (value) => {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      };

      
    
      const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setFormData(prev => ({
            ...prev,
            photo: file
          }));
          
          // Create preview URL
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotoPreview(reader.result);
          };
          reader.readAsDataURL(file);
        }
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            try {
                setLoading(true);
                const formDataToSend = new FormData();
        
                if (formData.photo) {
                    formDataToSend.append('image', formData.photo);
                }
                
                formDataToSend.append('email', formData.email);
                formDataToSend.append('nama_karyawan', formData.name);
                formDataToSend.append('password', '12345678');
                formDataToSend.append('divisi_karyawan_id', formData.division);
                formDataToSend.append('jenis_karyawan', formData.jenis_karyawan);
                
                // Only append branch_id and toko_id for non-manager roles
                if (!isManajer) {
                    if (!isHeadGudang) {
                        formDataToSend.append('cabang_id', formData.branch);
                    }
                    formDataToSend.append('toko_id', toko_id);
                }
                
                formDataToSend.append('jumlah_gaji_pokok', formData.baseSalary);
                formDataToSend.append('bonus', formData.bonus);
                
                if (formData.workHours.unit === 'Menit') {
                    formDataToSend.append('waktu_kerja_sebulan_menit', formData.workHours.amount.toString());
                } else {
                    formDataToSend.append('waktu_kerja_sebulan_antar', formData.workHours.amount.toString());
                }
                
                formDataToSend.append('nomor_handphone', formData.phone);
        
                const response = await api.post('/karyawan', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
        
                if (response.data.success) {
                    setAlertSucc(true);
                    setTimeout(() => {
                        navigate('/akunKaryawan');
                    }, 2000);
                } else {
                    setErrorMessage(response.data.message);
                    setErrorAlert(true);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat menambahkan data');
                setErrorAlert(true);
            } finally {
                setLoading(false);
            }
        }
        
    };
    
      const navigate = useNavigate()
      const handleCancel = () => {
        setFormData({
          photo: null,
          email: '',
          password: '',
          name: '',
          division: '',
          baseSalary: '',
          bonus: '',
          workHours: {
            amount: '',
            unit: 'Menit'
          },
          phone: ''
        });
        setPhotoPreview(null);
        navigate('/akunKaryawan');
      };

      const breadcrumbItems = [
        { label: "Daftar Akun Karyawan", href: "/akunKaryawan" },
        { label: "Tambah Data Karyawan", href: "" },
        ];

        console.log(formData)
    return(
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />
                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Photo Upload Section */}
                            <div className="mb-6">
                            <p className="text-gray-700 font-bold mb-2">Masukan Foto Karyawan</p>
                            {errors.photo && (
                                <p className="mt-1 text-sm text-red-500 pb-4">
                                    {errors.photo}
                                </p>
                            )}
                            <div className={`relative w-40 h-40 border-2 border-dashed border-${themeColor} rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors`}>
                                <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handlePhotoChange}
                                accept="image/*"
                                />
                                {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                ) : (
                                <div className="text-center">
                                    <div className="flex justify-center">
                                        <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M36.8346 19C36.8346 18.5138 36.6415 18.0474 36.2977 17.7036C35.9538 17.3598 35.4875 17.1667 35.0013 17.1667C34.5151 17.1667 34.0488 17.3598 33.7049 17.7036C33.3611 18.0474 33.168 18.5138 33.168 19H36.8346ZM18.5013 4.33332C18.9875 4.33332 19.4538 4.14017 19.7977 3.79635C20.1415 3.45254 20.3346 2.98622 20.3346 2.49999C20.3346 2.01376 20.1415 1.54744 19.7977 1.20363C19.4538 0.859811 18.9875 0.666656 18.5013 0.666656V4.33332ZM32.2513 33.6667H4.7513V37.3333H32.2513V33.6667ZM3.83464 32.75V5.24999H0.167969V32.75H3.83464ZM33.168 19V32.75H36.8346V19H33.168ZM4.7513 4.33332H18.5013V0.666656H4.7513V4.33332ZM4.7513 33.6667C4.50819 33.6667 4.27503 33.5701 4.10312 33.3982C3.93121 33.2263 3.83464 32.9931 3.83464 32.75H0.167969C0.167969 33.9656 0.650854 35.1314 1.5104 35.9909C2.36994 36.8504 3.53573 37.3333 4.7513 37.3333V33.6667ZM32.2513 37.3333C33.4669 37.3333 34.6327 36.8504 35.4922 35.9909C36.3517 35.1314 36.8346 33.9656 36.8346 32.75H33.168C33.168 32.9931 33.0714 33.2263 32.8995 33.3982C32.7276 33.5701 32.4944 33.6667 32.2513 33.6667V37.3333ZM3.83464 5.24999C3.83464 5.00687 3.93121 4.77372 4.10312 4.60181C4.27503 4.4299 4.50819 4.33332 4.7513 4.33332V0.666656C3.53573 0.666656 2.36994 1.14954 1.5104 2.00908C0.650854 2.86863 0.167969 4.03441 0.167969 5.24999H3.83464Z" fill="#7B0C42"/>
                                        <path d="M2 29.0833L11.8019 20.0982C12.1323 19.7954 12.5621 19.6241 13.0102 19.6166C13.4583 19.6092 13.8936 19.7662 14.2338 20.0578L25.8333 30M22.1667 25.4167L26.5419 21.0414C26.854 20.7291 27.2683 20.54 27.7086 20.5086C28.149 20.4773 28.5859 20.606 28.939 20.8709L35 25.4167M24 8H35M29.5 2.5V13.5" stroke="#7B0C42" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <p className={`mt-2 text-sm text-${themeColor}`}>Masukan Foto</p>
                                </div>
                                )}
                            </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                required={true}
                                type1="email"
                            />
                            
                            <Input
                                label="Password"
                                value="12345678"
                                onChange={handleInputChange('password')}
                                type1="password"
                                required={true}
                                disabled={true}
                            />
                            
                            <Input
                                label="Nama"
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                required={true}
                            />
                            
                            <InputDropdown
                                label="Divisi"
                                options={divisiList}
                                value={formData.division}
                                error={!!errors.division}
                                errorMessage={errors.division}
                                onSelect={(option) => handleInputChange('division')(option.value)}
                            />

                            <InputDropdown
                                label="Jenis Karyawan"
                                options={jenisKaryawanOptions}
                                value={formData.jenis_karyawan}
                                onSelect={(option) => handleInputChange('jenis_karyawan')(option.value)}
                                required={true}
                            />

                            <Input
                              label="Toko"
                              value={formData.store}
                              disabled={true}
                              required={true}
                            />

                            <InputDropdown
                                label="Cabang"
                                options={branchList}
                                value={formData.branch}
                                onSelect={(option) => handleInputChange('branch')(option.value)}
                                required={!isHeadGudang && !isManajer}
                                error={!isHeadGudang && !isManajer && !!errors.branch}
                                errorMessage={errors.branch}
                                disabled={isHeadGudang || isManajer}
                            />
                            <Input
                                label="Jumlah Gaji Pokok"
                                value={formData.baseSalary}
                                onChange={handleInputChange('baseSalary')}
                                type="number"
                                required={true}
                            />
                            
                            <Input
                                label="Bonus"
                                value={formData.bonus}
                                onChange={handleInputChange('bonus')}
                                type="number"
                                required={true}
                            />
                            
                            <TimeInput
                                label="Waktu Kerja Sebulan"
                                value={formData.workHours}
                                onChange={handleInputChange('workHours')}
                                required={true}
                            />
                            
                            <Input
                                label="Nomor Handphone"
                                value={formData.phone}
                                onChange={handleInputChange('phone')}
                                type1="tel"
                                required={true}
                            />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className={`px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:border-${themeColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${themeColor}`}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className={`px-6 py-2 bg-${themeColor} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                            >
                                Simpan
                            </button>
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
    )
}