const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// Load environment variables FIRST before using them
dotenv.config();

const homeRoutes = require("./routes/statRoutes");
const emailRoutes = require("./routes/emailRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const imageRoutes = require("./routes/imageRoutes");
const templateRoutes = require("./routes/templateRoutes");
const groupRoutes = require("./routes/groupRoutes");
const { loadAndScheduleActiveEmails } = require("./services/cronJobScheduler");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();

// Database connection
const DB_URI = process.env.DB_URL || process.env.DB_URI;

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

// Database connection
mongoose
  .connect(DB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Load and schedule active emails after DB connection
loadAndScheduleActiveEmails();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api", imageRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

//temporary port changed from 4040 to 4000
const PORT = process.env.PORT || 4040;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
