const EmailTemplate = require("../models/EmailTemplate");

// Get all templates for an admin
exports.getAllTemplates = async (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }
    const templates = await EmailTemplate.find({ createdBy: adminId });
    res.status(200).json(templates);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching templates", error: error.message });
  }
};

// Get a single template by ID
exports.getTemplateById = async (req, res) => {
  const { id } = req.params;
  const { adminId } = req.query;
  try {
    const template = await EmailTemplate.findOne({
      _id: id,
      createdBy: adminId,
    });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json(template);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching template", error: error.message });
  }
};

// Create a new template
exports.createTemplate = async (req, res) => {
  const { title, subject, body, category } = req.body;
  const { adminId } = req.query;

  if (!title || !subject || !body) {
    return res
      .status(400)
      .json({ message: "Title, subject, and body are required" });
  }

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required" });
  }

  try {
    const newTemplate = new EmailTemplate({
      title,
      subject,
      body,
      category: category || "custom",
      createdBy: adminId,
    });
    await newTemplate.save();
    res.status(201).json({
      message: "Template created successfully",
      template: newTemplate,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating template", error: error.message });
  }
};

// Update a template by ID
exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { title, subject, body, category } = req.body;
  const { adminId } = req.query;

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required" });
  }

  try {
    const template = await EmailTemplate.findOne({
      _id: id,
      createdBy: adminId,
    });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    template.title = title || template.title;
    template.subject = subject || template.subject;
    template.body = body || template.body;
    template.category = category || template.category;

    await template.save();
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
  const { id } = req.params;
  const { adminId } = req.query;

  try {
    const template = await EmailTemplate.findOneAndDelete({
      _id: id,
      createdBy: adminId,
    });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting template", error: error.message });
  }
};
