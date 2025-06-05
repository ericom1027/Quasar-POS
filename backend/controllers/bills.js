const Bills = require("../models/Bills");
const Counter = require("../models/Counter");
const moment = require("moment-timezone");
const Shift = require("../models/Shift");
const User = require("../models/User");
const Expense = require("../models/Expenses");
const _ = require("lodash");

async function getNextInvoiceNumber() {
  const counter = await Counter.findOneAndUpdate(
    { id: "invoiceNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `RCPT-${counter.seq.toString().padStart(5, "0")}`;
}

exports.addBillsController = async (req, res) => {
  try {
    const invoiceNumber = await getNextInvoiceNumber();
    const currentShift = await Shift.findOne({
      cashierName: `${req.user.firstname} ${req.user.lastname}`,
      isClosed: false,
    });

    if (!currentShift) {
      return res.status(400).json({ error: "No open shift found." });
    }

    const {
      customerName,
      customerNumber,
      paymentMode,
      gcashReferenceNumber,
      cartItems,
      cash,
      change,
      isSeniorOrPWD,
    } = req.body;

    const user = req.user;

    if (user.isAdmin === true) {
      return res.status(403).send({ error: "Only cashiers can create bills." });
    }

    if (
      paymentMode.toLowerCase() === "gcash" &&
      (!gcashReferenceNumber || gcashReferenceNumber.trim() === "")
    ) {
      return res
        .status(400)
        .json({ error: "Reference number is required for GCash payments." });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res
        .status(400)
        .send({ error: "Cart items must be a non-empty array." });
    }

    if (!cartItems.every((item) => "qty" in item && "price" in item)) {
      return res.status(400).send({
        error: "Each cart item must have 'qty' and 'price'.",
      });
    }

    const cashierName = `${user.firstname} ${user.lastname}`;

    const subTotal = cartItems.reduce(
      (acc, item) => acc + item.qty * item.price,
      0
    );
    const vatAmount = subTotal * 0.12;
    const vatSales = subTotal - vatAmount;

    const discount = isSeniorOrPWD ? subTotal * 0.2 : 0;
    const totalAmount = subTotal - discount;

    if (typeof cash !== "number" || cash < 0) {
      return res.status(400).json({ error: "Invalid cash amount." });
    }

    if (cash < totalAmount) {
      return res.status(400).json({ error: "Cash is less than total amount." });
    }

    const newBillData = {
      cashierName,
      customerName,
      customerNumber,
      paymentMode: paymentMode.toLowerCase(),
      gcashReferenceNumber,
      invoiceNumber,
      cartItems: cartItems.map((item) => ({
        itemName: item.itemName,
        qty: item.qty,
        price: item.price,
      })),
      subTotal,
      vatSales,
      vatAmount,
      cash,
      change: cash - totalAmount,
      totalAmount,
      discount,
      seniorOrPWD: isSeniorOrPWD || false,
      shiftId: currentShift._id,
    };

    const newBill = new Bills(newBillData);
    const savedBill = await newBill.save();

    res.status(201).send(savedBill);
  } catch (error) {
    console.error("Error in saving bill: ", error);
    res.status(500).send({ error: "Failed to save the bill" });
  }
};

// Get Bills
exports.getBillsController = async (req, res) => {
  try {
    const bills = await Bills.find().sort({ createdAt: -1 });

    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};

// Void Bill
exports.voidBillController = async (req, res) => {
  const { invoiceNumber } = req.params;

  try {
    const bill = await Bills.findOne({ invoiceNumber });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    if (bill.voided) {
      return res.status(400).json({ error: "Bill is already voided" });
    }

    bill.voided = true;
    await bill.save();

    res.status(200).json({ message: "Bill successfully voided", bill });
  } catch (error) {
    console.error("Error voiding bill:", error);
    res.status(500).json({ error: "Failed to void bill" });
  }
};

// Get Daily Sales
exports.getDailySalesController = async (req, res) => {
  try {
    const { date } = req.query;
    const timezone = "Asia/Manila";

    const targetDate = date
      ? moment.tz(date, "YYYY-MM-DD", timezone)
      : moment.tz(timezone);

    const startOfDay = targetDate.startOf("day").toDate();
    const endOfDay = targetDate.endOf("day").toDate();

    const bills = await Bills.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      voided: { $ne: true },
    });

    const totalSales = bills.reduce((acc, bill) => acc + bill.totalAmount, 0);

    const expenses = await Expense.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    const netSales = totalSales - totalExpenses;

    res.status(200).json({
      date: targetDate.format("YYYY-MM-DD"),
      totalSales,
      totalExpenses,
      netSales,
      totalTransactions: bills.length,
      bills,
      expenses,
    });
  } catch (error) {
    console.error("Error calculating daily sales:", error);
    res.status(500).json({ error: "Failed to calculate daily sales" });
  }
};

// Get Weekly Sales
exports.getWeeklySalesController = async (req, res) => {
  try {
    const startOfWeek = moment().startOf("week").toDate();
    const endOfWeek = moment().endOf("week").toDate();

    const weeklyBills = await Bills.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      voided: { $ne: true },
    });

    const totalSales = weeklyBills.reduce(
      (acc, bill) => acc + bill.totalAmount,
      0
    );

    res.status(200).json({
      weekStart: moment(startOfWeek).format("YYYY-MM-DD"),
      weekEnd: moment(endOfWeek).format("YYYY-MM-DD"),
      totalSales,
      totalTransactions: weeklyBills.length,
      bills: weeklyBills,
    });
  } catch (error) {
    console.error("Error calculating weekly sales:", error);
    res.status(500).json({ error: "Failed to calculate weekly sales" });
  }
};

