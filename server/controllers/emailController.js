const {
  sendImmediateEmail,
  scheduleEmail,
  cancelEmail,
  getEmailById,
  getEmailsByAdminId,
  getAllActiveJobs,
  getAllEmails,
  markEmailAsInactive,
  deleteEmailByIdService,
} = require("../services/emailService");

exports.SendImmediateEmail = async (req, res) => {
  try {
    const { adminId, to, subject, text } = req.body;

    // Log incoming request for debugging
    console.log("SendImmediateEmail called with:", {
      adminId,
      recipientCount: to?.length,
      subject,
      hasText: !!text,
    });

    // Validate required fields
    if (!adminId) {
      return res.status(400).json({ error: "adminId is required" });
    }
    if (!to || to.length === 0) {
      return res.status(400).json({ error: "Recipients (to) are required" });
    }
    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }
    if (!text) {
      return res
        .status(400)
        .json({ error: "Email content (text) is required" });
    }

    const files = req.files || [];

    // Process and save attachments (non-inline files)
    const attachments = files.map((file) => ({
      filename: file.originalname,
      path: file.path,
      contentType: file.mimetype,
    }));

    // Update the HTML content by replacing embedded images with file paths
    let updatedText = text;

    if (files.length > 0) {
      files.forEach((file) => {
        // Replace base64 src or temporary URLs in 'text' with the actual path
        const regex = new RegExp(`src="data:.+?;base64,.+?"`, "g"); // Adjust regex based on how Quill embeds images
        updatedText = updatedText.replace(regex, `src="${file.path}"`);
      });
    }

    const recipientList = Array.isArray(to) ? to.flat() : [to];
    const attachmentList = attachments || [];

    console.log("Sending email to:", recipientList);

    // Send email using the updated HTML content (with file paths)
    const result = await sendImmediateEmail(
      adminId,
      recipientList,
      subject,
      updatedText,
      attachmentList
    );

    return res.status(200).json({ message: "Email sent immediately!", result });
  } catch (error) {
    console.error("❌ SendImmediateEmail Error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ error: error.message });
  }
};

exports.ScheduleEmail = async (req, res) => {
  try {
    const { adminId, to, subject, text, schedule, status } = req.body;
    const files = req.files || [];

    // Process and save attachments (non-inline files)
    const attachments = files.map((file) => ({
      filename: file.originalname,
      path: file.path,
      contentType: file.mimetype,
    }));

    // Update the HTML content by replacing embedded images with file paths
    let updatedText = text;

    if (files.length > 0) {
      files.forEach((file) => {
        // Replace base64 src or temporary URLs in 'text' with the actual path
        const regex = new RegExp(`src="data:.+?;base64,.+?"`, "g"); // Adjust regex based on how Quill embeds images
        updatedText = updatedText.replace(regex, `src="${file.path}"`);
      });
    }
    const recipientList = Array.isArray(to) ? to.flat() : [to];
    const attachmentList = attachments || [];

    const result = await scheduleEmail(
      adminId,
      recipientList,
      subject,
      updatedText,
      schedule,
      status,
      attachmentList
    );
    return res
      .status(200)
      .json({ message: "Email scheduled successfully!", result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.viewEmail = async (req, res) => {
  const { id } = req.params;
  console.log("Controller reaching here");
  try {
    const details = await getEmailById(id);
    res.status(200).json({ details });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.GetEmailsByAdminId = async (req, res) => {
  const { adminId } = req.params;

  try {
    const emails = await getEmailsByAdminId(adminId);
    res.status(200).json({ emails });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.GetAllActiveJobs = async (req, res) => {
  try {
    const jobs = await getAllActiveJobs();
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.viewAllEmails = async (req, res) => {
  try {
    const emails = await getAllEmails();
    return res.status(200).json({ emails });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteEmailById = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteEmailByIdService(id);
    return res.status(200).json({ message: "Email deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.markEmailAsInactive = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await markEmailAsInactive(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
