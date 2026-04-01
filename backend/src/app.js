const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

/**
 * ✅ Allowed Origins Setup
 * - Supports multiple origins from .env
 * - Falls back to allow all if not set
 */
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["*"];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

/**
 * ✅ Middleware
 */
app.use(express.json());

/**
 * ✅ Static files (uploads)
 */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/**
 * ✅ Routes
 */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/contracts", require("./routes/contractRoutes"));

/**
 * ✅ Health check route
 */
app.get("/", (req, res) => {
  res.send("ContractHub API running");
});

module.exports = app;