require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const path = require("path");


connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
