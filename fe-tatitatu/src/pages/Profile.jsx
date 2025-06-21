import React, { useState, useEffect } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import LayoutWithNav from "../components/LayoutWithNav";
import api from "../utils/api"; 
import AlertSuccess from "../components/AlertSuccess";
import { useParams } from "react-router-dom";

export default function Profile() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userId = userData?.userId;
  const userRole = userData?.role;

  const isAdmin = userRole === 'admin';
  const isHeadGudang = userRole === 'headgudang';
  const isKasirToko = userRole === 'kasirtoko';
  const isAdminGudang = userRole === 'admingudang';
  const isOwner = userRole === 'owner';
  const isFinance = userRole === 'finance';
  const isManajer = userRole === 'manajer';
  const isKaryawanProduksi = userData?.role === 'karyawanproduksi'
  const isTimHybrid = userRole === 'timhybrid'


  const role_name = localStorage.getItem('role_name')
  const { id } = useParams();
  const user_id = id

  const isKaryawan = ['karyawanumum', 'karyawanproduksi', 'karyawantransportasi'].includes(userRole);
  const [isAlertSucc, setAlertSucc] = useState(false);


    const isAbsensiRoute = 
    location.pathname === '/absensi-karyawan' || 
    location.pathname === '/absensi-karyawan-transport' || 
    location.pathname === '/absensi-karyawan-produksi' ||
    location.pathname === '/izin-cuti-karyawan' ||
    location.pathname === '/profile' ||
    location.pathname.startsWith('/absensi-karyawan-produksi/tambah');
  
  const toko_id = userData?.tokoId;
  
  const themeColor = isAbsensiRoute
    ? (!toko_id 
        ? "biruTua" 
        : toko_id === 1 
          ? "coklatTua" 
          : toko_id === 2 
            ? "primary" 
            : "hitam")
    : (isAdminGudang || isHeadGudang || isKaryawanProduksi) 
      ? 'coklatTua' 
      : (isManajer || isOwner || isFinance) 
        ? "biruTua" 
        : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
          ? "hitam"
          : "primary";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nama: "",
    noHandphone: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    detailPassword: ""
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [imageFilename, setImageFilename] = useState(null);

  const getImageUrl = (imageFilename) => {
    if (!imageFilename) return null;
    
    const baseUrl = import.meta.env.VITE_API_URL;

    if (isKasirToko){
      return `${baseUrl}/images-toko/${imageFilename}`;
    } else if(isKaryawan){
      return `${baseUrl}/images-karyawan/${imageFilename}`;
    } else if(isManajer){
      if(role_name == 'Owner' || role_name == 'Finance' || role_name == 'Manager'){
        return `${baseUrl}/images-authentication/${imageFilename}`;
      } else if(role_name == 'SPV' || role_name == 'Admin Gudang' || role_name == 'Head Gudang'){
        return `${baseUrl}/images-toko/${imageFilename}`;
      }
    }    
    return null;
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      let endpoint = '';
      let response = null;

      if (isKasirToko) {
        endpoint = `/cabang/${userId}`;
      } else if(isKaryawan || isTimHybrid){
        endpoint = `/karyawan-user/${userId}`;
      } else if(isManajer){
        if (role_name == 'Admin Gudang') {
          endpoint = '/cabang/1';
        } else if (role_name == 'SPV'){
          endpoint = `/toko/${id}`;
        } else if(role_name == 'Head Gudang'){
          endpoint = '/toko/1'; 
        } else if(role_name == 'Owner' || role_name == 'Finance' || role_name == 'Manager'){
          endpoint = `/authentication/${id}`;
        }
      }

      console.log(`Fetching profile data from endpoint: ${endpoint}`);
      response = await api.get(endpoint);
      
      if (response.data.success) {
        const profileData = response.data.data;
        // console.log("Profile data fetched:", profileData);

        if (isKasirToko || role_name == 'Admin Gudang') {
          console.log(profileData.nama_karyawan)

          setFormData({
            ...formData,
            email: profileData.email || '',
            nama: profileData.nama_cabang || '',
            password: '', 
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            detailPassword: profileData.detail_password || ''
          });
        } else if (role_name == 'SPV' || role_name == 'Head Gudang'){
          console.log(profileData.nama_karyawan)

          setFormData({
            ...formData,
            email: profileData.email || '',
            nama: profileData.nama_toko || '',
            password: '',  
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            detailPassword: profileData.detail_password || ''
          });
        } else if (role_name == 'Owner' || role_name == 'Finance' || role_name == 'Manager'){
          console.log(profileData.nama_karyawan)

          setFormData({
            ...formData,
            email: profileData.email || '',
            nama: profileData.nama || '',
            password: '',  
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            detailPassword: profileData.detail_password || ''
          });
        } else if (isKaryawan || isTimHybrid){
          console.log(profileData.nama_karyawan)
          setFormData({
            ...formData,
            email: profileData.email || '',
            nama: profileData.nama_karyawan || '',
            noHandphone: profileData.nomor_handphone || '',
            password: '',  
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            detailPassword: profileData.detail_password || ''
          });
        }

        if (profileData.image) {
          setImageFilename(profileData.image);
          setCurrentImageUrl(getImageUrl(profileData.image));
          
          if (profileData.image !== userData.image) {
            const updatedUserData = {
              ...userData,
              image: profileData.image
            };
            localStorage.setItem('userData', JSON.stringify(updatedUserData));
            console.log("Updated localStorage with new image filename:", profileData.image);
          }
        }
      } else {
        setError("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("An error occurred while fetching your profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmSucc = () => {
    setAlertSucc(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Show preview
      const objectUrl = URL.createObjectURL(file);
      setCurrentImageUrl(objectUrl);
    }
  };

  // console.log(formData)

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let endpoint = '';
      let formPayload = new FormData();
      let id

      if (isManajer) {
        id = user_id
      } else {
        id = userId
      }

      if (formData.newPassword || formData.oldPassword || formData.confirmPassword) {
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
          setError("Semua field password harus diisi untuk mengganti password");
          setIsLoading(false);
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          setError("Password baru dan konfirmasi password tidak cocok");
          setIsLoading(false);
          return;
        }
      }

      const roleAdminGudang = role_name == 'Admin Gudang'
      const roleSpv = role_name == 'SPV'
      const roleHeadGudang = role_name == 'Head Gudang'
      const roleOwner = role_name == 'Owner'
      const roleFinance = role_name == 'Finance'
      const roleManager = role_name == 'Manager'


      if (isKasirToko || roleAdminGudang) {
        endpoint = `/cabang-user/${roleAdminGudang ? 1 : id}`;
      
        const jsonPayload = {
          nama_cabang: formData.nama,
          email: formData.email
        };
        
        if (formData.oldPassword && formData.newPassword) {
          jsonPayload.old_password = formData.oldPassword;
          jsonPayload.password = formData.newPassword;
          jsonPayload.confirm_password = formData.confirmPassword;
        }
        
        const response = await api.put(endpoint, jsonPayload);
        
        if (response.data.success) {
          setAlertSucc(true);

          fetchUserProfile();

          setFormData(prev => ({
            ...prev,
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
        } else {
          setError(response.data.message || 'Gagal memperbarui profil');
        }
        
        setIsLoading(false);
        return; 
      } 
      else if (roleSpv || roleHeadGudang) {
        endpoint = `/toko-user/${roleHeadGudang ? 1 : id}`;

        formPayload.append('nama_toko', formData.nama);
        formPayload.append('email', formData.email);
        
        if (formData.oldPassword && formData.newPassword) {
          formPayload.append('old_password', formData.oldPassword);
          formPayload.append('password', formData.newPassword);
          formPayload.append('confirm_password', formData.confirmPassword);
        }

        if (selectedImage) {
          formPayload.append('image', selectedImage);
        }
      } 
      else if (roleOwner || roleFinance || roleManager) {
        endpoint = `/authentication/${id}`;
        
        formPayload.append('nama', formData.nama);
        formPayload.append('email', formData.email);
        
        if (formData.oldPassword && formData.newPassword) {
          formPayload.append('old_password', formData.oldPassword);
          formPayload.append('password', formData.newPassword);
          formPayload.append('confirm_password', formData.confirmPassword);
        }
        
        if (selectedImage) {
          formPayload.append('image', selectedImage);
        }
      } 
      else if (isKaryawan) {
        endpoint = `/karyawan-user/${id}`;
        
        formPayload.append('nama_karyawan', formData.nama);
        formPayload.append('email', formData.email);
        formPayload.append('nomor_handphone', formData.noHandphone);
        
        if (formData.oldPassword && formData.newPassword) {
          formPayload.append('old_password', formData.oldPassword);
          formPayload.append('password', formData.newPassword);
          formPayload.append('confirm_password', formData.confirmPassword);
        }
        
        if (selectedImage) {
          formPayload.append('image', selectedImage);
        }
      }

      console.log(`Submitting profile update to endpoint: ${endpoint}`);
      console.log('FormData content keys:', [...formPayload.keys()]);

      const response = await api.put(endpoint, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setAlertSucc(true);
  
        fetchUserProfile();
        
        setFormData(prev => ({
          ...prev,
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      
        setSelectedImage(null);
      } else {
        setError(response.data.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LayoutWithNav>
        <div className="p-5">
          <div className="flex justify-center items-center h-96">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-${themeColor}`}></div>
          </div>
        </div>
      </LayoutWithNav>
    );
  }

  return (
    <LayoutWithNav>
      <div className="p-5">
        <div className="mb-6">
          <p className={`text-${themeColor} text-base font-bold`}>Profile</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg p-6">
          {!(isKasirToko || isAdminGudang) && (
            <div className="mb-6">
              <p className="text-base mb-4">Masukan Foto</p>
              <div 
                className={`w-48 h-48 border-2 border-dashed border-${themeColor} rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden`}
                onClick={() => document.getElementById('imageUpload').click()}
              >
                {currentImageUrl ? (
                  <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg"/>
                ) : (
                  <div className="text-center">
                    <svg className={`w-12 h-12 mx-auto mb-2 text-${themeColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span className={`text-${themeColor}`}>Masukan Foto</span>
                  </div>
                )}
                <input
                  type="file"
                  id="imageUpload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={formData.email}
              onChange={handleInputChange('email')}
              required={true}
              type1="email"
            />
            <Input
              label="Password"
              value={formData.detailPassword}
              onChange={handleInputChange('password')}
              type1="password"
              required={true}
              // placeholder="********"
              disabled={true}
            />
            <Input
              label={isAdmin || isHeadGudang ? "Nama Toko" : isKasirToko || isAdminGudang ? "Nama Cabang" : "Nama"}
              value={formData.nama}
              onChange={handleInputChange('nama')}
              required={true}
              disabled={isHeadGudang || isAdminGudang}
            />
            {isKaryawan && (
              <Input
                label="Nomor Handphone"
                value={formData.noHandphone}
                onChange={handleInputChange('noHandphone')}
                placeholder="Masukan Nomor Handphone"
                required={true}
              />
            )}
          </div>

          <div className="mt-8">
            <p className="text-lg font-semibold mb-4">Ganti Password</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Masukan Password Lama"
                value={formData.oldPassword}
                onChange={handleInputChange('oldPassword')}
                type1="password"
                placeholder="Input Disini"
                required={true}
              />
              <Input
                label="Masukan Password Baru"
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                type1="password"
                placeholder="Input Disini"
                required={true}
              />
              <Input
                label="Masukan Ulang Password Baru"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                type1="password"
                placeholder="Input Disini"
                required={true}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              label="Batal"
              // bgColor="bg-white"
              bgColor={`border border-secondary focus:ring-1 focus:border-${themeColor}`}
              textColor="text-gray-600"
              hoverColor={`hover:border-${themeColor} hover:border`}
              onClick={() => fetchUserProfile()}
            />
            <Button
              label="Simpan"
              bgColor={`bg-${themeColor}`}
              textColor="text-white"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
            {isAlertSucc && (
                <AlertSuccess
                    title="Berhasil!!"
                    description="Profil berhasil diperbaharui"
                    confirmLabel="Ok"
                    onConfirm={handleConfirmSucc}
                />
            )}
    </LayoutWithNav>
  );
}