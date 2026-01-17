import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import SchedulingOptions from "../../Components/SchedulingOptions";
import RecipientsSelector from "../../Components/RecipientsSelector";
import { generateCronExpression } from "../../utils/cronUtils";
import FroalaEditor from "react-froala-wysiwyg";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/js/plugins.pkgd.min";

const SendEmailImproved = () => {
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState("no");
  const [repeatOption, setRepeatOption] = useState("none");
  const [isScheduled, setIsScheduled] = useState(false);
  const [customFrequency, setCustomFrequency] = useState(1);
  const [customUnit, setCustomUnit] = useState("days");
  const [customDaysOfWeek, setCustomDaysOfWeek] = useState([]);
  const [customDayOfMonth, setCustomDayOfMonth] = useState(1);
  const [emailContent, setEmailContent] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const now = new Date();
    const defaultDate = now.toISOString().split("T")[0];
    const defaultTime = new Date(now.getTime() + 2 * 60000)
      .toTimeString()
      .slice(0, 5);

    setDate(defaultDate);
    setTime(defaultTime);

    if (state) {
      setRecipients(state.recipients || []);
      setSubject(state.subject || "");
    }

    // Fetch templates and groups
    fetchTemplates();
    fetchGroups();
  }, [state, user]);

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

  const handleTemplateSelect = async (templateId) => {
    setSelectedTemplate(templateId);
    if (!templateId) {
      setSubject("");
      setEmailContent("");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/templates/${templateId}?adminId=${user}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const template = await response.json();
        setSubject(template.subject);
        setEmailContent(template.body);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  };

  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId);
    if (!groupId) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/groups/${groupId}/emails?adminId=${user}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Add group emails to recipients
        setRecipients((prev) => [...new Set([...prev, ...data.emails])]);
      }
    } catch (error) {
      console.error("Error fetching group emails:", error);
    }
  };

  const froalaEditorConfig = {
    attribution: false,
    height: 300,
    quickInsertEnabled: false,
    placeholderText: "Your content goes here!",
    toolbarButtons: {
      moreText: {
        buttons: [
          "paragraphFormat",
          "|",
          "fontSize",
          "textColor",
          "backgroundColor",
          "insertImage",
          "alignLeft",
          "alignRight",
          "alignJustify",
          "formatOL",
          "formatUL",
        ],
      },
      moreRich: {
        buttons: [
          "|",
          "bold",
          "italic",
          "underline",
          "insertLink",
          "insertTable",
        ],
      },
      moreMisc: {
        buttons: ["|", "undo", "redo"],
        align: "right",
      },
    },
    events: {
      "image.beforeUpload": function (files) {
        const editor = this;
        if (files.length) {
          const formData = new FormData();
          formData.append("file", files[0]);

          fetch(`${apiUrl}/api/upload-image`, {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              editor.image.insert(data.url, null, null, editor.image.get());
            })
            .catch((error) => {
              console.error("Image upload failed:", error);
            });

          return false;
        }
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedDate = date || new Date().toISOString().split("T")[0];
      const selectedTime =
        time || new Date(Date.now() + 2 * 60000).toTimeString().slice(0, 5);

      const formData = new FormData();
      formData.append("to", JSON.stringify(recipients));
      formData.append("subject", subject);
      formData.append("text", emailContent);

      let endpoint = `${apiUrl}/api/emails/send-immediate`;

      if (isScheduled) {
        const scheduleDateTime = new Date(`${selectedDate}T${selectedTime}`);
        const cronExpression = generateCronExpression(
          scheduleDateTime,
          repeat,
          repeatOption,
          customFrequency,
          customUnit,
          customDaysOfWeek,
          customDayOfMonth
        );

        formData.append("schedule", cronExpression);
        endpoint = `${apiUrl}/api/emails/schedule`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        alert(
          isScheduled
            ? "Email scheduled successfully!"
            : "Email sent successfully!"
        );
        navigate("/viewEmails");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Send Email</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Template Selection */}
              <div>
                <Label>Select Template (Optional)</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Template</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group Selection */}
              <div>
                <Label>Add Group Recipients (Optional)</Label>
                <Select value={selectedGroup} onValueChange={handleGroupSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Group</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipients */}
              <div>
                <Label>Recipients</Label>
                <RecipientsSelector
                  selectedRecipients={recipients}
                  setSelectedRecipients={setRecipients}
                />
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  required
                />
              </div>

              {/* Email Body */}
              <div>
                <Label>Email Content</Label>
                <FroalaEditor
                  model={emailContent}
                  onModelChange={setEmailContent}
                  config={froalaEditorConfig}
                />
              </div>

              {/* Scheduling Options */}
              <div>
                <Label className="mb-2 block">Scheduling</Label>
                <SchedulingOptions
                  date={date}
                  setDate={setDate}
                  time={time}
                  setTime={setTime}
                  repeat={repeat}
                  setRepeat={setRepeat}
                  repeatOption={repeatOption}
                  setRepeatOption={setRepeatOption}
                  isScheduled={isScheduled}
                  setIsScheduled={setIsScheduled}
                  customFrequency={customFrequency}
                  setCustomFrequency={setCustomFrequency}
                  customUnit={customUnit}
                  setCustomUnit={setCustomUnit}
                  customDaysOfWeek={customDaysOfWeek}
                  setCustomDaysOfWeek={setCustomDaysOfWeek}
                  customDayOfMonth={customDayOfMonth}
                  setCustomDayOfMonth={setCustomDayOfMonth}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                <Send className="w-4 h-4 mr-2" />
                {loading
                  ? "Sending..."
                  : isScheduled
                  ? "Schedule Email"
                  : "Send Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SendEmailImproved;
