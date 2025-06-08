const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDb = require("./config/config");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/userRoute");
const shiftRoute = require("./routes/shiftRoute");
const attendanceRoute = require("./routes/attendanceRoute");
const itemRoute = require("./routes/itemRoute");
const billRoute = require("./routes/billsRoute");
const expenseRoutes = require("./routes/expensesRoute");
const app = express();
dotenv.config();

app.use(
  cors({
    origin: [
      "http://localhost:9000",
      "https://razons-pos.onrender.com",
      "https://razons.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", userRoute);
app.use("/api", shiftRoute);
app.use("/api", attendanceRoute);
app.use("/api", itemRoute);
app.use("/api", billRoute);
app.use("/api", expenseRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server Running On Port:${PORT}`);
});

module.exports = { app, mongoose };
