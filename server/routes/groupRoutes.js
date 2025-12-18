const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const groupController = require("../controllers/groupController");

// Group routes
router.post("/create", isAuthenticated, groupController.createGroup);
router.get("/all", isAuthenticated, groupController.getAllGroups);
router.get("/:id", isAuthenticated, groupController.getGroupById);
router.get("/:id/emails", isAuthenticated, groupController.getGroupEmails);
router.put("/:id", isAuthenticated, groupController.updateGroup);
router.delete("/:id", isAuthenticated, groupController.deleteGroup);
router.post("/:id/add", isAuthenticated, groupController.addToGroup);
router.post("/:id/remove", isAuthenticated, groupController.removeFromGroup);

module.exports = router;
