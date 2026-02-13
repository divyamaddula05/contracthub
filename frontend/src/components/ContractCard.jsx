import { useState } from "react";
import api from "../api/api";
import StatusBadge from "./StatusBadge";
import VersionList from "./VersionList";

export default function ContractCard({ contract, user, onUpdate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      await api.post(`/contracts/${contract._id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully");
      setSelectedFile(null);
      onUpdate();
    } catch (err) {
      alert("Upload failed: " + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await api.put(`/contracts/${contract._id}/approve`);
      alert("Contract approved");
      onUpdate();
    } catch (err) {
      alert("Approval failed: " + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/contracts/${contract._id}/reject`, {
        reason: rejectionReason,
      });
      alert("Contract rejected");
      setRejectionReason("");
      setShowRejectForm(false);
      onUpdate();
    } catch (err) {
      alert("Rejection failed: " + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {contract.title}
        </h3>
        <StatusBadge status={contract.status} />
      </div>

      {/* Rejection Reason Display */}
      {contract.status === "REJECTED" && contract.rejectionReason && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
          <p className="text-sm text-red-700">
            <strong>Rejection Reason:</strong> {contract.rejectionReason}
          </p>
        </div>
      )}

      {/* Versions */}
      <VersionList contractId={contract._id} user={user} onUpdate={onUpdate} />

      {/* ADMIN ACTIONS */}
      {user.role === "ADMIN" && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex gap-3 items-center mb-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="text-sm border rounded px-2 py-1"
              disabled={contract.status === "APPROVED"}
            />
            <button
              onClick={uploadFile}
              disabled={loading || contract.status === "APPROVED"}
              className={`px-4 py-2 rounded text-white font-medium transition ${
                loading || contract.status === "APPROVED"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? "Uploading..." : "Upload Version"}
            </button>
          </div>

          {selectedFile && (
            <p className="text-sm text-gray-600 mb-2">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      )}

      {/* CLIENT ACTIONS */}
      {user.role === "CLIENT" && contract.status !== "APPROVED" && contract.status !== "DRAFT" && (
        <div className="mt-6 pt-4 border-t flex gap-3">
          <button
            onClick={handleApprove}
            disabled={loading}
            className={`px-6 py-2 rounded text-white font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : "Approve"}
          </button>

          {!showRejectForm ? (
            <button
              onClick={() => setShowRejectForm(true)}
              className="px-6 py-2 rounded text-white font-medium bg-red-600 hover:bg-red-700 transition"
            >
              Reject
            </button>
          ) : (
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                placeholder="Reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={handleReject}
                disabled={loading}
                className={`px-4 py-2 rounded text-white font-medium transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason("");
                }}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
