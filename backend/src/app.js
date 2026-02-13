const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
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
