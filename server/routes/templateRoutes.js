const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const templateController = require("../controllers/templateController");

// Template routes
router.post("/create", isAuthenticated, templateController.createTemplate);
router.get("/all", isAuthenticated, templateController.getAllTemplates);
router.get("/:id", isAuthenticated, templateController.getTemplateById);
router.put("/:id", isAuthenticated, templateController.updateTemplate);
router.delete("/:id", isAuthenticated, templateController.deleteTemplate);

module.exports = router;
