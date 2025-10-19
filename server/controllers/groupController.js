const groupService = require("../services/groupService");

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { groupName, description, members } = req.body;
    const { adminId } = req.query;

    if (!groupName || !adminId) {
      return res
        .status(400)
        .json({ message: "Group name and adminId are required" });
    }

    const groupData = {
      groupName,
      description: description || "",
      members: members || [],
      createdBy: adminId,
    };

    const group = await groupService.createGroup(groupData);
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating group", error: error.message });
  }
};

// Get all groups for an admin
exports.getAllGroups = async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const groups = await groupService.getGroupsByAdmin(adminId);
    res.status(200).json(groups);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching groups", error: error.message });
  }
};

// Get a single group by ID
exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const group = await groupService.getGroupById(id, adminId);
    res.status(200).json(group);
  } catch (error) {
    res.status(404).json({ message: "Group not found", error: error.message });
  }
};

// Update a group
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;
    const updateData = req.body;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const group = await groupService.updateGroup(id, adminId, updateData);
    res.status(200).json({ message: "Group updated successfully", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating group", error: error.message });
  }
};

// Add members to a group
exports.addMembersToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;
    const { memberIds } = req.body;

    if (!adminId || !memberIds || !Array.isArray(memberIds)) {
      return res
        .status(400)
        .json({ message: "Admin ID and member IDs array are required" });
    }

    const group = await groupService.addMembersToGroup(id, adminId, memberIds);
    res.status(200).json({ message: "Members added successfully", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding members", error: error.message });
  }
};

// Remove member from a group
exports.removeMemberFromGroup = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const group = await groupService.removeMemberFromGroup(
      id,
      adminId,
      memberId
    );
    res.status(200).json({ message: "Member removed successfully", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing member", error: error.message });
  }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const result = await groupService.deleteGroup(id, adminId);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting group", error: error.message });
  }
};
