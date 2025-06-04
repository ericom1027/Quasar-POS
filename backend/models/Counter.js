const mongoose = require("mongoose");

const counterSchema = mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model("counter", counterSchema);

module.exports = Counter;
