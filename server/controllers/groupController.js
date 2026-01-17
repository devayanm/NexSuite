const EmailGroup = require("../models/EmailGroup");
const Contact = require("../models/Contact");

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, contactIds } = req.body;
    const { adminId } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    const group = new EmailGroup({
      name,
      description,
      contacts: contactIds || [],
      createdBy: adminId,
    });

    await group.save();
    await group.populate("contacts");

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
};

// Get all groups for an admin
exports.getAllGroups = async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    const groups = await EmailGroup.find({ createdBy: adminId })
      .populate("contacts")
      .sort({ createdAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Get a single group by ID
exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;

    const group = await EmailGroup.findOne({
      _id: id,
      createdBy: adminId,
    }).populate("contacts");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ error: "Failed to fetch group" });
  }
};

// Get all emails from a group
exports.getGroupEmails = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;

    const group = await EmailGroup.findOne({
      _id: id,
      createdBy: adminId,
    }).populate("contacts");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Collect all emails from contacts
    const emails = group.contacts.map((contact) => contact.email);

    // Remove duplicates
    const uniqueEmails = [...new Set(emails)];

    res.status(200).json({ emails: uniqueEmails, count: uniqueEmails.length });
  } catch (error) {
    console.error("Error fetching group emails:", error);
    res.status(500).json({ error: "Failed to fetch group emails" });
  }
};

// Update a group
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;
    const { name, description, contactIds } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (contactIds) updateData.contacts = contactIds;

    const group = await EmailGroup.findOneAndUpdate(
      { _id: id, createdBy: adminId },
      updateData,
      { new: true, runValidators: true }
    ).populate("contacts");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json({ message: "Group updated successfully", group });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ error: "Failed to update group" });
  }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;

    const group = await EmailGroup.findOneAndDelete({
      _id: id,
      createdBy: adminId,
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ error: "Failed to delete group" });
  }
};

// Add contacts to group
exports.addToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;
    const { contactIds } = req.body;

    const group = await EmailGroup.findOne({ _id: id, createdBy: adminId });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (contactIds && contactIds.length > 0) {
      contactIds.forEach((contactId) => {
        if (!group.contacts.includes(contactId)) {
          group.contacts.push(contactId);
        }
      });
    }

    await group.save();
    await group.populate("contacts");

    res.status(200).json({ message: "Added to group successfully", group });
  } catch (error) {
    console.error("Error adding to group:", error);
    res.status(500).json({ error: "Failed to add to group" });
  }
};

// Remove contacts from group
exports.removeFromGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;
    const { contactIds } = req.body;

    const group = await EmailGroup.findOne({ _id: id, createdBy: adminId });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (contactIds && contactIds.length > 0) {
      group.contacts = group.contacts.filter(
        (contactId) => !contactIds.includes(contactId.toString())
      );
    }

    await group.save();
    await group.populate("contacts");

    res.status(200).json({ message: "Removed from group successfully", group });
  } catch (error) {
    console.error("Error removing from group:", error);
    res.status(500).json({ error: "Failed to remove from group" });
  }
};
