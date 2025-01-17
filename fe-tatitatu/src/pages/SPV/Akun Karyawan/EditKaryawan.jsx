import { Camera } from "lucide-react";
import Input from "../../../components/Input";
import InputDropdown from "../../../components/InputDropdown";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import TimeInput from "../../../components/TimeInput";

export default function EditKaryawan(){
      const existingData = {
          email: 'johndoe@example.com',
          name: 'John Doe',
          division: 'IT',
          baseSalary: 5000000,
          bonus: 1000000,
          workHours: {
              amount: '160',
              unit: 'Menit'  
          },
          phone: '081234567890',
          photoUrl: 'https://via.placeholder.com/50'
      };

      const [formData, setFormData] = useState(existingData);
      const [photoPreview, setPhotoPreview] = useState(existingData.photoUrl);
      const [isPasswordChanged, setIsPasswordChanged] = useState(false);

      const divisions = [
        'HR',
        'IT',
        'Finance',
        'Marketing',
        'Operations'
      ];
    
      const handleInputChange = (field) => (value) => {
        console.log(`Updating ${field} with value:`, value); // Debugging
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
    
        if (field === 'password') {
          setIsPasswordChanged(value !== '');
        }
      };

      console.log(formData)
    
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
    
      const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create update object
        const updateData = {
          ...formData,
          ...(isPasswordChanged ? { password: formData.password } : {})
        };
    
        // Log the update data (replace with your actual update logic)
        console.log('Data yang akan diupdate:', updateData);
    
        // Here you would typically make an API call to update the data
        alert('Data berhasil diupdate!');
      };
    
      const navigate = useNavigate()
      const handleCancel = () => {
        setFormData(existingData);
        setPhotoPreview(existingData.photoUrl);
        setIsPasswordChanged(false);
        navigate('/akunKaryawan')
      };

      const breadcrumbItems = [
        { label: "Daftar Akun Karyawan", href: "/akunKaryawan" },
        { label: "Edit Data Karyawan", href: "" },
    ];


    return(
        <>
        <Navbar menuItems={menuItems} userOptions={userOptions}>
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
                                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Masukan Foto Barang</p>
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
                                value={formData.password || ''}
                                onChange={handleInputChange('password')}
                                type1="password"
                                required={false}
                                placeholder="Biarkan kosong jika tidak ingin mengubah password"
                                />
                                
                                <Input
                                label="Nama"
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                required={true}
                                />
                                
                                <InputDropdown
                                label="Divisi"
                                options={divisions}
                                value={formData.division}
                                onSelect={(option) => handleInputChange('division')(option)}
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
                                    options={['Menit', 'Antar']}
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
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                Batal
                                </button>
                                <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                Update
                                </button>
                            </div>
                            </form>
                        </div>
                    </section>
                    </div>
        </Navbar>
        </>
    )
}