// Get Monthly Sales
exports.getMonthlySalesController = async (req, res) => {
  try {
    const { month, year } = req.query;

    const targetMonth = parseInt(month || moment().format("MM")) - 1;
    const targetYear = parseInt(year || moment().format("YYYY"));

    const startOfMonth = moment()
      .year(targetYear)
      .month(targetMonth)
      .startOf("month")
      .toDate();
    const endOfMonth = moment()
      .year(targetYear)
      .month(targetMonth)
      .endOf("month")
      .toDate();

    const monthlyBills = await Bills.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      voided: { $ne: true },
    });

    const totalSales = monthlyBills.reduce(
      (acc, bill) => acc + bill.totalAmount,
      0
    );

    res.status(200).json({
      month: moment(startOfMonth).format("MMMM YYYY"),
      totalSales,
      totalTransactions: monthlyBills.length,
      bills: monthlyBills,
    });
  } catch (error) {
    console.error("Error calculating monthly sales:", error);
    res.status(500).json({ error: "Failed to calculate monthly sales" });
  }
};

// =========================== Monthly Sales Graph =========================================================

exports.getMonthlySalesGraphController = async (req, res) => {
  try {
    const timezone = "Asia/Manila";

    const sixMonthsAgo = moment()
      .tz(timezone)
      .subtract(5, "months")
      .startOf("month")
      .toDate();

    const now = moment().tz(timezone).endOf("month").toDate();

    const monthlySales = await Bills.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo, $lte: now },
          voided: { $ne: true },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          totalSales: 1,
          transactionCount: 1,
        },
      },
    ]);

    res.status(200).json(monthlySales);
  } catch (error) {
    console.error("Error fetching monthly sales graph:", error);
    res.status(500).json({ error: "Failed to fetch monthly sales graph" });
  }
};

exports.getDailySalesGraphController = async (req, res) => {
  try {
    const timezone = "Asia/Manila";

    const sevenDaysAgo = moment()
      .tz(timezone)
      .subtract(6, "days")
      .startOf("day")
      .toDate();

    const now = moment().tz(timezone).endOf("day").toDate();

    const dailySales = await Bills.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo, $lte: now },
          voided: { $ne: true },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          totalSales: 1,
          transactionCount: 1,
        },
      },
    ]);

    res.status(200).json(dailySales);
  } catch (error) {
    console.error("Error fetching daily sales graph:", error);
    res.status(500).json({ error: "Failed to fetch daily sales graph" });
  }
};

// ===================== Sales by Cashier =======================
exports.getDailySalesPerCashier = async (req, res) => {
  try {
    const selectedDate =
      req.query.date || moment().tz("Asia/Manila").format("YYYY-MM-DD");

    const start = moment
      .tz(selectedDate, "YYYY-MM-DD", "Asia/Manila")
      .startOf("day")
      .toDate();
    const end = moment
      .tz(selectedDate, "YYYY-MM-DD", "Asia/Manila")
      .endOf("day")
      .toDate();

    const cashiers = await User.find({ isAdmin: false });
    const cashierNames = cashiers.map(
      (user) => `${user.firstname} ${user.lastname}`
    );

    const bills = await Bills.find({
      cashierName: { $in: cashierNames },
      createdAt: { $gte: start, $lte: end },
      voided: false,
    });

    const salesPerCashier = _.chain(bills)
      .groupBy("cashierName")
      .map((bills, cashierName) => ({
        cashierName,
        totalSales: _.sumBy(bills, "totalAmount"),
        transactions: bills.length,
      }))
      .value();

    res.json({ date: selectedDate, sales: salesPerCashier });
  } catch (error) {
    console.error("Error getting daily sales per cashier:", error);
    res.status(500).json({ error: "Failed to get daily sales per cashier." });
  }
};

// Daily Items Sold Report
exports.getDailyItemsSoldReport = async (req, res) => {
  try {
    let dateQuery =
      req.query.date || moment().tz("Asia/Manila").format("YYYY-MM-DD");

    const start = moment.tz(dateQuery, "Asia/Manila").startOf("day").toDate();
    const end = moment.tz(dateQuery, "Asia/Manila").endOf("day").toDate();

    const report = await Bills.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          voided: { $ne: true },
        },
      },
      { $unwind: "$cartItems" },
      {
        $group: {
          _id: "$cartItems.itemName",
          totalQty: { $sum: "$cartItems.qty" },
          totalSales: {
            $sum: { $multiply: ["$cartItems.qty", "$cartItems.price"] },
          },
        },
      },
      {
        $project: {
          itemName: "$_id",
          totalQty: 1,
          totalSales: 1,
          _id: 0,
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    const overallTotalQty = report.reduce(
      (sum, item) => sum + item.totalQty,
      0
    );
    const overallTotalSales = report.reduce(
      (sum, item) => sum + item.totalSales,
      0
    );

    res.status(200).json({
      items: report,
      overallTotalQty,
      overallTotalSales,
    });
  } catch (error) {
    console.error("Error fetching daily item sold report:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
};
