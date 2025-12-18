const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const Contact = require("../models/Contact");

// Get all contacts for an admin
router.get("/all", isAuthenticated, async (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    const contacts = await Contact.find({ createdBy: adminId }).sort({
      createdAt: -1,
    });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Create a new contact
router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const { name, email, username } = req.body;
    const { adminId } = req.query;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    // Check if contact with same email already exists
    const existingContact = await Contact.findOne({
      email,
      createdBy: adminId,
    });
    if (existingContact) {
      return res
        .status(400)
        .json({ error: "Contact with this email already exists" });
    }

    const contact = new Contact({
      name,
      email,
      username: username || name,
      createdBy: adminId,
    });

    await contact.save();
    res.status(201).json({ message: "Contact created successfully", contact });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// Bulk delete contacts by range
router.post("/bulk-delete", isAuthenticated, async (req, res) => {
  try {
    const { adminId } = req.query;
    const { startIndex, endIndex } = req.body;

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    if (startIndex === undefined || endIndex === undefined) {
      return res
        .status(400)
        .json({ error: "Start and end index are required" });
    }

    if (startIndex < 0 || endIndex < 0) {
      return res.status(400).json({ error: "Indices must be non-negative" });
    }

    if (startIndex > endIndex) {
      return res
        .status(400)
        .json({ error: "Start index must be less than or equal to end index" });
    }

    // Get all contacts for this admin, sorted by creation date
    const allContacts = await Contact.find({ createdBy: adminId }).sort({
      createdAt: 1,
    });

    if (allContacts.length === 0) {
      return res.status(404).json({ error: "No contacts found" });
    }

    if (startIndex >= allContacts.length) {
      return res.status(400).json({
        error: `Start index ${startIndex} is out of range. Total contacts: ${allContacts.length}`,
      });
    }

    // Calculate actual range
    const actualEndIndex = Math.min(endIndex, allContacts.length - 1);
    const contactsToDelete = allContacts.slice(startIndex, actualEndIndex + 1);
    const idsToDelete = contactsToDelete.map((c) => c._id);

    // Delete the contacts
    const deleteResult = await Contact.deleteMany({
      _id: { $in: idsToDelete },
      createdBy: adminId,
    });

    res.status(200).json({
      message: "Bulk delete completed",
      deleted: deleteResult.deletedCount,
      range: { start: startIndex, end: actualEndIndex },
      totalContactsBefore: allContacts.length,
      totalContactsAfter: allContacts.length - deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    res
      .status(500)
      .json({ error: "Failed to process bulk delete", details: error.message });
  }
});

// Update a contact
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username } = req.body;
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    const contact = await Contact.findOne({ _id: id, createdBy: adminId });
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    if (name) contact.name = name;
    if (email) contact.email = email;
    if (username) contact.username = username;

    await contact.save();
    res.status(200).json({ message: "Contact updated successfully", contact });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// Delete a contact
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    const contact = await Contact.findOneAndDelete({
      _id: id,
      createdBy: adminId,
    });
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

module.exports = router;
