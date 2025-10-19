const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const homeRoutes = require("./routes/statRoutes");
const emailRoutes = require("./routes/emailRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const contactListRoutes = require("./routes/contactListRoutes");
const imageRoutes = require("./routes/imageRoutes");
const templateRoutes = require("./routes/templateRoutes");
const groupRoutes = require("./routes/groupRoutes");
const { loadAndScheduleActiveEmails } = require("./services/cronJobScheduler");
const fileUpload = require("express-fileupload");
const cors = require("cors");

require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser(process.env.SECRET));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.SITE_URL,
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));
app.use(fileUpload());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    // Schedule emails only after DB connection
    loadAndScheduleActiveEmails();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact-lists", contactListRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api", imageRoutes);

// Server
const PORT = process.env.PORT || 4040;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
