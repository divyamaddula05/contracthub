import React, { useState } from "react";
import api from "../api/api";

export default function Register({ goBack }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", form);

      alert("Registration successful! Please login.");
      goBack(); // go back to login page
    } catch (err) {
      console.error("REGISTER ERROR:", err.response?.data || err.message);
      alert("Registration failed");
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

        <form onSubmit={handleSubmit}>
          <input
            className="w-full border p-2 mb-4 rounded"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
          />

          <input
            className="w-full border p-2 mb-4 rounded"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            className="w-full border p-2 mb-4 rounded"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
