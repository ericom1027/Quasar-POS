const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expenses");

const auth = require("../middlewares/auth");

router.post(
  "/expenses",
  auth.verify,
  auth.verifyAdmin,
  expensesController.createExpense
);

router.get(
  "/expenses",
  auth.verify,
  auth.verifyAdmin,
  expensesController.getExpenses
);

router.put(
  "/expenses/:id",
  auth.verify,
  auth.verifyAdmin,
  expensesController.editExpense
);

router.delete(
  "/expenses/:id",
  auth.verify,
  auth.verifyAdmin,
  expensesController.deleteExpense
);

module.exports = router;
