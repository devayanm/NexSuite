const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Admin login route
router.post("/login", asyncHandler(adminController.adminLogin));

// Admin logout route
router.post("/logout", adminController.adminLogout);

module.exports = router;
