const express = require("express");

const billsController = require("../controllers/bills");

const auth = require("../middlewares/auth");
const router = express.Router();

router.post("/addBills", auth.verify, billsController.addBillsController);

router.get("/getBills", auth.verify, billsController.getBillsController);

router.get(
  "/sales-cashier",
  auth.verify,
  auth.verifyAdmin,
  billsController.getDailySalesPerCashier
);

router.put(
  "/void/:invoiceNumber",
  auth.verify,
  auth.verifyAdmin,
  billsController.voidBillController
);

router.get(
  "/daily-sales",
  auth.verify,
  auth.verifyAdmin,
  billsController.getDailySalesController
);

router.get(
  "/weekly",
  auth.verify,
  auth.verifyAdmin,
  billsController.getWeeklySalesController
);
router.get("/monthly", auth.verify, billsController.getMonthlySalesController);

router.get(
  "/daily-sales-graph",
  auth.verify,
  auth.verifyAdmin,

  billsController.getDailySalesGraphController
);
router.get(
  "/monthly-sales-graph",
  auth.verify,
  auth.verifyAdmin,
  billsController.getMonthlySalesGraphController
);

router.get(
  "/daily-items-sold",
  // auth.verify,
  // auth.verifyAdmin,
  billsController.getDailyItemsSoldReport
);

module.exports = router;
