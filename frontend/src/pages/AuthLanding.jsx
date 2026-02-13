export default function AuthLanding({ goLogin, goRegister }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96 text-center">
        <h2 className="text-2xl font-semibold mb-6">Welcome to ContractHub</h2>

        <button
          onClick={() => goLogin("CLIENT")}
          className="w-full bg-blue-600 text-white py-2 rounded mb-3"
        >
          Login as Client
        </button>

        <button
          onClick={() => goLogin("ADMIN")}
          className="w-full bg-purple-600 text-white py-2 rounded mb-3"
        >
          Login as Admin
        </button>

        <p
          onClick={goRegister}
          className="text-sm text-blue-600 cursor-pointer mt-2"
        >
          New user? Register as Client
        </p>
      </div>
    </div>
  );
}
