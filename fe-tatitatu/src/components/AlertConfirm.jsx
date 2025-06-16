import React from "react";

export default function AlertConfirm({
  title = "Konfirmasi",
  description = "Apakah Anda yakin?",
  confirmLabel = "Ya",
  cancelLabel = "Tidak",
  onConfirm,
  onCancel,
  confirmBgColor = "bg-red-600",
  confirmTextColor = "text-white",
  cancelBgColor = "bg-white",
  cancelTextColor = "text-gray-700"
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        
        <div className="px-6 py-4">
          <div className="mt-2">
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex flex-row-reverse gap-3">
          <button
            type="button"
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmBgColor} ${confirmTextColor} hover:opacity-90 focus:ring-red-500`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            className={`inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${cancelBgColor} ${cancelTextColor} hover:bg-gray-50 focus:ring-gray-500`}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}