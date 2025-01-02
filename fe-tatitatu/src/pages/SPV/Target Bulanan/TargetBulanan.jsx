import { useState } from "react";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menuSpv";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Input from "../../../components/Input";

export default function TargetBulanan() {
  const [data, setData] = useState({
    branches: [
      {
        id: 'GOR',
        name: 'GOR',
        months: [
          {
            name: 'Januari',
            target: 4000000,
            achieved: 1500000,
            remaining: 2500000
          },
          {
            name: 'Februari',
            target: 3000000,
            achieved: 1500000,
            remaining: 1500000
          },
          {
            name: 'Maret',
            target: 5000000,
            achieved: 1500000,
            remaining: 3500000
          },
          {
            name: 'April',
            target: 4000000,
            achieved: 1500000,
            remaining: 2500000
          },
          {
            name: 'Mei',
            target: 4000000,
            achieved: 1500000,
            remaining: 2500000
          }
        ]
      }
    ]
  });

  const [selectedBranch, setSelectedBranch] = useState(data.branches[0].id);
  const [showModal, setShowModal] = useState(false);
  const [editingMonth, setEditingMonth] = useState(null);
  const [newTarget, setNewTarget] = useState('');

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  const calculateProgressWidth = (achieved, target) => {
    return `${(achieved / target) * 100}%`;
  };

  const handleEdit = (month) => {
    setEditingMonth(month);
    setNewTarget(month.target);
    setShowModal(true);
  };

  const handleSave = () => {
    const updatedData = {
      ...data,
      branches: data.branches.map(branch => ({
        ...branch,
        months: branch.months.map(month => 
          month.name === editingMonth.name
            ? {
                ...month,
                target: parseInt(newTarget),
                remaining: parseInt(newTarget) - month.achieved
              }
            : month
        )
      }))
    };
    setData(updatedData);
    setShowModal(false);
  };

  const dropdownOptions = data.branches.map(branch => ({
    value: branch.id,
    label: branch.name
  }));

  const handleBranchSelect = (branchName) => {
    const branch = data.branches.find(b => b.name === branchName);
    if (branch) {
      setSelectedBranch(branch.id);
    }
  };

  return (
    <Navbar menuItems={menuItems} userOptions={userOptions}>
      <div className="p-5">
        <div className="">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-primary">Target Bulanan Kasir</h2>
            <div className="w-48">
              <ButtonDropdown
                options={dropdownOptions}
                selectedStore={data.branches[0].name}
                label="Pilih Cabang"
                onSelect={handleBranchSelect}
              />
            </div>
          </div>

          <div className="space-y-6">
            {data.branches
              .find(branch => branch.id === selectedBranch)
              ?.months.map((month, index) => (
                <div key={index} className="bg-white rounded-lg py-4">
                  <div className="flex items-start px-4">
                    <div className="w-1/4">
                      <div className="text-gray-500 text-sm">Bulan</div>
                      <div className="font-bold text-black">{month.name}</div>
                    </div>
                    <div className="w-1/3 text-left">
                      <div className="text-gray-500 text-sm">Jumlah Target</div>
                      <div className="font-bold text-black">{formatCurrency(month.target)}</div>
                    </div>
                    <div className="flex-grow"></div>
                    <button 
                      onClick={() => handleEdit(month)}
                      className="text-orange-500 border border-orange-500 rounded-md px-4 py-1.5 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z" fill="#DA5903"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z" fill="#DA5903"/>
                      </svg>
                      Edit
                    </button>
                  </div>

                  <div className="mt-4 px-4">
                    <div className="flex justify-between text-sm mb-2">
                      <div className="text-primary font-medium">
                        {formatCurrency(month.achieved)} Tercapai
                      </div>
                      <div className="text-primary font-bold">
                        {formatCurrency(month.remaining)} Tersisa
                      </div>
                    </div>

                    <div className="h-3 w-full bg-pink rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: calculateProgressWidth(month.achieved, month.target) }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Edit Target Bulanan</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <Input
                label="Jumlah Target"
                type="number"
                value={newTarget}
                onChange={setNewTarget}
                required={true}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
}