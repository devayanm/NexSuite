const mongoose = require("mongoose");
const schema = mongoose.Schema;

const TemplateSchema = new schema(
  {
    templateName: {
      type: String,
      required: true,
      trim: true,
    },
    filters: [
      {
        type: String,
        trim: true,
      },
    ],
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Template", TemplateSchema);
