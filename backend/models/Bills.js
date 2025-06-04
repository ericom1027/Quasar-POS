const mongoose = require("mongoose");

const billSchema = mongoose.Schema(
  {
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },

    cashierName: {
      type: String,
      required: true,
    },

    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customerName: {
      type: String,
      required: false,
    },

    customerNumber: {
      type: String,
      required: false,
    },

    paymentMode: {
      type: String,
      required: true,
      lowercase: true,
    },

    gcashReferenceNumber: {
      type: String,
    },

    cash: {
      type: Number,
      required: true,
    },

    change: {
      type: Number,
      required: true,
    },

    subTotal: {
      type: Number,
      required: true,
    },

    vatSales: {
      type: Number,
      required: true,
    },

    vatAmount: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    cartItems: [
      {
        itemName: {
          type: String,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    voided: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
    },
    seniorOrPWD: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Bills = mongoose.model("bills", billSchema);

module.exports = Bills;
