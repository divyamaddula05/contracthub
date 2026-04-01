const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

const extraLocalOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

const allowedOrigins = process.env.CORS_ORIGIN
  ? [...new Set([
      ...process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
      ...extraLocalOrigins,
    ])]
  : ["*", ...extraLocalOrigins];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/contracts", require("./routes/contractRoutes"));

app.get("/", (req, res) => {
  res.send("ContractHub API running");
});

module.exports = app;
