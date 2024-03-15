import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  password: {
    type: String,
  }, token: {
    type: String,
  }, phone: {
    type: String,
  }, pincode: {
    type: String,
  },
  country: {
    type: String,
  },
  address: {
    type: String,
  },
  userId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },],
  status: {
    type: String,
    default: 1,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
},
  { timestamps: true }
);

const userModel = mongoose.model('User', userSchema);

export default userModel;