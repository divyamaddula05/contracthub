import React from "react";

export default function Modal({ title, children, onClose, onConfirm, confirmLabel = "Confirm", cancelLabel = "Cancel" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <div className="bg-white rounded shadow-lg z-10 max-w-lg w-full p-6">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">{cancelLabel}</button>
          {onConfirm && (
            <button onClick={onConfirm} className="px-4 py-2 rounded bg-purple-600 text-white">{confirmLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}
