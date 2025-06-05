const Expense = require("../models/Expenses");

exports.createExpense = async (req, res) => {
  try {
    const { description, amount, category, paymentMethod, date } = req.body;

    if (!description || !amount) {
      return res
        .status(400)
        .json({ error: "Description and amount are required" });
    }

    const newExpense = new Expense({
      description,
      amount,
      category,
      paymentMethod,
      createdAt: date ? new Date(date) : new Date(),
    });

    await newExpense.save();

    res
      .status(201)
      .json({ message: "Expense recorded successfully", expense: newExpense });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Failed to create expense" });
  }
};

exports.editExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const { description, amount, category, paymentMethod, date } = req.body;

    const updatedData = {
      ...(description && { description }),
      ...(amount && { amount }),
      ...(category && { category }),
      ...(paymentMethod && { paymentMethod }),
      ...(date && { createdAt: new Date(date) }),
    };

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      updatedData,
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;

    const deletedExpense = await Expense.findByIdAndDelete(expenseId);

    if (!deletedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};
