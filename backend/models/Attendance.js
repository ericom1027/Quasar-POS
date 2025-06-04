const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timeIn: {
    type: Date,
    required: true,
  },
  timeOut: {
    type: Date,
    default: null,
  },
  date: {
    type: Date,
    required: true,
  },
  totalHours: { type: Number, default: 0 },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
