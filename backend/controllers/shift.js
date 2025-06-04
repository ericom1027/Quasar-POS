const Shift = require("../models/Shift");
const Bills = require("../models/Bills");

exports.openShiftController = async (req, res) => {
  try {
    const cashierName = `${req.user.firstname} ${req.user.lastname}`;
    const { startingCash } = req.body;

    if (typeof startingCash !== "number" || startingCash < 0) {
      return res.status(400).json({ error: "Invalid startingCash value." });
    }

    const existingOpenShift = await Shift.findOne({
      cashierName,
      isClosed: false,
    });

    if (existingOpenShift) {
      return res.status(200).json({
        message: "Existing open shift found.",
        shift: existingOpenShift,
      });
    }

    const newShift = new Shift({
      cashierName,
      startingCash,
      startTime: new Date(),
      isClosed: false,
    });

    const savedShift = await newShift.save();

    res.status(201).json({
      message: "New shift opened successfully.",
      shift: savedShift,
    });
  } catch (error) {
    console.error("Error opening shift:", error);
    res.status(500).json({ error: "Failed to open shift." });
  }
};

// CLOSE SHIFT
exports.closeShiftController = async (req, res) => {
  try {
    const cashierName = `${req.user.firstname} ${req.user.lastname}`;

    const shift = await Shift.findOne({
      cashierName,
      isClosed: false,
    });

    if (!shift) {
      return res.status(400).json({ error: "No open shift found." });
    }

    const { startingCash } = shift;

    const billsDuringShift = await Bills.find({
      shiftId: shift._id,
      voided: { $ne: true },
    });

    const totalSales = billsDuringShift.reduce(
      (acc, bill) => acc + bill.totalAmount,
      0
    );

    const expectedCash = startingCash + totalSales;
    const { endingCash } = req.body;
    const cashDifference = endingCash - expectedCash;

    shift.endingCash = endingCash;
    shift.totalSales = totalSales;
    shift.expectedCash = expectedCash;
    shift.cashDifference = cashDifference;
    shift.endTime = new Date();
    shift.isClosed = true;

    await shift.save();

    res.status(200).json({
      message: "Shift closed successfully",
      startingCash,
      endingCash,
      totalSales,
      expectedCash,
      cashDifference,
    });
  } catch (error) {
    console.error("Error closing shift:", error);
    res.status(500).json({ error: "Failed to close shift" });
  }
};

// Get all shifts
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ startTime: -1 });

    if (!shifts || shifts.length === 0) {
      return res.status(404).json({ error: "No shifts found" });
    }

    res.status(200).json(shifts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
