const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String },
    email: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: email must be unique per admin
contactSchema.index({ email: 1, createdBy: 1 }, { unique: true });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
