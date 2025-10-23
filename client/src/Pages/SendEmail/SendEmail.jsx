import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SchedulingOptions from "../../Components/SchedulingOptions";
import RecipientsSelector from "../../Components/RecipientsSelector";
import { generateCronExpression } from "../../utils/cronUtils";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./SendEmail.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SendEmail = () => {
  const quillRef = useRef(null);
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
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const { user } = useSelector((state) => state.user);
  const adminId = user;

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

    // Fetch templates, groups, and users
    fetchTemplates();
    fetchGroups();
    fetchAllUsers();
  }, [state, user]);

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
    }
  };

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
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/users/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (templateId) {
      const template = templates.find((t) => t._id === templateId);
      if (template) {
        setSubject(template.subject);
        setEmailContent(template.body);
        toast.success("Template loaded successfully");
      }
    } else {
      // Clear if no template selected
      setSubject("");
      setEmailContent("");
    }
  };

  const handleSendToGroup = (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    if (group) {
      const groupEmails = group.members.map((member) => ({
        value: member.email,
        label: `${member.name} (${member.email})`,
      }));
      setRecipients(groupEmails);
      toast.success(
        `Selected ${group.members.length} recipients from ${group.groupName}`
      );
    }
  };

  const handleSendToAll = () => {
    const allEmails = allUsers.map((user) => ({
      value: user.email,
      label: `${user.name} (${user.email})`,
    }));
    setRecipients(allEmails);
    toast.success(`Selected all ${allUsers.length} users`);
  };

  // ReactQuill modules configuration
  const quillModules = {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedDate = date || new Date().toISOString().split("T")[0];
      const selectedTime =
        time || new Date(Date.now() + 2 * 60000).toTimeString().slice(0, 5);

      const cronExpression = generateCronExpression({
        customUnit,
        customFrequency,
        customDaysOfWeek,
        customDayOfMonth,
        repeatOption,
        date: selectedDate,
        time: selectedTime,
      });

      let status = "";

      if (isScheduled) {
        status = repeatOption === "repeat" ? "repeat" : "scheduled";
      }

      const emailData = {
        adminId,
        to: recipients.map((recipient) => recipient.value),
        subject,
        text: emailContent,
        schedule: isScheduled ? cronExpression : null,
        status: status,
      };

      const endpoint = isScheduled
        ? "/emails/schedule"
        : "/emails/send-immediate";
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        toast.success("Email submitted successfully");
        // Reset form
        setRecipients([]);
        setSubject("");
        setEmailContent("");
        setSelectedTemplate("");
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An error occurred");
    }
  };

  const navigate = useNavigate();
  const goback = () => {
    console.log("button clicking");
    navigate(-1);
  };

  // return (
  //   <div className="min-h-screen bg-container">
  //     <div className={Style.back}>
  //       <FontAwesomeIcon icon={faArrowLeft} />
  //       <h4>Back</h4>
  //     </div>
  //     <div className="container mx-auto md:p-4 w-full md:w-[70vw]">
  //       <form
  //         onSubmit={handleSubmit}
  //         className="bg-form shadow-form rounded-form p-form space-y-2 text-sm"
  //       >
  //         <RecipientsSelector
  //           recipients={recipients}
  //           setRecipients={setRecipients}
  //         />
  //         <div className="space-y-2">
  //           <label className="block text-large font-medium text-gradient">
  //             Subject:
  //           </label>
  //           <input
  //             type="text"
  //             value={subject}
  //             onChange={(e) => setSubject(e.target.value)}
  //             className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
  //             placeholder="Enter email subject"
  //             required
  //           />
  //         </div>

  //         {/* Froala Email Content Editor */}
  //         <div className="space-y-2">
  //           <label className="block text-large font-medium text-gradient">
  //             Email Content:
  //           </label>
  //           <FroalaEditor config={froalaEditorConfig} />
  //         </div>

  //         <SchedulingOptions
  //           isScheduled={isScheduled}
  //           setIsScheduled={setIsScheduled}
  //           repeat={repeat}
  //           setRepeat={setRepeat}
  //           repeatOption={repeatOption}
  //           setRepeatOption={setRepeatOption}
  //           customFrequency={customFrequency}
  //           setCustomFrequency={setCustomFrequency}
  //           customUnit={customUnit}
  //           setCustomUnit={setCustomUnit}
  //           customDaysOfWeek={customDaysOfWeek}
  //           setCustomDaysOfWeek={setCustomDaysOfWeek}
  //           customDayOfMonth={customDayOfMonth}
  //           setCustomDayOfMonth={setCustomDayOfMonth}
  //           date={date}
  //           setDate={setDate}
  //           time={time}
  //           setTime={setTime}
  //         />

  //         <div className="flex space-x-4">
  //           <button
  //             type="submit"
  //             className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:outline-none"
  //           >
  //             Send Email
  //           </button>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );

  return (
    <div className={styles.minHScreen}>
      <div onClick={goback} className={styles.backBttn}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <button>Back</button>
      </div>

      <div className={`${styles.container} ${styles.containerMd}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Template Selector */}
          <div className={styles.spaceY2}>
            <label className={styles.label}>Use Template (Optional):</label>
            <select
              value={selectedTemplate}
              onChange={handleTemplateSelect}
              className={styles.input}
            >
              <option value="">-- Select a template --</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.templateName}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions for Groups */}
          <div className={styles.spaceY2}>
            <label className={styles.label}>Quick Select Recipients:</label>
            <div className={styles.quickActions}>
              <button
                type="button"
                onClick={handleSendToAll}
                className={styles.quickBtn}
              >
                All Users ({allUsers.length})
              </button>
              {groups.map((group) => (
                <button
                  key={group._id}
                  type="button"
                  onClick={() => handleSendToGroup(group._id)}
                  className={styles.quickBtn}
                >
                  {group.groupName} ({group.members.length})
                </button>
              ))}
            </div>
          </div>

          <RecipientsSelector
            recipients={recipients}
            setRecipients={setRecipients}
          />

          <div className={styles.spaceY2}>
            <label className={styles.label}>Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.input}
              placeholder="Enter email subject"
              required
            />
          </div>

          {/* ReactQuill Email Content Editor */}
          <div className={styles.spaceY2}>
            <label className={styles.label}>Email Content:</label>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={emailContent}
              onChange={setEmailContent}
              modules={quillModules}
              className={styles.quillEditor}
            />
          </div>

          <SchedulingOptions
            isScheduled={isScheduled}
            setIsScheduled={setIsScheduled}
            repeat={repeat}
            setRepeat={setRepeat}
            repeatOption={repeatOption}
            setRepeatOption={setRepeatOption}
            customFrequency={customFrequency}
            setCustomFrequency={setCustomFrequency}
            customUnit={customUnit}
            setCustomUnit={setCustomUnit}
            customDaysOfWeek={customDaysOfWeek}
            setCustomDaysOfWeek={setCustomDaysOfWeek}
            customDayOfMonth={customDayOfMonth}
            setCustomDayOfMonth={setCustomDayOfMonth}
            date={date}
            setDate={setDate}
            time={time}
            setTime={setTime}
          />

          <div className={styles.spaceX4}>
            <button type="submit" className={styles.button}>
              Send Email{" "}
              <FontAwesomeIcon
                icon={faPaperPlane}
                style={{ color: "#ffffff" }}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmail;
