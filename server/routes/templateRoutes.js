const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const templateController = require("../controllers/templateController");

// Create a new template
router
  .route("/create")
  .post(isAuthenticated, templateController.createTemplate);

// Get all templates for an admin
router.route("/all").get(isAuthenticated, templateController.getAllTemplates);

// Get, update, or delete a specific template
router
  .route("/:id")
  .get(isAuthenticated, templateController.getTemplateById)
  .put(isAuthenticated, templateController.updateTemplate)
  .delete(isAuthenticated, templateController.deleteTemplate);

module.exports = router;
