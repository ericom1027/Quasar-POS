const Attendance = require("../models/Attendance");
const User = require("../models/User");
const moment = require("moment");

function computeTotalHours(attendance) {
  if (!attendance.timeIn || !attendance.timeOut) {
    return 0;
  }
  const timeIn = moment(attendance.timeIn);
  const timeOut = moment(attendance.timeOut);
  const duration = moment.duration(timeOut.diff(timeIn));
  return duration.asHours();
}

exports.getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().format("YYYY-MM-DD");

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.isAdmin) {
      return res.status(403).json({
        message: "Admins are not allowed to access attendance records.",
      });
    }

    let attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance) {
      attendance = await Attendance.create({
        user: userId,
        timeIn: new Date(),
        date: today,
      });
    }

    const totalHours = attendance.timeOut ? computeTotalHours(attendance) : 0;

    res.status(200).json({ attendance, totalHours });
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logoutAndSetTimeOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().format("YYYY-MM-DD");

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.isAdmin) {
      return res.status(403).json({
        message: "Admins are not allowed to access attendance records.",
      });
    }

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (attendance && !attendance.timeOut) {
      attendance.timeOut = new Date();
      attendance.totalHours = computeTotalHours(attendance);
      await attendance.save();
    }

    const totalHours = attendance.timeOut ? computeTotalHours(attendance) : 0;

    res.status(200).json({
      message: "Cashier logged out and time out recorded.",
      attendance,
      totalHours,
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!user.isAdmin) {
      return res.status(403).json({
        message: "Only admins can access all attendance records.",
      });
    }

    const attendances = await Attendance.find()
      .populate("user", "firstname lastname email")
      .sort({ date: -1 });

    const attendancesWithHours = attendances.map((att) => {
      const totalHours = att.timeOut ? computeTotalHours(att) : 0;
      return {
        ...att.toObject(),
        totalHours,
      };
    });

    res.status(200).json({ attendances: attendancesWithHours });
  } catch (error) {
    console.error("Error fetching all attendance records:", error);
    res.status(500).json({ message: "Server error" });
  }
};
