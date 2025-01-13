import React, { useState } from 'react';
import Input from '../../../components/Input';
import TextArea from '../../../components/Textarea';

const Modal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nama:', name);
    console.log('Tanggal dan Waktu:', date);
    console.log('Jenis:', category);
    console.log('Catatan:', notes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Kirim Catatan</h2>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <Input
              label="Nama"
              value={name}
              onChange={(value) => setName(value)}
              width="w-1/2"
            />
            <Input
              label="Tanggal dan Waktu"
              value={date}
              onChange={(value) => setDate(value)}
              width="w-1/2"
            />
          </div>
          <Input
            label="Jenis"
            value={category}
            onChange={(value) => setCategory(value)}
          />
          <TextArea
            label="Catatan"
            value={notes}
            onChange={(value) => setNotes(value)}
            required
          />
          <div className="flex justify-end mt-4">
            <button
              className="border border-secondary text-black hover:bg-[#990D51] px-10 py-2 rounded rounded-lg"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-[#7B0C42] hover:bg-[#990D51] text-white px-10 py-2 rounded rounded-lg ml-2"
            >
              Kirim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;