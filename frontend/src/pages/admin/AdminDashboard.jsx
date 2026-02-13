import { useEffect, useState } from "react";
import api from "../../api/api";
import ContractCard from "../../components/ContractCard";

export default function AdminDashboard({ user, logout }) {
  const [contracts, setContracts] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContractLogs, setSelectedContractLogs] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const fetchContracts = async () => {
    try {
      const res = await api.get("/contracts");
      setContracts(res.data);
    } catch (err) {
      console.error("Error fetching contracts:", err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get("/users?role=CLIENT");
      setClients(res.data || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchClients();
  }, []);

  const createContract = async () => {
    if (!newTitle.trim()) {
      alert("Please enter a contract title");
      return;
    }

    try {
      setLoading(true);
      await api.post("/contracts", { 
        title: newTitle,
        reviewer: selectedReviewer || null
      });
      alert("Contract created successfully");
      setNewTitle("");
      setSelectedReviewer("");
      fetchContracts();
    } catch (err) {
      alert("Failed to create contract: " + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const viewLogs = async (contractId, contractTitle) => {
    try {
      const res = await api.get(`/contracts/${contractId}/logs`);
      setAuditLogs(res.data);
      setSelectedContractLogs(contractTitle);
      setShowLogsModal(true);
    } catch (err) {
      alert("Failed to fetch logs: " + err.response?.data?.message);
    }
  };

  const deleteContract = async (contractId) => {
    if (!confirm('Are you sure you want to delete this contract? This cannot be undone.')) return;
    try {
      await api.delete(`/contracts/${contractId}`);
      alert('Contract deleted');
      fetchContracts();
    } catch (err) {
      alert('Failed to delete contract: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Already handled in Dashboard.jsx, but we render the content */}

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Create Contract Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Create New Contract
          </h2>
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title</label>
              <input
                type="text"
                placeholder="Enter contract title (e.g., NDA Agreement)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex-1 min-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Reviewer (Client)</label>
              <select
                value={selectedReviewer}
                onChange={(e) => setSelectedReviewer(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- No reviewer --</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={createContract}
              disabled={loading}
              className={`px-6 py-2 rounded font-medium text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        {/* Contracts List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            All Contracts ({contracts.length})
          </h2>

          {contracts.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-600">
              <p>No contracts yet. Create one to get started!</p>
            </div>
          ) : (
            contracts.map((contract) => (
              <div key={contract._id}>
                <ContractCard
                  contract={contract}
                  user={user}
                  onUpdate={fetchContracts}
                />
                <div className="mb-6 text-right flex justify-end gap-2">
                  <button
                    onClick={() => viewLogs(contract._id, contract.title)}
                    className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition text-gray-700"
                  >
                    View Audit Logs
                  </button>
                  <button
                    onClick={() => deleteContract(contract._id)}
                    className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audit Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Audit Logs: {selectedContractLogs}
              </h3>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-gray-600">No audit logs yet.</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log._id}
                    className="border-l-4 border-purple-500 bg-gray-50 p-3 rounded"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {log.action}
                        </p>
                        <p className="text-sm text-gray-600">
                          By: {log.user?.name} ({log.user?.email})
                        </p>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {JSON.stringify(log.metadata)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLogsModal(false)}
              className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
