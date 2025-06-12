const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: false,
    },

    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Items = mongoose.model("Items", itemSchema);

module.exports = Items;
