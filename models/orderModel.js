import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  items: {
    type: Array,
    required: [true, "items is required"],
  },
  status: {
    type: String,
  },
  mode: {
    type: String,
  },
  details: {
    type: Array,
  },
  totalAmount: {
    required: [true, "Total Amount is required"],
    type: Number,
  },
  userId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },]
  ,
  orderId: {
    type: String,
  },
  orderStatus: {
    type: String,
  },
  transactionID: {
    type: String,
  },
  PaymentId: {
    type: String,

  }
},
  { timestamps: true }
);

const orderModel = mongoose.model('Order', orderSchema);

export default orderModel;