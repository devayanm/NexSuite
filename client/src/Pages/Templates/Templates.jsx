import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./Templates.module.css";
import { toast } from "sonner";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [filters, setFilters] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Quill editor modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${apiUrl}/templates/all?adminId=${user}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    }
  };

  const handleAddFilter = () => {
    if (currentFilter.trim() && !filters.includes(currentFilter.trim())) {
      setFilters([...filters, currentFilter.trim()]);
      setCurrentFilter("");
    }
  };

  const handleRemoveFilter = (filterToRemove) => {
    setFilters(filters.filter((f) => f !== filterToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const templateData = {
      templateName,
      filters,
      subject,
      body,
    };

    try {
      const url = editingTemplate
        ? `${apiUrl}/templates/${editingTemplate._id}?adminId=${user}`
        : `${apiUrl}/templates/create?adminId=${user}`;

      const method = editingTemplate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        toast.success(
          editingTemplate
            ? "Template updated successfully"
            : "Template created successfully"
        );
        resetForm();
        setShowModal(false);
        fetchTemplates();
      } else {
        toast.error("Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setTemplateName(template.templateName);
    setFilters(template.filters || []);
    setSubject(template.subject);
    setBody(template.body);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/templates/${id}?adminId=${user}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Template deleted successfully");
        fetchTemplates();
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("An error occurred");
    }
  };

  const resetForm = () => {
    setTemplateName("");
    setFilters([]);
    setCurrentFilter("");
    setSubject("");
    setBody("");
    setEditingTemplate(null);
  };

  const goBack = () => navigate(-1);

  return (
    <div className={styles.container}>
      <div onClick={goBack} className={styles.back}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <button>Back</button>
      </div>

      <div className={styles.heading}>
        <h3 className={styles.interhead}>Email Templates</h3>
        <div
          className={styles.addButton}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          <button>Create Template</button>
        </div>
      </div>

      <div className={styles.templateGrid}>
        {templates.map((template) => (
          <div key={template._id} className={styles.templateCard}>
            <h4>{template.templateName}</h4>
            <div className={styles.filters}>
              {template.filters?.map((filter, idx) => (
                <span key={idx} className={styles.filterBadge}>
                  {filter}
                </span>
              ))}
            </div>
            <p className={styles.subject}>
              <strong>Subject:</strong> {template.subject}
            </p>
            <div className={styles.actions}>
              <button
                onClick={() => handleEdit(template)}
                className={styles.editBtn}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(template._id)}
                className={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingTemplate ? "Edit Template" : "Create New Template"}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Template Name *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Welcome Email, Login Notification"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Filters (Tags)</label>
                <div className={styles.filterInput}>
                  <input
                    type="text"
                    value={currentFilter}
                    onChange={(e) => setCurrentFilter(e.target.value)}
                    placeholder="e.g., occasion, login, wish"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFilter();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFilter}
                    className={styles.addFilterBtn}
                  >
                    Add
                  </button>
                </div>
                <div className={styles.filtersList}>
                  {filters.map((filter, idx) => (
                    <span key={idx} className={styles.filterTag}>
                      {filter}
                      <button
                        type="button"
                        onClick={() => handleRemoveFilter(filter)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email Body *</label>
                <ReactQuill
                  theme="snow"
                  value={body}
                  onChange={setBody}
                  modules={modules}
                  className={styles.quillEditor}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>
                  Save Template
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

export default Templates;
