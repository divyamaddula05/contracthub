export default function StatusBadge({ status }) {
  const base =
    "px-3 py-1 rounded-full text-xs font-semibold inline-block";

  const colors = {
    DRAFT: "bg-gray-200 text-gray-800",
    SUBMITTED: "bg-blue-200 text-blue-800",
    APPROVED: "bg-green-200 text-green-800",
    REJECTED: "bg-red-200 text-red-800",
  };

  return (
    <span className={`${base} ${colors[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}
