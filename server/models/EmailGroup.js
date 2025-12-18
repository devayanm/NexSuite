const mongoose = require("mongoose");

const emailGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
      },
    ],
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

// Virtual to get total recipient count
emailGroupSchema.virtual("totalRecipients").get(function () {
  return this.contacts.length;
});

// Ensure virtuals are included in JSON
emailGroupSchema.set("toJSON", { virtuals: true });
emailGroupSchema.set("toObject", { virtuals: true });

const EmailGroup = mongoose.model("EmailGroup", emailGroupSchema);

module.exports = EmailGroup;
