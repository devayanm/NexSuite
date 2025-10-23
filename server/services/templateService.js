const Template = require("../models/Template");

// Create a new template
exports.createTemplate = async (templateData) => {
  try {
    const template = new Template(templateData);
    await template.save();
    return template;
  } catch (error) {
    throw new Error(`Error creating template: ${error.message}`);
  }
};

// Get all templates for an admin
exports.getTemplatesByAdmin = async (adminId) => {
  try {
    const templates = await Template.find({ createdBy: adminId }).sort({
      createdAt: -1,
    });
    return templates;
  } catch (error) {
    throw new Error(`Error fetching templates: ${error.message}`);
  }
};

// Get a single template by ID
exports.getTemplateById = async (templateId, adminId) => {
  try {
    const template = await Template.findOne({
      _id: templateId,
      createdBy: adminId,
    });
    if (!template) {
      throw new Error("Template not found");
    }
    return template;
  } catch (error) {
    throw new Error(`Error fetching template: ${error.message}`);
  }
};

// Update a template
exports.updateTemplate = async (templateId, adminId, updateData) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: templateId, createdBy: adminId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!template) {
      throw new Error("Template not found");
    }
    return template;
  } catch (error) {
    throw new Error(`Error updating template: ${error.message}`);
  }
};

// Delete a template
exports.deleteTemplate = async (templateId, adminId) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: templateId,
      createdBy: adminId,
    });
    if (!template) {
      throw new Error("Template not found");
    }
    return { message: "Template deleted successfully" };
  } catch (error) {
    throw new Error(`Error deleting template: ${error.message}`);
  }
};
