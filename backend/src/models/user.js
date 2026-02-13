const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "REVIEWER", "CLIENT"],
      default: "CLIENT",
    },
  },
  { timestamps: true }
);

// Check if model already exists to avoid OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
