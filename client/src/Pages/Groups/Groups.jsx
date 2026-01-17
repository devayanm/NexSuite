import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Users, Mail } from "lucide-react";

// Form component moved outside to prevent re-creation on every render
const GroupForm = ({
  formData,
  handleInputChange,
  onSubmit,
  buttonText,
  loading,
  contacts,
  toggleContact,
  rangeStart,
  rangeEnd,
  setRangeStart,
  setRangeEnd,
  applyRangeSelection,
  selectionMode,
  setSelectionMode,
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <Label htmlFor="name">Group Name</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
        placeholder="Marketing Team"
        required
      />
    </div>

    <div>
      <Label htmlFor="description">Description (Optional)</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => handleInputChange("description", e.target.value)}
        placeholder="Group description..."
        rows={3}
      />
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Select Contacts ({formData.contactIds.length} selected)</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={selectionMode === "individual" ? "default" : "outline"}
            onClick={() => setSelectionMode("individual")}
          >
            Individual
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectionMode === "range" ? "default" : "outline"}
            onClick={() => setSelectionMode("range")}
          >
            Range
          </Button>
        </div>
      </div>

      {selectionMode === "range" && contacts.length > 0 && (
        <div className="mb-4 p-4 border rounded-md bg-blue-50">
          <Label className="text-sm font-semibold mb-3 block">
            Select Contact Range (Total: {contacts.length} contacts)
          </Label>

          <div className="space-y-4">
            {/* Range Input Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rangeStart" className="text-xs">
                  From Index
                </Label>
                <Input
                  id="rangeStart"
                  type="number"
                  min="0"
                  max={contacts.length - 1}
                  value={rangeStart}
                  onChange={(e) =>
                    setRangeStart(
                      Math.max(
                        0,
                        Math.min(
                          contacts.length - 1,
                          parseInt(e.target.value) || 0
                        )
                      )
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rangeEnd" className="text-xs">
                  To Index
                </Label>
                <Input
                  id="rangeEnd"
                  type="number"
                  min="0"
                  max={contacts.length - 1}
                  value={rangeEnd}
                  onChange={(e) =>
                    setRangeEnd(
                      Math.max(
                        0,
                        Math.min(
                          contacts.length - 1,
                          parseInt(e.target.value) || 0
                        )
                      )
                    )
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Visual Range Sliders */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16">Start:</span>
                <input
                  type="range"
                  min="0"
                  max={contacts.length - 1}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-semibold w-12 text-right">
                  {rangeStart}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16">End:</span>
                <input
                  type="range"
                  min="0"
                  max={contacts.length - 1}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-semibold w-12 text-right">
                  {rangeEnd}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">
                  {Math.abs(rangeEnd - rangeStart) + 1}
                </span>{" "}
                contacts will be selected
                <span className="text-gray-500 ml-1">
                  (from {Math.min(rangeStart, rangeEnd)} to{" "}
                  {Math.max(rangeStart, rangeEnd)})
                </span>
              </p>
              <Button type="button" size="sm" onClick={applyRangeSelection}>
                Apply Range
              </Button>
            </div>

            {/* Preview selected range */}
            {formData.contactIds.length > 0 && (
              <div className="pt-2 border-t">
                <Label className="text-xs text-gray-600">
                  Preview (first 5):
                </Label>
                <div className="mt-1 text-xs text-gray-700 space-y-1">
                  {contacts
                    .filter((c) => formData.contactIds.includes(c._id))
                    .slice(0, 5)
                    .map((c) => (
                      <div key={c._id}>
                        {c.name} - {c.email}
                      </div>
                    ))}
                  {formData.contactIds.length > 5 && (
                    <div className="text-gray-500">
                      ...and {formData.contactIds.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectionMode === "individual" && (
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-3 bg-white">
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No contacts available. Please create contacts first.
            </p>
          ) : (
            contacts.map((contact, index) => (
              <div
                key={contact._id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  id={`contact-${contact._id}`}
                  checked={formData.contactIds.includes(contact._id)}
                  onChange={() => toggleContact(contact._id)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`contact-${contact._id}`}
                  className="text-sm flex-1 cursor-pointer"
                >
                  <span className="text-gray-400 mr-2">#{index}</span>
                  {contact.name}
                  <span className="text-gray-500 ml-2">({contact.email})</span>
                </label>
              </div>
            ))
          )}
        </div>
      )}
    </div>

    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? "Saving..." : buttonText}
    </Button>
  </form>
);

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState("individual"); // 'individual' or 'range'
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(0);
  const user = useSelector((state) => state.user.user);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchGroups();
    fetchContacts();
  }, [user]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/groups/all?adminId=${user}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/contacts/all?adminId=${user}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
        // Set initial range end to last contact index
        if (data.length > 0) {
          setRangeEnd(data.length - 1);
        }
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/groups/create?adminId=${user}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        await fetchGroups();
        setIsCreateOpen(false);
        setFormData({ name: "", description: "", contactIds: [] });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/groups/${selectedGroup._id}?adminId=${user}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        await fetchGroups();
        setIsEditOpen(false);
        setSelectedGroup(null);
        setFormData({ name: "", description: "", contactIds: [] });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update group");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      alert("Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/groups/${id}?adminId=${user}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await fetchGroups();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete group");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete group");
    }
  };

  const openEditDialog = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      contactIds: group.contacts.map((contact) => contact._id),
    });
    setIsEditOpen(true);
  };

  const toggleContact = (contactId) => {
    setFormData((prev) => ({
      ...prev,
      contactIds: prev.contactIds.includes(contactId)
        ? prev.contactIds.filter((id) => id !== contactId)
        : [...prev.contactIds, contactId],
    }));
  };

  const applyRangeSelection = () => {
    const start = Math.min(rangeStart, rangeEnd);
    const end = Math.max(rangeStart, rangeEnd);
    const selectedContacts = contacts.slice(start, end + 1).map((c) => c._id);
    setFormData((prev) => ({
      ...prev,
      contactIds: selectedContacts,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Groups</h1>
            <p className="text-gray-600 mt-1">
              Organize contacts into groups for bulk emailing
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Group contacts together for easier management
                </DialogDescription>
              </DialogHeader>
              <GroupForm
                formData={formData}
                handleInputChange={handleInputChange}
                onSubmit={handleCreate}
                buttonText="Create Group"
                loading={loading}
                contacts={contacts}
                toggleContact={toggleContact}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                setRangeStart={setRangeStart}
                setRangeEnd={setRangeEnd}
                applyRangeSelection={applyRangeSelection}
                selectionMode={selectionMode}
                setSelectionMode={setSelectionMode}
              />
            </DialogContent>
          </Dialog>
        </div>

        {groups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No groups yet</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Create your first group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card
                key={group._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {group.description && (
                        <CardDescription className="mt-1">
                          {group.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(group)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(group._id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Total Contacts
                      </span>
                      <Badge variant="secondary">
                        {group.contacts?.length || 0}
                      </Badge>
                    </div>
                    {group.contacts && group.contacts.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-2">Contacts:</p>
                        <div className="flex flex-wrap gap-1">
                          {group.contacts.slice(0, 3).map((contact) => (
                            <Badge
                              key={contact._id}
                              variant="outline"
                              className="text-xs"
                            >
                              {contact.name}
                            </Badge>
                          ))}
                          {group.contacts.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{group.contacts.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
              <DialogDescription>Update your group details</DialogDescription>
            </DialogHeader>
            <GroupForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleUpdate}
              buttonText="Update Group"
              loading={loading}
              contacts={contacts}
              toggleContact={toggleContact}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              setRangeStart={setRangeStart}
              setRangeEnd={setRangeEnd}
              applyRangeSelection={applyRangeSelection}
              selectionMode={selectionMode}
              setSelectionMode={setSelectionMode}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Groups;
