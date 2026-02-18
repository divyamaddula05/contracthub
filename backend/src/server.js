require("dotenv").config({ path: __dirname + "/../.env" });
console.log("Using Mongo URI:", process.env.MONGO_URI);
const app = require("./app");
const connectDB = require("./config/db");
const path = require("path");




connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
