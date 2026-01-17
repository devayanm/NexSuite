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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Form component moved outside to prevent re-creation on every render
const TemplateForm = ({ formData, handleInputChange, onSubmit, buttonText, loading }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <Label htmlFor="title">Template Title</Label>
      <Input
        id="title"
        value={formData.title}
        onChange={(e) => handleInputChange("title", e.target.value)}
        placeholder="My Template"
        required
      />
    </div>

    <div>
      <Label htmlFor="category">Category</Label>
      <Select
        value={formData.category}
        onValueChange={(value) => handleInputChange("category", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="greeting">Greeting Card</SelectItem>
          <SelectItem value="announcement">Announcement</SelectItem>
          <SelectItem value="newsletter">Newsletter</SelectItem>
          <SelectItem value="promotional">Promotional</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label htmlFor="subject">Email Subject</Label>
      <Input
        id="subject"
        value={formData.subject}
        onChange={(e) => handleInputChange("subject", e.target.value)}
        placeholder="Subject line"
        required
      />
    </div>

    <div>
      <Label htmlFor="body">Email Body</Label>
      <ReactQuill
        value={formData.body}
        onChange={(content) => handleInputChange("body", content)}
        placeholder="Email content..."
        className="bg-white"
        theme="snow"
      />
    </div>

    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? "Saving..." : buttonText}
    </Button>
  </form>
);

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    body: "",
    category: "custom",
  });
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.user);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/templates/all?adminId=${user}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/templates/create?adminId=${user}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        await fetchTemplates();
        setIsCreateOpen(false);
        setFormData({ title: "", subject: "", body: "", category: "custom" });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/templates/${selectedTemplate._id}?adminId=${user}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        await fetchTemplates();
        setIsEditOpen(false);
        setSelectedTemplate(null);
        setFormData({ title: "", subject: "", body: "", category: "custom" });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update template");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      alert("Failed to update template");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/templates/${id}?adminId=${user}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await fetchTemplates();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    }
  };

  const openEditDialog = (template) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      subject: template.subject,
      body: template.body,
      category: template.category,
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (template) => {
    setSelectedTemplate(template);
    setIsViewOpen(true);
  };

  const categoryColors = {
    greeting: "bg-green-100 text-green-800",
    announcement: "bg-blue-100 text-blue-800",
    newsletter: "bg-purple-100 text-purple-800",
    promotional: "bg-orange-100 text-orange-800",
    custom: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Email Templates
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage your email templates
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a reusable email template for your campaigns
                </DialogDescription>
              </DialogHeader>
              <TemplateForm
                formData={formData}
                handleInputChange={handleInputChange}
                onSubmit={handleCreate}
                buttonText="Create Template"
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">No templates yet</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Create your first template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Templates</CardTitle>
              <CardDescription>
                Manage and organize your email templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template._id}>
                      <TableCell className="font-medium">
                        {template.title}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {template.subject}
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryColors[template.category]}>
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openViewDialog(template)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(template)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(template._id)}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>Update your email template</DialogDescription>
            </DialogHeader>
            <TemplateForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleUpdate}
              buttonText="Update Template"
              loading={loading}
            />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.title}</DialogTitle>
              <DialogDescription>
                <Badge className={categoryColors[selectedTemplate?.category]}>
                  {selectedTemplate?.category}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <p className="text-sm text-gray-700 mt-1">
                  {selectedTemplate?.subject}
                </p>
              </div>
              <div>
                <Label>Body</Label>
                <div
                  className="mt-1 p-4 bg-gray-50 rounded-md border"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate?.body }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Templates;
