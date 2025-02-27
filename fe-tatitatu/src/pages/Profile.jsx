import React, { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import LayoutWithNav from "../components/LayoutWithNav";

export default function Profile() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isKaryawan = ['karyawanumum', 'karyawanproduksi', 'karyawantransportasi'].includes(userData?.role);
  
  const [formData, setFormData] = useState({
    email: "emailspv123@gmail.com",
    password: "spv123",
    nama: "SPV Ganteng",
    noHandphone: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const handleInputChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <LayoutWithNav>
      <div className="p-5">
        <div className="mb-6">
          <p className="text-primary text-base font-bold">Profile</p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="mb-6">
            <p className="text-base mb-4">Masukan Foto Karyawan</p>
            <div 
              className="w-48 h-48 border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center cursor-pointer"
              onClick={() => document.getElementById('imageUpload').click()}
            >
              {selectedImage ? (
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg"/>
              ) : (
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  <span className="text-primary">Masukan Foto</span>
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
              value={formData.password}
              onChange={handleInputChange('password')}
              type1="password"
              required={true}
            />
            <Input
              label="Nama"
              value={formData.nama}
              onChange={handleInputChange('nama')}
              required={true}
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
                required={false}
              />
              <Input
                label="Masukan Password Baru"
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                type1="password"
                placeholder="Input Disini"
                required={false}
              />
              <Input
                label="Masukan Ulang Password Baru"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                type1="password"
                placeholder="Input Disini"
                required={false}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              label="Batal"
              bgColor="bg-white"
              textColor="text-gray-600"
              hoverColor="hover:bg-gray-100"
              onClick={() => {/* handle cancel */}}
            />
            <Button
              label="Simpan"
              bgColor="bg-primary"
              textColor="text-white"
              hoverColor="hover:bg-primary/90"
              onClick={() => {/* handle save */}}
            />
          </div>
        </div>
      </div>
    </LayoutWithNav>
  );
}