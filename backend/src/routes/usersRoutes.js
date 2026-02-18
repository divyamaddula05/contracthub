const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Import User model - handled at the controller level
const User = require("../models/UserFile");

// Get users by role (admin only) - query param: ?role=CLIENT
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }
    const users = await User.find(query).select("_id name email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
