const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ["Supplies", "Utilities", "Maintenance", "Salary", "Other"],
      default: "Other",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Gcash", "Bank", "Other"],
      default: "Cash",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
