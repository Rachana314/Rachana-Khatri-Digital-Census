export default function StatusBadge({ status }) {
  const map = {
    Draft: "bg-gray-100 text-gray-700",
    Submitted: "bg-blue-50 text-blue-700",
    Rejected: "bg-red-50 text-red-700",
    Verified: "bg-green-50 text-green-700",
    Locked: "bg-purple-50 text-purple-700",
  };

  const cls = map[status] || "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
