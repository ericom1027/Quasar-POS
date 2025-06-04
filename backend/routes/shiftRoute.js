const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shift");

const auth = require("../middlewares/auth");

router.post("/openShift", auth.verify, shiftController.openShiftController);

router.put("/closeShift", auth.verify, shiftController.closeShiftController);

router.get(
  "/getShifts",
  auth.verify,
  auth.verifyAdmin,
  shiftController.getShifts
);

module.exports = router;
