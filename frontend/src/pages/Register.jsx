import React, { useState } from "react";
import api from "../api/api";   // correct import

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // call backend correctly
      const res = await api.post("/auth/register", form);

      alert("Registration successful! Please login.");
      console.log(res.data);
    } catch (err) {
      console.error("REGISTER ERROR:", err.response?.data || err.message);
      alert("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
        required
      />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />

      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
