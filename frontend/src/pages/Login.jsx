import { useState } from "react";
import api from "../api/api";   // uses the axios instance we fixed

export default function Login({ role, setUser, goBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // 🔐 Login request
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // Save token
      localStorage.setItem("token", res.data.token);

      // Get logged-in user info
      const me = await api.get("/auth/me");

      // Check if user logged into correct role (ADMIN / CLIENT)
      if (me.data.role !== role) {
        alert(`You are not authorized to login as ${role}`);
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }

      // Set logged-in user in app state
      setUser(me.data);

    } catch (err) {
      console.error("Login error:", err);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Login as {role}
        </h2>

        <p
          className="text-sm text-center text-blue-600 cursor-pointer mb-4"
          onClick={goBack}
        >
          ← Back
        </p>

        <input
          className="w-full border p-2 mb-4 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-4 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : role === "ADMIN"
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
