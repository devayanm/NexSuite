const templateService = require("../services/templateService");

// Create a new template
exports.createTemplate = async (req, res) => {
  try {
    const { templateName, filters, subject, body } = req.body;
    const { adminId } = req.query;

    if (!templateName || !subject || !body || !adminId) {
      return res
        .status(400)
        .json({
          message: "Template name, subject, body, and adminId are required",
        });
    }

    const templateData = {
      templateName,
      filters: filters || [],
      subject,
      body,
      createdBy: adminId,
    };

    const template = await templateService.createTemplate(templateData);
    res
      .status(201)
      .json({ message: "Template created successfully", template });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating template", error: error.message });
  }
};

// Get all templates for an admin
exports.getAllTemplates = async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const templates = await templateService.getTemplatesByAdmin(adminId);
    res.status(200).json(templates);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching templates", error: error.message });
  }
};

// Get a single template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const template = await templateService.getTemplateById(id, adminId);
    res.status(200).json(template);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Template not found", error: error.message });
  }
};

// Update a template by ID
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;
    const updateData = req.body;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const template = await templateService.updateTemplate(
      id,
      adminId,
      updateData
    );
    res
      .status(200)
      .json({ message: "Template updated successfully", template });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating template", error: error.message });
  }
};

// Delete a template by ID
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const result = await templateService.deleteTemplate(id, adminId);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting template", error: error.message });
  }
};
