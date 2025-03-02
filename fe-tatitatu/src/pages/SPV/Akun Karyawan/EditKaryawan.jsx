import { Camera } from "lucide-react";
import Input from "../../../components/Input";
import InputDropdown from "../../../components/InputDropdown";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import TimeInput from "../../../components/TimeInput";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";
import AlertError from "../../../components/AlertError";
import AlertSuccess from "../../../components/AlertSuccess";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function EditKaryawan(){
      const { id } = useParams();
      const [formData, setFormData] = useState({
        photo: null,
        email: '',
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
        { value: 'Transportasi', label: 'Transportasi' }
      ];
      const [photoPreview, setPhotoPreview] = useState(null);
      const [branchList, setBranchList] = useState([]);
      const [divisiList, setDivisiList] = useState([]);
      const [isLoading, setLoading] = useState(false);
      const [isPasswordChanged, setIsPasswordChanged] = useState(false);
      const [isAlertSuccess, setAlertSucc] = useState(false)
      const [isErrorAlert, setErrorAlert] = useState(false);
      const [errorMessage, setErrorMessage] = useState('');
      const userData = JSON.parse(localStorage.getItem('userData'))
      const toko_id = userData.userId
      const isHeadGudang = userData.role === 'headgudang'

      const [errors, setErrors] = useState({});

      const validateForm = () => {
        const newErrors = {};
        if (!formData.division) {
          newErrors.division = 'divisi harus dipilih';
        } 
        if(!formData.branch && !isHeadGudang){
          newErrors.branch = 'cabang harus dipilih';
        }
        if(!formData.jenis_karyawan){
          newErrors.jenis_karyawan = 'jenis karyawan harus dipilih';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
      const fetchKaryawanById = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/karyawan/${id}`);
            const data = response.data.data;
            
            setFormData({
                photo: data.image,
                email: data.email || '',
                name: data.nama_karyawan || '',
                password: data.password, 
                division: data.divisi_karyawan_id,  
                store: data.toko_id,
                branch: data.cabang_id, 
                baseSalary: data.jumlah_gaji_pokok?.toString() || '',  
                bonus: data.bonus?.toString() || '',
                workHours: {
                    amount: (data.waktu_kerja_sebulan_menit || data.waktu_kerja_sebulan_antar || '').toString(),
                    unit: data.waktu_kerja_sebulan_menit ? 'Menit' : 'Antar'
                },
                phone: data.nomor_handphone || '',
                jenis_karyawan: data.jenis_karyawan || '' 
            });
      
            if (data.image) {
                setPhotoPreview(`${import.meta.env.VITE_API_URL}/images-karyawan/${data.image}`);
            }
      
        } catch (error) {
            console.error('Error fetching karyawan:', error);
            setErrorMessage('Gagal mengambil data karyawan');
            setErrorAlert(true);
        } finally {
            setLoading(false);
        }
      };

    const fetchStore = async () => {
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

    // Fetch cabang
    const fetchBranches = async () => {
        try {
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
        }
    };

    // Fetch divisi
    const fetchDivisi = async () => {
        try {
            const response = await api.get(`/divisi-karyawan?toko_id=${toko_id}`);
            if (response.data.success) {
                const options = response.data.data.map(div => ({
                    value: div.divisi_karyawan_id,
                    label: div.nama_divisi
                }));
                setDivisiList(options);
            }
        } catch (error) {
            console.error('Error fetching divisi:', error);
        }
    };

    useEffect(() => {
        fetchBranches();
        fetchDivisi();
        fetchKaryawanById();
        fetchStore()
    }, [id, toko_id]);
    
    const handleInputChange = (field) => (value) => {
      console.log(`Updating ${field} with value:`, value);
      
      if (field === 'workHours') {
          setFormData(prev => ({
              ...prev,
              workHours: value
          }));
      } else {
          setFormData(prev => ({
              ...prev,
              [field]: value
          }));
      }
  
      if (field === 'password') {
          setIsPasswordChanged(value !== '');
      }
    };
    
      const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo: file
            }));
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
      navigate('/akunKaryawan');
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm()
        if (isValid) {
            try {
                setLoading(true);
                const formDataToSend = new FormData();
      
                if (formData.photo) {
                    formDataToSend.append('image', formData.photo);
                }
                
                formDataToSend.append('email', formData.email);
                formDataToSend.append('nama_karyawan', formData.name);
                formDataToSend.append('password', formData.password);
                formDataToSend.append('divisi_karyawan_id', formData.division);
                formDataToSend.append('jenis_karyawan', formData.jenis_karyawan); 
      
                if (!isHeadGudang) {
                    formDataToSend.append('cabang_id', formData.branch);
                }
                formDataToSend.append('jumlah_gaji_pokok', formData.baseSalary);
                formDataToSend.append('bonus', formData.bonus);
                
                if (formData.workHours.unit === 'Menit') {
                    formDataToSend.append('waktu_kerja_sebulan_menit', formData.workHours.amount);
                    formDataToSend.append('waktu_kerja_sebulan_antar', null);
                } else {
                    formDataToSend.append('waktu_kerja_sebulan_antar', formData.workHours.amount);
                    formDataToSend.append('waktu_kerja_sebulan_menit', null);
                }
                
                formDataToSend.append('nomor_handphone', formData.phone);
                formDataToSend.append('toko_id', toko_id)
      
                const response = await api.put(`/karyawan/${id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
      
                console.log(response)
      
                if (response.data.success) {
                    setAlertSucc(true);
                    setTimeout(() => {
                        navigate('/akunKaryawan');
                    }, 2000);
                }
            } catch (error) {
                console.error('Error updating karyawan:', error);
                setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengupdate data');
                setErrorAlert(true);
            } finally {
                setLoading(false);
            }
        }
      };
    
      const navigate = useNavigate()

      const breadcrumbItems = [
        { label: "Daftar Akun Karyawan", href: "/akunKaryawan" },
        { label: "Edit Data Karyawan", href: "" },
    ];

    return (
      <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
          <div className="p-5">
              <Breadcrumbs items={breadcrumbItems} />
              <section className="mt-5 bg-white rounded-xl">
                  <div className="p-5">
                      <form onSubmit={handleSubmit} className="space-y-4">
                          {/* Photo Upload Section */}
                          <div className="mb-6">
                              <p className="text-gray-700 font-bold mb-2">Masukan Foto Karyawan</p>
                              <div className="relative w-40 h-40 border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
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
                                                  <path d="M36.8346 19C36.8346 18.5138 36.6415 18.0474 36.2977 17.7036C35.9538 17.3598 35.4875 17.1667 35.0013 17.1667C34.5151 17.1667 34.0488 17.3598 33.7049 17.7036C33.3611 18.0474 33.168 18.5138 33.168 19H36.8346ZM18.5013 4.33332C18.9875 4.33332 19.4538 4.14017 19.7977 3.79635C20.1415 3.45254 20.3346 2.98622 20.3346 2.49999C20.3346 2.01376 20.1415 1.54744 19.7977 1.20363C19.4538 0.859811 18.9875 0.666656 18.5013 0.666656V4.33332ZM32.2513 33.6667H4.7513V37.3333H32.2513V33.6667ZM3.83464 32.75V5.24999H0.167969V32.75H3.83464ZM33.168 19V32.75H36.8346V19H33.168ZM4.7513 4.33332H18.5013V0.666656H4.7513V4.33332Z" fill="#7B0C42"/>
                                              </svg>
                                          </div>
                                          <p className="mt-2 text-sm text-primary">Masukan Foto</p>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Form Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                  label="Email"
                                  value={formData.email}
                                  defaultValue={formData.email}
                                  onChange={handleInputChange('email')}
                                  required={false}
                                  type1="email"
                              />
                              
                              <Input
                                  label="Password"
                                  value={formData.password} 
                                  onChange={handleInputChange('password')}
                                  type1="password"
                                  required={false}
                                  placeholder="Biarkan kosong jika tidak ingin mengubah password"
                              />
                              
                              <Input
                                  label="Nama"
                                  value={formData.name}
                                  onChange={handleInputChange('name')}
                                  required={false}
                              />
                              
                              <InputDropdown
                                  label="Divisi"
                                  options={divisiList}
                                  value={formData.division} 
                                  error={!!errors.division}
                                  errorMessage={errors.division}
                                  onSelect={(option) => handleInputChange('division')(option.value)}
                                  required={true}
                              />

                                <InputDropdown
                                    label="Jenis Karyawan"
                                    options={jenisKaryawanOptions}
                                    value={formData.jenis_karyawan}
                                    error={!!errors.jenis_karyawan}
                                    errorMessage={errors.jenis_karyawan}
                                    onSelect={(option) => handleInputChange('jenis_karyawan')(option.value)}
                                    required={true}
                                />

                              <Input
                                  label="Toko"
                                  value={formData.store}
                                  disabled={true}
                                  required={false}
                              />

                                <InputDropdown
                                    label="Cabang"
                                    options={branchList}
                                    value={formData.branch}
                                    error={!isHeadGudang && !!errors.branch}
                                    errorMessage={errors.branch}
                                    onSelect={(option) => handleInputChange('branch')(option.value)}
                                    required={!isHeadGudang}
                                    disabled={isHeadGudang}
                                />

                              <Input
                                  label="Jumlah Gaji Pokok"
                                  value={formData.baseSalary}
                                  onChange={handleInputChange('baseSalary')}
                                  type="number"
                                  required={false}
                              />
                              
                              <Input
                                  label="Bonus"
                                  value={formData.bonus}
                                  onChange={handleInputChange('bonus')}
                                  type="number"
                                  required={false}
                              />
                              
                              <TimeInput
                                  label="Waktu Kerja Sebulan"
                                  value={formData.workHours}
                                  onChange={handleInputChange('workHours')}
                                  required={false}
                              />
                              
                              <Input
                                  label="Nomor Handphone"
                                  value={formData.phone}
                                  onChange={handleInputChange('phone')}
                                  type1="tel"
                                  required={false}
                              />
                          </div>

                          {/* Buttons */}
                          <div className="flex justify-end space-x-4 mt-6">
                              <button
                                  type="button"
                                  onClick={handleCancel}
                                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                              >
                                  Batal
                              </button>
                              <button
                                  type="submit"
                                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
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
                  description="Data Berhasil Diupdate"
                  confirmLabel="Ok"
                  onConfirm={() => setAlertSucc(false)}
              />
          )}

          {isErrorAlert && (
              <AlertError
                  title="Gagal!!"
                  description={errorMessage}
                  confirmLabel="Ok"
                  onConfirm={() => setErrorAlert(false)}
              />
          )}

          {isLoading && <Spinner />}
      </LayoutWithNav>
  );
}