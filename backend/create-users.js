require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "REVIEWER", "CLIENT"],
    default: "CLIENT",
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete existing test users
    await User.deleteMany({ email: { $in: ["client@test.com", "admin@test.com"] } });
    console.log("Deleted existing test users");

    // Create client user
    const clientPassword = await bcrypt.hash("password123", 10);
    const client = await User.create({
      name: "Test Client",
      email: "client@test.com",
      password: clientPassword,
      role: "CLIENT",
    });
    console.log("Created client user:", client.email);

    // Create admin user
    const adminPassword = await bcrypt.hash("password123", 10);
    const admin = await User.create({
      name: "Test Admin",
      email: "admin@test.com",
      password: adminPassword,
      role: "ADMIN",
    });
    console.log("Created admin user:", admin.email);

    console.log("\nTest credentials created successfully!");
    console.log("Client: client@test.com / password123");
    console.log("Admin: admin@test.com / password123");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createUsers();
