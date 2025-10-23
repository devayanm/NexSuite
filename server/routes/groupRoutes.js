const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const groupController = require("../controllers/groupController");

// Create a new group
router.route("/create").post(isAuthenticated, groupController.createGroup);

// Get all groups for an admin
router.route("/all").get(isAuthenticated, groupController.getAllGroups);

// Add members to a group
router
  .route("/:id/members")
  .post(isAuthenticated, groupController.addMembersToGroup);

// Remove member from a group
router
  .route("/:id/members/:memberId")
  .delete(isAuthenticated, groupController.removeMemberFromGroup);

// Get, update, or delete a specific group
router
  .route("/:id")
  .get(isAuthenticated, groupController.getGroupById)
  .put(isAuthenticated, groupController.updateGroup)
  .delete(isAuthenticated, groupController.deleteGroup);

module.exports = router;
