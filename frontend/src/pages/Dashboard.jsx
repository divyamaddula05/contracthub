import AdminDashboard from "./admin/AdminDashboard";
import ClientDashboard from "./client/ClientDashboard";

export default function Dashboard({ user, logout }) {
  return (
    <div>
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-purple-600">Contract</span>Hub
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              <p className="font-medium">{user.name}</p>
              <p className="text-gray-500">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div>
        {user.role === "ADMIN" ? (
          <AdminDashboard user={user} logout={logout} />
        ) : (
          <ClientDashboard user={user} logout={logout} />
        )}
      </div>
    </div>
  );
}
