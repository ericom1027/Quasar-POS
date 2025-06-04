const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    cashierName: { type: String, required: true },
    startingCash: { type: Number, required: true },
    endingCash: { type: Number },
    totalSales: { type: Number },
    expectedCash: { type: Number },
    cashDifference: { type: Number },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);
