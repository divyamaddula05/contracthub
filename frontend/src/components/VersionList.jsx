import { useEffect, useState } from "react";
import api from "../api/api";
import Modal from "./Modal";

export default function VersionList({ contractId, user, onUpdate }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsByVersion, setLogsByVersion] = useState({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'feedback'
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/contracts/${contractId}/versions`);
      setVersions(res.data || []);
    } catch (err) {
      console.error("Error fetching versions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [contractId]);

  const openModal = (type, versionId) => {
    setModalType(type);
    setSelectedVersion(versionId);
    setInputValue("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setSelectedVersion(null);
    setInputValue("");
  };

  const performApprove = async () => {
    try {
      await api.put(`/contracts/${contractId}/versions/${selectedVersion}/approve`);
      await fetchVersions();
      onUpdate?.();
      closeModal();
    } catch (err) {
      alert("Approve failed: " + err.response?.data?.message);
    }
  };

  const performReject = async () => {
    if (!inputValue || !inputValue.trim()) return alert("Please provide a rejection reason");
    try {
      await api.put(`/contracts/${contractId}/versions/${selectedVersion}/reject`, { reason: inputValue });
      await fetchVersions();
      onUpdate?.();
      closeModal();
    } catch (err) {
      alert("Reject failed: " + err.response?.data?.message);
    }
  };

  const performFeedback = async () => {
    if (!inputValue || !inputValue.trim()) return alert("Please enter feedback");
    try {
      await api.post(`/contracts/${contractId}/versions/${selectedVersion}/feedback`, { comment: inputValue });
      alert("Feedback submitted");
      fetchVersionLogs(selectedVersion);
      closeModal();
    } catch (err) {
      alert("Feedback failed: " + err.response?.data?.message);
    }
  };

  const fetchVersionLogs = async (versionId) => {
    try {
      const res = await api.get(`/contracts/${contractId}/versions/${versionId}/logs`);
      setLogsByVersion((s) => ({ ...s, [versionId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch logs for version", versionId, err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="font-semibold text-gray-700 mb-3">Contract Versions</h4>

      {loading ? (
        <p className="text-sm text-gray-500">Loading versions...</p>
      ) : versions.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No versions uploaded yet</p>
      ) : (
        <div className="space-y-4">
          {versions.map((v) => (
            <div
              key={v._id}
              className="bg-white border border-gray-200 rounded px-4 py-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-800">Version {v.version}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded by {v.uploadedBy?.name || "Unknown"} on {new Date(v.createdAt).toLocaleString()}
                  </p>
                  {v.status && (
                    <p className="text-xs font-semibold mt-1 px-2 py-1 rounded inline-block" style={{
                      backgroundColor: v.status === "APPROVED" ? "#dcfce7" : v.status === "REJECTED" ? "#fee2e2" : "#e0e7ff",
                      color: v.status === "APPROVED" ? "#166534" : v.status === "REJECTED" ? "#991b1b" : "#312e81"
                    }}>
                      {v.status}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => window.open(v.filePath || '#', "_blank")} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">View</button>

                    {user?.role === "CLIENT" && (
                      <a href={v.filePath || '#'} download className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded">Download</a>
                    )}

                    {user?.role === "CLIENT" && v.status === "SUBMITTED" && (
                      <>
                        <button onClick={() => openModal("approve", v._id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Approve</button>
                        <button onClick={() => openModal("reject", v._id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Reject</button>
                      </>
                    )}

                    {user?.role === "CLIENT" && (
                      <button onClick={() => openModal("feedback", v._id)} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm">Feedback</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback / Logs */}
              <div className="mt-3">
                <button
                  onClick={() => fetchVersionLogs(v._id)}
                  className="text-xs text-purple-600 hover:underline"
                >
                  View comments / logs
                </button>

                {logsByVersion[v._id] && (
                  <div className="mt-2 space-y-2">
                    {logsByVersion[v._id].map((log) => (
                      <div key={log._id} className="bg-gray-50 p-2 rounded border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold">{log.action}</p>
                            {log.metadata?.comment && <p className="text-sm text-gray-700">{log.metadata.comment}</p>}
                            <p className="text-xs text-gray-500">By: {log.user?.name} ({log.user?.email})</p>
                          </div>
                          <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={modalType === "approve" ? "Approve Version" : modalType === "reject" ? "Reject Version" : "Provide Feedback"}
          onClose={closeModal}
          onConfirm={modalType === "approve" ? performApprove : modalType === "reject" ? performReject : performFeedback}
          confirmLabel={modalType === "feedback" ? "Submit" : "Confirm"}
        >
          {modalType === "approve" && (
            <p>Are you sure you want to approve this version and finalize the contract?</p>
          )}

          {modalType === "reject" && (
            <div>
              <p className="text-sm mb-2">Please enter a reason for rejection:</p>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Reason for rejection"
              />
            </div>
          )}

          {modalType === "feedback" && (
            <div>
              <p className="text-sm mb-2">Enter your feedback for this version:</p>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={4}
                placeholder="Feedback / comments"
              />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
