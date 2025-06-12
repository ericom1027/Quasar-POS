const express = require("express");
const router = express.Router();
const getAttendance = require("../controllers/attendance");
const auth = require("../middlewares/auth");

router.get(
  "/getAttendance",
  auth.verify,
  auth.verifyAdmin,
  getAttendance.getTodayAttendance
);

router.post("/logout", auth.verify, getAttendance.logoutAndSetTimeOut);

router.get(
  "/attendance/all",
  auth.verify,
  auth.verifyAdmin,
  getAttendance.getAllAttendance
);

module.exports = router;
