import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { MdAutoDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import styles from "./Groups.module.css";
import { toast } from "sonner";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, [user]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${apiUrl}/groups/all?adminId=${user}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/users/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const groupData = {
      groupName,
      description,
      members: selectedMembers,
    };

    try {
      const url = editingGroup
        ? `${apiUrl}/groups/${editingGroup._id}?adminId=${user}`
        : `${apiUrl}/groups/create?adminId=${user}`;

      const method = editingGroup ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(groupData),
      });

      if (response.ok) {
        toast.success(
          editingGroup
            ? "Group updated successfully"
            : "Group created successfully"
        );
        resetForm();
        setShowModal(false);
        fetchGroups();
      } else {
        toast.error("Failed to save group");
      }
    } catch (error) {
      console.error("Error saving group:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setGroupName(group.groupName);
    setDescription(group.description || "");
    setSelectedMembers(group.members.map((m) => m._id));
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/groups/${id}?adminId=${user}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Group deleted successfully");
        fetchGroups();
      } else {
        toast.error("Failed to delete group");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("An error occurred");
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const resetForm = () => {
    setGroupName("");
    setDescription("");
    setSelectedMembers([]);
    setEditingGroup(null);
  };

  const goBack = () => navigate(-1);

  return (
    <div className={styles.container}>
      <div onClick={goBack} className={styles.back}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <button>Back</button>
      </div>

      <div className={styles.heading}>
        <h3 className={styles.interhead}>User Groups</h3>
        <div
          className={styles.addButton}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          <button>Create Group</button>
        </div>
      </div>

      <div className={styles.maintable}>
        <div className={styles.headtable}>
          <div>
            <h3>Group Name</h3>
          </div>
          <div>
            <h3>Description</h3>
          </div>
          <div>
            <h3>Members</h3>
          </div>
          <div>
            <h3>Created</h3>
          </div>
          <div>
            <h3>Action</h3>
          </div>
        </div>
        <div className={styles.tablebody}>
          {groups.map((group) => {
            const date = new Date(group.createdAt).toLocaleDateString();
            return (
              <div key={group._id} className={styles.tablerow}>
                <div>
                  <h3 className={styles.text}>{group.groupName}</h3>
                </div>
                <div>
                  <h3 className={styles.text}>
                    {group.description || "No description"}
                  </h3>
                </div>
                <div>
                  <h3 className={styles.text}>{group.members.length}</h3>
                </div>
                <div>
                  <h3 className={styles.text}>{date}</h3>
                </div>
                <div className={styles.actionBtn}>
                  <h3 className={styles.text} onClick={() => handleEdit(group)}>
                    <FaEdit size={25} />
                  </h3>
                  <h3
                    className={styles.text}
                    onClick={() => handleDelete(group._id)}
                  >
                    <MdAutoDelete size={27} />
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingGroup ? "Edit Group" : "Create New Group"}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Group Name *</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Premium Users, New Signups"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this group..."
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Select Members</label>
                <div className={styles.membersList}>
                  {users.map((member) => (
                    <div key={member._id} className={styles.memberItem}>
                      <input
                        type="checkbox"
                        id={member._id}
                        checked={selectedMembers.includes(member._id)}
                        onChange={() => toggleMemberSelection(member._id)}
                      />
                      <label htmlFor={member._id}>
                        {member.name} ({member.email})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>
                  Save Group
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
