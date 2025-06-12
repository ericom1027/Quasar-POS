const bcrypt = require("bcryptjs");
const User = require("../models/User");
const moment = require("moment");
const Attendance = require("../models/Attendance");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
  createAccessToken,
  createRefreshToken,
} = require("../middlewares/auth");

function computeTotalHours(attendance) {
  if (!attendance.timeIn || !attendance.timeOut) return 0;
  const timeIn = moment(attendance.timeIn);
  const timeOut = moment(attendance.timeOut);
  const duration = moment.duration(timeOut.diff(timeIn));
  return duration.asHours();
}

exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, password, mobileNo } = req.body;

  try {
    // console.log("Registering user with body:", req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      mobileNo,
      isAdmin: req.body.isAdmin,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error.message);
    console.error("Full error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.deleteUser = async (req, res) => {
//   const { id } = req.params;

//   if (req.user.id === id) {
//     return res.status(403).json({
//       message: "You cannot delete your own admin account",
//     });
//   }

//   try {
//     const user = await User.findByIdAndDelete(id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting user:", error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, password, mobileNo, status } = req.body;

  try {
    const updateData = {
      firstname,
      lastname,
      email,
      mobileNo,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (status) {
      updateData.status = status;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status !== "active") {
      return res.status(403).json({
        message: `Account is ${user.status}. Please contact admin.`,
      });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   // secure: false,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "Strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (user.isAdmin) {
      return res.json({
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          isAdmin: true,
        },
        accessToken,
        attendance: null,
        totalHours: 0,
      });
    }

    const today = moment().format("YYYY-MM-DD");

    let attendance = await Attendance.findOne({
      user: user._id,
      date: today,
    });

    if (!attendance) {
      attendance = await Attendance.create({
        user: user._id,
        timeIn: new Date(),
        date: today,
      });
    }

    const totalHours = attendance.timeOut ? computeTotalHours(attendance) : 0;

    return res.json({
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
      accessToken,
      attendance,
      totalHours,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(403).json({ message: "Refresh Token is required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = createAccessToken(decoded);

    return res.json({ accessToken: newAccessToken });
  } catch {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out successfully" });
};
