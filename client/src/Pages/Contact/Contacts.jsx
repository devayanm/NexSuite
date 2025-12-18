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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Mail, User } from "lucide-react";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [deleteRange, setDeleteRange] = useState({ start: 0, end: 0 });
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.user);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchContacts();
  }, [user]);

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
        `${apiUrl}/api/contacts/create?adminId=${user}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        await fetchContacts();
        setIsCreateOpen(false);
        setFormData({ name: "", email: "", username: "" });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create contact");
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      alert("Failed to create contact");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/contacts/${selectedContact._id}?adminId=${user}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        await fetchContacts();
        setIsEditOpen(false);
        setSelectedContact(null);
        setFormData({ name: "", email: "", username: "" });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update contact");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      alert("Failed to update contact");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/contacts/${id}?adminId=${user}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await fetchContacts();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete contact");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Failed to delete contact");
    }
  };

  const openEditDialog = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      username: contact.username || "",
    });
    setIsEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-1">Manage your contact database</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to your database
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="johndoe"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Contact"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            onClick={() => setIsBulkDeleteOpen(true)}
            className="ml-3 border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Bulk Delete
          </Button>
        </div>

        {contacts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No contacts yet</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Create your first contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Contacts</CardTitle>
              <CardDescription>
                {contacts.length} contact{contacts.length !== 1 ? "s" : ""} in
                total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell className="font-medium">
                        {contact.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {contact.email}
                        </div>
                      </TableCell>
                      <TableCell>{contact.username || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(contact)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(contact._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>Update contact information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-username">Username (Optional)</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="johndoe"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Contact"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Modal */}
        {isBulkDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-md p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600">
                Bulk Delete Contacts
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Delete contacts by index range. Total contacts:{" "}
                <span className="font-semibold">{contacts.length}</span>
              </p>

              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deleteStart" className="text-xs">
                      From Index
                    </Label>
                    <Input
                      id="deleteStart"
                      type="number"
                      min="0"
                      max={contacts.length - 1}
                      value={deleteRange.start}
                      onChange={(e) =>
                        setDeleteRange({
                          ...deleteRange,
                          start: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deleteEnd" className="text-xs">
                      To Index
                    </Label>
                    <Input
                      id="deleteEnd"
                      type="number"
                      min="0"
                      max={contacts.length - 1}
                      value={deleteRange.end}
                      onChange={(e) =>
                        setDeleteRange({
                          ...deleteRange,
                          end: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">⚠️ Warning:</span> This will
                    delete{" "}
                    <span className="font-bold">
                      {Math.abs(deleteRange.end - deleteRange.start) + 1}
                    </span>{" "}
                    contacts (from index{" "}
                    {Math.min(deleteRange.start, deleteRange.end)} to{" "}
                    {Math.max(deleteRange.start, deleteRange.end)})
                  </p>
                </div>

                {/* Preview */}
                {contacts.length > 0 && (
                  <div className="border rounded p-3 bg-gray-50">
                    <Label className="text-xs text-gray-600">
                      Preview (first 3):
                    </Label>
                    <div className="mt-2 text-xs space-y-1">
                      {contacts
                        .slice(
                          Math.min(deleteRange.start, deleteRange.end),
                          Math.max(deleteRange.start, deleteRange.end) + 1
                        )
                        .slice(0, 3)
                        .map((c, idx) => (
                          <div key={c._id} className="text-gray-700">
                            #
                            {Math.min(deleteRange.start, deleteRange.end) + idx}
                            : {c.name} - {c.email}
                          </div>
                        ))}
                      {Math.abs(deleteRange.end - deleteRange.start) > 2 && (
                        <div className="text-gray-500">
                          ...and{" "}
                          {Math.abs(deleteRange.end - deleteRange.start) - 2}{" "}
                          more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsBulkDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (
                      !confirm(
                        `Are you sure you want to delete ${
                          Math.abs(deleteRange.end - deleteRange.start) + 1
                        } contacts? This cannot be undone.`
                      )
                    ) {
                      return;
                    }

                    try {
                      const res = await fetch(
                        `${apiUrl}/api/contacts/bulk-delete?adminId=${user}`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({
                            startIndex: Math.min(
                              deleteRange.start,
                              deleteRange.end
                            ),
                            endIndex: Math.max(
                              deleteRange.start,
                              deleteRange.end
                            ),
                          }),
                        }
                      );
                      const data = await res.json();
                      if (res.ok) {
                        alert(`Successfully deleted ${data.deleted} contacts`);
                        await fetchContacts();
                        setIsBulkDeleteOpen(false);
                        setDeleteRange({ start: 0, end: 0 });
                      } else {
                        alert(data.error || "Bulk delete failed");
                      }
                    } catch (err) {
                      console.error("Bulk delete error", err);
                      alert("Bulk delete failed");
                    }
                  }}
                >
                  Delete {Math.abs(deleteRange.end - deleteRange.start) + 1}{" "}
                  Contacts
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
