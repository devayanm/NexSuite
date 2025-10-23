const Group = require("../models/Group");
const User = require("../models/userModel");

// Create a new group
exports.createGroup = async (groupData) => {
  try {
    const group = new Group(groupData);
    await group.save();
    return group;
  } catch (error) {
    throw new Error(`Error creating group: ${error.message}`);
  }
};

// Get all groups for an admin
exports.getGroupsByAdmin = async (adminId) => {
  try {
    const groups = await Group.find({ createdBy: adminId })
      .populate("members", "name username email")
      .sort({ createdAt: -1 });
    return groups;
  } catch (error) {
    throw new Error(`Error fetching groups: ${error.message}`);
  }
};

// Get a single group by ID
exports.getGroupById = async (groupId, adminId) => {
  try {
    const group = await Group.findOne({
      _id: groupId,
      createdBy: adminId,
    }).populate("members", "name username email");
    if (!group) {
      throw new Error("Group not found");
    }
    return group;
  } catch (error) {
    throw new Error(`Error fetching group: ${error.message}`);
  }
};

// Update a group
exports.updateGroup = async (groupId, adminId, updateData) => {
  try {
    const group = await Group.findOneAndUpdate(
      { _id: groupId, createdBy: adminId },
      updateData,
      { new: true, runValidators: true }
    ).populate("members", "name username email");
    if (!group) {
      throw new Error("Group not found");
    }
    return group;
  } catch (error) {
    throw new Error(`Error updating group: ${error.message}`);
  }
};

// Add members to a group
exports.addMembersToGroup = async (groupId, adminId, memberIds) => {
  try {
    const group = await Group.findOne({ _id: groupId, createdBy: adminId });
    if (!group) {
      throw new Error("Group not found");
    }

    // Add only unique members
    const newMembers = memberIds.filter((id) => !group.members.includes(id));
    group.members.push(...newMembers);
    await group.save();

    await group.populate("members", "name username email");
    return group;
  } catch (error) {
    throw new Error(`Error adding members to group: ${error.message}`);
  }
};

// Remove member from a group
exports.removeMemberFromGroup = async (groupId, adminId, memberId) => {
  try {
    const group = await Group.findOne({ _id: groupId, createdBy: adminId });
    if (!group) {
      throw new Error("Group not found");
    }

    group.members = group.members.filter((id) => id.toString() !== memberId);
    await group.save();

    await group.populate("members", "name username email");
    return group;
  } catch (error) {
    throw new Error(`Error removing member from group: ${error.message}`);
  }
};

// Delete a group
exports.deleteGroup = async (groupId, adminId) => {
  try {
    const group = await Group.findOneAndDelete({
      _id: groupId,
      createdBy: adminId,
    });
    if (!group) {
      throw new Error("Group not found");
    }
    return { message: "Group deleted successfully" };
  } catch (error) {
    throw new Error(`Error deleting group: ${error.message}`);
  }
};
