import { useState } from "react";
import api from "../api/api";

export default function Register({ setUser, goBack }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Send data exactly how backend expects
      const res = await api.post("/auth/register", {
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        password,
        role: "CLIENT", // clients self-register
      });

      // 🔹 Save token
      localStorage.setItem("token", res.data.token);

      // 🔹 Fetch logged-in user
      const me = await api.get("/auth/me");
      setUser(me.data);
    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Client Registration
        </h2>

        <p
          className="text-sm text-center text-blue-600 cursor-pointer mb-4"
          onClick={goBack}
        >
          ← Back
        </p>

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          type="email"
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
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
}
