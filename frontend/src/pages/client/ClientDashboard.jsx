import { useEffect, useState } from "react";
import api from "../../api/api";
import ContractCard from "../../components/ContractCard";

export default function ClientDashboard({ user, logout }) {
  const [contracts, setContracts] = useState([]);

  const fetchContracts = async () => {
    const res = await api.get("/contracts");
    setContracts(res.data);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/contracts/${id}/approve`);
      alert("Contract approved");
      fetchContracts();
    } catch (err) {
      alert("Approve failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await api.put(`/contracts/${id}/reject`, { reason });
      alert("Contract rejected");
      fetchContracts();
    } catch (err) {
      alert("Reject failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Client Dashboard</h1>

        {contracts.map((contract) => (
          <div key={contract._id}>
            <ContractCard contract={contract} user={user} onUpdate={fetchContracts} />
          </div>
        ))}
      </div>
    </div>
  );
}
