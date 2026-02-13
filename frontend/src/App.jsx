import { useEffect, useState } from "react";
import api from "./api/api";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AuthLanding from "./pages/AuthLanding";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("landing");
  const [loginRole, setLoginRole] = useState(null);

  // Auto-login if token exists
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setView("landing");
  };

  // ✅ If logged in, always show dashboard
  if (user) {
    return <Dashboard user={user} logout={logout} />;
  }

  // ✅ Landing page
  if (view === "landing") {
    return (
      <AuthLanding
        goLogin={(role) => {
          setLoginRole(role);
          setView("login");
        }}
        goRegister={() => setView("register")}
      />
    );
  }

  // ✅ Login page
  if (view === "login") {
    return (
      <Login
        role={loginRole}
        setUser={setUser}
        goBack={() => setView("landing")}
      />
    );
  }

  // ✅ Register page
  if (view === "register") {
    return (
      <Register
        setUser={setUser}
        goBack={() => setView("landing")}
      />
    );
  }

  return null;
}
