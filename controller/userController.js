import mongoose from "mongoose";
import blogModel from "../models/blogModel.js";
import userModel from "../models/userModel.js";
import chatModel from "../models/chatModel.js";
import categoryModel from "../models/categoryModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import attributeModel from "../models/attributeModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import homeModel from "../models/homeModel.js";
import homeLayoutModel from "../models/homeLayoutModel.js";
import privateProductModel from "../models/privateProductModel.js";
import stripe from 'stripe';
import nodemailer from 'nodemailer';

const stripeInstance = stripe('sk_test_51OmehULPJUuaH4EOhIOvYF7lIlG1oPPO5zd5XvtL8KYV2Eh3OZnMmuq49toLtnwAmX300ENaGAEaLjIUZt9DAfa000TzIbSQqK');

// Your controller function goes here


dotenv.config();
const secretKey = process.env.SECRET_KEY;

export const SignupUser_old = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields',
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: 'User Already Exists',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new userModel({ username, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    user.token = token; // Update the user's token field with the generated token
    await user.save();

    // Generate JWT token

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Error on signup:', error);
    res.status(500).json({
      success: false,
      message: 'Error on signup',
      error: error.message,
    });
  }
}


export const SignupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields',
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: 'User Already Exists',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new cartModel for the user
    const cart = new cartModel();
    await cart.save();

    // Create a new user and set cartId
    const user = new userModel({ username, email, password: hashedPassword, cartId: cart._id });
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    user.token = token;

    // Save the user to the database
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Error on signup:', error);
    res.status(500).json({
      success: false,
      message: 'Error on signup',
      error: error.message,
    });
  }
};


// get home data 

export const getHomeData = async (req, res) => {
  try {
    const homeData = await homeModel.findOne();

    if (!homeData) {
      return res.status(200).send({
        message: "Home Settings Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Found home settings!",
      success: true,
      homeData,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while getting home settings: ${error}`,
      success: false,
      error,
    });
  }
};



export const UsergetAllHomeProducts = async (req, res) => {

  try {
    const products = await productModel.find({}, '_id title pImage regularPrice salePrice stock');

    if (!products) {
      return res.status(200).send
        ({
          message: 'NO products Find',
          success: false,
        });
    }
    return res.status(200).send
      ({
        message: 'All products List ',
        proCount: products.length,
        success: true,
        products,
      });

  } catch (error) {
    return res.status(500).send
      ({
        message: `error while All products ${error}`,
        success: false,
        error
      })
  }


}


// get home layout data 


export const getHomeLayoutData = async (req, res) => {
  try {
    const homeLayout = await homeLayoutModel.findOne();

    if (!homeLayout) {
      return res.status(200).send({
        message: "Home Layout Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Found home Layout Data!",
      success: true,
      homeLayout,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while getting home Layout: ${error}`,
      success: false,
      error,
    });
  }
};


export const Userlogin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: 'please fill all fields'
      })
    }
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(200).send({
        success: false,
        message: 'email is not registerd',
        user,
      });
    }
    // password check

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: 'password is not incorrect',
        user
        ,
      });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    return res.status(200).send({
      success: true,
      message: 'login sucesssfully',
      user,
    })

  } catch (error) {
    return res.status(500).send
      ({
        message: `error on login ${error}`,
        sucesss: false,
        error
      })
  }
}




export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, pincode, country, address, token } = req.body;
    console.log(phone, pincode, country, address, token)
    const user = await userModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true })
    return res.status(200).json({
      message: 'user Updated!',
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating user: ${error}`,
      success: false,
      error,
    });
  }
}


export const getAllBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel.find({}).lean()
    if (!blogs) {
      return res.status(200).send
        ({
          message: 'NO Blogs Find',
          success: false,
        });
    }
    return res.status(200).send
      ({
        message: 'All Blogs List ',
        BlogCount: blogs.length,
        success: true,
        blogs,
      });

  } catch (error) {
    return res.status(500).send
      ({
        message: `error while getting Blogs ${error}`,
        success: false,
        error
      })
  }
}

export const createBlogController = async (req, res) => {
  try {
    const { title, description, image, user } = req.body;
    //validation
    if (!title || !description || !image || !user) {
      return res.status(400).send({
        success: false,
        message: "Please Provide ALl Fields",
      });
    }
    const exisitingUser = await userModel.findById(user);
    //validaton
    if (!exisitingUser) {
      return res.status(404).send({
        success: false,
        message: "unable to find user",
      });
    }

    const newBlog = new blogModel({ title, description, image, user });
    const session = await mongoose.startSession();
    session.startTransaction();
    await newBlog.save({ session });
    exisitingUser.blogs.push(newBlog);
    await exisitingUser.save({ session });
    await session.commitTransaction();
    await newBlog.save();
    return res.status(201).send({
      success: true,
      message: "Blog Created!",
      newBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Creting blog",
      error,
    });
  }
}



export const updateBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const blog = await blogModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true })
    return res.status(200).json({
      message: 'Blog Updated!',
      success: true,
      blog,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Blog: ${error}`,
      success: false,
      error,
    });
  }
}

export const getBlogIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id);
    if (!blog) {
      return res.status(200).send
        ({
          message: 'Blog Not Found By Id',
          success: false,
        });
    }
    return res.status(200).json({
      message: 'fetch Single Blog!',
      success: true,
      blog,
    });

  }
  catch (error) {
    return res.status(400).json({
      message: `Error while get Blog: ${error}`,
      success: false,
      error,
    });
  }
}

export const deleteBlogController = async (req, res) => {
  try {
    const blog = await blogModel
      // .findOneAndDelete(req.params.id)
      .findByIdAndDelete(req.params.id)
      .populate("user");
    await blog.user.blogs.pull(blog);
    await blog.user.save();
    return res.status(200).send({
      success: true,
      message: "Blog Deleted!",
    });

  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing BLog",
      error,
    });
  }
};
export const userBlogsController = async (req, res) => {
  try {
    const userBlog = await userModel.findById(req.params.id).populate('blogs')
    if (!userBlog) {
      return res.status(200).send
        ({
          message: 'Blog Not Found By user',
          success: false,
        });
    }
    return res.status(200).json({
      message: ' user Blog!',
      success: true,
      userBlog,
    });

  }
  catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing BLog",
      error,
    });
  }

}

export const userTokenController = async (req, res) => {
  try {

    const { id } = req.params;
    const user = await userModel.findOne({ token: id })

    if (!user) {
      return res.status(200).send
        ({
          message: 'Token expire',
          success: false,
        });
    }
    return res.status(200).send
      ({
        message: 'token Found',
        success: true,
        user,
      });
  }
  catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Token Not Authorise",
      error,
    });
  }
}


export const CreateChatController = async (req, res) => {
  const { firstId, secondId } = req.body;
  try {
    const chat = await chatModel.findOne({
      members: { $all: [firstId, secondId] }
    })
    if (chat) return res.status(200).json(chat);
    const newChat = new chatModel({
      members: [firstId, secondId]
    })
    const response = await newChat.save()
    res.status(200).send
      ({
        message: 'Chat Added',
        success: true,
        response,
      });

  }
  catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Chat Not Upload",
      error,
    });
  }
}


export const findUserschatController = async (req, res) => {
  const userId = req.params.id;

  try {
    const chats = await chatModel.find({
      members: { $in: [userId] }
    })
    return res.status(200).send
      ({
        message: 'Chat Added',
        success: true,
        chats,
      });

  }
  catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "User chat Not Found",
      error,
    });
  }
}



export const findchatController = async (req, res) => {
  const { firstId, secondId } = req.params;

  try {
    const chats = await chatModel.find({
      members: { $all: [firstId, secondId] }
    })
    res.status(200).send
      ({
        message: 'Chat Added',
        success: true,
        chats,
      });
  }
  catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "User chat Not Found",
      error,
    });
  }
}





export const UsergetAllCategories = async (req, res) => {

  try {
    const categories = await categoryModel.find({ parent: { $exists: false } });

    if (!categories) {
      return res.status(200).send
        ({
          message: 'NO Blogs Find',
          success: false,
        });
    }
    return res.status(200).send
      ({
        message: 'All Catgeory List ',
        catCount: categories.length,
        success: true,
        categories,
      });

  } catch (error) {
    return res.status(500).send
      ({
        message: `error while All Categories ${error}`,
        success: false,
        error
      })
  }


}

export const UsergetAllProducts = async (req, res) => {

  try {
    const products = await productModel.find({});

    if (!products) {
      return res.status(200).send
        ({
          message: 'NO Products Find',
          success: false,
        });
    }
    return res.status(200).send
      ({
        message: 'All Products List ',
        catCount: products.length,
        success: true,
        products,
      });

  } catch (error) {
    return res.status(500).send
      ({
        message: `error while All Products ${error}`,
        success: false,
        error
      })
  }


}


export const UsergetAllPrivateProducts = async (req, res) => {

  try {
    const products = await productModel.find({});

    if (!products) {
      return res.status(200).send
        ({
          message: 'NO Products Find',
          success: false,
        });
    }
    return res.status(200).send
      ({
        message: 'All Products List ',
        catCount: products.length,
        success: true,
        products,
      });

  } catch (error) {
    return res.status(500).send
      ({
        message: `error while All Products ${error}`,
        success: false,
        error
      })
  }


}



export const UserGetAllProducts = async (req, res) => {

  try {
    const products = await productModel.find({});

    if (!products) {
      return res.status(200).send
        ({
          message: 'NO Products Find',
          success: false,
        });
    }
    return res.status(200).send
      ({
        message: 'All Products List ',
        catCount: products.length,
        success: true,
        products,
      });

  } catch (error) {
    return res.status(500).send
      ({
        message: `error while All Products ${error}`,
        success: false,
        error
      })
  }


}

export const getAllAttributeUser = async (req, res) => {
  try {
    const Attribute = await attributeModel.find({})
    if (!Attribute) {
      return res.status(200).send
        ({
          message: 'NO Attribute Found',
          success: false,
        });
    }
    return res.status(200).send
      ({
        message: 'All Attribute List ',
        AttributeCount: Attribute.length,
        success: true,
        Attribute,
      });

  } catch (error) {
    return res.status(500).send
      ({
        message: `error while getting attribute ${error}`,
        success: false,
        error
      })
  }
}




export const getProductIdUser = async (req, res) => {
  try {
    const { id } = req.params;
    const Product = await productModel.findById(id);
    if (!Product) {
      return res.status(200).send
        ({
          message: 'product Not Found By Id',
          success: false,
        });
    }
    return res.status(200).json({
      message: 'fetch Single product!',
      success: true,
      Product,
    });

  }
  catch (error) {
    return res.status(400).json({
      message: `Error while get product: ${error}`,
      success: false,
      error,
    });
  }
}



export const getCollectionProductIdUser = async (req, res) => {
  try {
    const { storeid, id } = req.params;

    // Check if the product with the specified ID exists
    const Product = await privateProductModel.findById(id);
    if (!Product) {
      return res.status(404).json({
        message: 'Product not found by ID',
        success: false,
      });
    }

    return res.status(200).json({
      message: 'Fetched single product',
      success: true,
      Product,
    });

  } catch (error) {
    return res.status(400).json({
      message: `Error while getting product: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const createOrderController = async (req, res) => {


  try {
    const { items, status, mode, details, totalAmount, userId } = req.body;
    //validation
    if (!status || !mode || !details || !totalAmount) {
      return res.status(400).send({
        success: false,
        message: "Please Provide ALl Fields",
      });
    }
    const exisitingUser = await userModel.findById(userId);
    //validaton
    if (!exisitingUser) {
      return res.status(404).send({
        success: false,
        message: "unable to find user",
      });
    }

    const newOrder = new orderModel({ items, status, mode, details, totalAmount, userId });
    const session = await mongoose.startSession();
    session.startTransaction();
    await newOrder.save({ session });
    exisitingUser.orders.push(newOrder);
    await exisitingUser.save({ session });
    await session.commitTransaction();
    await newOrder.save();
    return res.status(201).send({
      success: true,
      message: "Order Sucessfully!",
      newBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Creting Order",
      error,
    });
  }
}


export const updateUserAndCreateOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, pincode, userId, country, address, token, items, status, mode, details, totalAmount } = req.body;

    // Validation
    if (!status || !mode || !details || !totalAmount) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    const existingUser = await userModel.findById(userId);
    // Validation
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "Unable to find user",
      });
    }

    // Construct line items array for the checkout session
    const lineItems = items.map((product) => ({
      price_data: {
        currency: "USD",
        product_data: {
          name: product.title,
          images: [product.image],
        },
        unit_amount: product.regularPrice * 100,
      },
      quantity: product.quantity
    }));


    // Create a checkout session with the line items
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:3000/cancel",
    });

    console.log(session.id);

    // Update user
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { phone, pincode, country, address },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create order for the updated user
    const newOrder = new orderModel({ items, status, mode, details, totalAmount, orderStatus: '0', transactionId: '', PaymentId: session.id, userId });

    await newOrder.save();

    // Associate the order with the user
    updatedUser.orders.push(newOrder);
    await updatedUser.save();

    return res.json({ id: session.id });


  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const ordersucess = async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripeInstance.checkout.sessions.retrieve(session_id);
    console.log('Session retrieved:', session);

    if (session.payment_status === "paid") {
      const name = session.customer_details.name;
      const amount = session.amount_total / 100;
      const transactionID = session.payment_intent;
      const PaymentId = session.id;
      console.log('Payment successful:', name, amount, transactionID);
      const order = await orderModel.findOneAndUpdate(
        { PaymentId },
        { transactionID, orderStatus: '1' },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'User not found with the provided transaction ID',
        });
      } else {

        // Send response back to client
        res.status(200).json({ name, amount, transactionID });
      }

    } else {
      // Handle payment failure
      console.log('Payment failed');
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const ordercancel = async (req, res) => {

  try {
    const { transactionId } = req.query;
    await updateOrderStatus(transactionId, 'failed');
    res.redirect('/cancel-page');
  } catch (error) {
    console.error('Error updating order status:', error);
    res.redirect('/error-page');
  }
};

const updateOrderStatus = async (transactionId, status) => {
  await orderModel.updateOne({ transactionId }, { status });
};
export const orderCompleteUser = async (req, res) => {

  try {
    const { items, isEmpty, totalItems, totalUniqueItems, cartTotal } = req.body;

    const Cart = new cartModel({ items, isEmpty, totalItems, totalUniqueItems, cartTotal });
    await Cart.save();

    await order.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      Cart
    });
  } catch (error) {
    console.error('Error on signup:', error);
    res.status(500).json({
      success: false,
      message: 'Error on signup',
      error: error.message,
    });
  }


}



// Stripe webhoook

export const Stripewebhook = async (req, res) => {

  let data;
  let eventType;

  // Check if webhook signing is configured.
  let webhookSecret;
  webhookSecret = 'whsec_8a0e4702b4684eba0f61b61ca033be7d9988e867e8f1a53f40e7a70555734d3a';

  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed:  ${err}`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data.object;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data.object;
    eventType = req.body.type;
  }

  // Handle the checkout.session.completed event
  if (eventType === "checkout.session.completed") {
    stripe.customers
      .retrieve(data.customer)
      .then(async (customer) => {
        try {
          // CREATE ORDER
          orderCompleteUser(customer, data);
        } catch (err) {
          console.log(typeof orderCompleteUser);
          console.log(err);
        }
      })
      .catch((err) => console.log(err.message));
  }

  res.status(200).end();
}


// export const updateUserAndCreateOrderController = async (req, res) => {
//   let transactionInProgress = false;

//   const { id } = req.params;
//   const { phone, pincode, country, address, token, items, status, mode, details, totalAmount } = req.body;

//   const lineItems = items.map((product) => ({
//     price_data: {
//       currency: "GBP",
//       product_data: {
//         name: 'product.title',
//         images: 'product.image'
//       },
//       unit_amount: 200 * 100,
//     },
//     quantity: product.quantity
//   }));

//   console.log(lineItems)
//   console.log(items)
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: lineItems,
//     mode: "payment",
//     success_url: "http://localhost:3000/success",
//     cancel_url: "http://localhost:3000/cancel",
//   });

//   res.json({ id: session.id });

//   // try {
//   //   session = await mongoose.startSession();
//   //   session.startTransaction();
//   //   transactionInProgress = true;

//   //   // Update user
//   //   const user = await userModel.findByIdAndUpdate(
//   //     id,
//   //     { phone, pincode, country, address, token },
//   //     { new: true }
//   //   );

//   //   if (!user) {
//   //     return res.status(404).json({
//   //       success: false,
//   //       message: 'User not found',
//   //     });
//   //   }

//   //   // Create order for the updated user
//   //   if (!status || !mode || !details || !totalAmount) {
//   //     return res.status(400).json({
//   //       success: false,
//   //       message: 'Please provide all fields for the order',
//   //     });
//   //   }

//   //   const newOrder = new orderModel({ items, status, mode, details, totalAmount });

//   //   await newOrder.save({ session });
//   //   user.orders.push(newOrder);
//   //   await user.save({ session });

//   //   await session.commitTransaction();
//   //   transactionInProgress = false;

//   //   return res.status(201).json({
//   //     success: true,
//   //     message: 'Order created successfully',
//   //     newOrder,
//   //     user
//   //   });
//   // } catch (error) {
//   //   if (transactionInProgress) {
//   //     try {
//   //       await session.abortTransaction();
//   //     } catch (abortError) {
//   //       console.error('Error aborting transaction:', abortError);
//   //     }
//   //   }
//   //   console.error('Error:', error);
//   //   return res.status(400).json({
//   //     success: false,
//   //     message: 'Error while creating order',
//   //     error: error.message,
//   //   });
//   // } finally {
//   //   if (session) {
//   //     session.endSession();
//   //   }
//   // }


// };


export const userOrdersController = async (req, res) => {
  try {
    const userOrder = await userModel.findById(req.params.id).populate('orders')
    if (!userOrder) {
      return res.status(200).send
        ({
          message: 'Order Not Found By user',
          success: false,
        });
    }
    return res.status(200).json({
      message: ' user Orders!',
      success: true,
      userOrder,
    });

  }
  catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Getting Orders",
      error,
    });
  }

}



export const AddCart = async (req, res) => {
  try {
    const { items, isEmpty, totalItems, totalUniqueItems, cartTotal } = req.body;

    const Cart = new cartModel({ items, isEmpty, totalItems, totalUniqueItems, cartTotal });
    await Cart.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      Cart
    });
  } catch (error) {
    console.error('Error on signup:', error);
    res.status(500).json({
      success: false,
      message: 'Error on signup',
      error: error.message,
    });
  }
}

export const UpdateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, isEmpty, totalItems, totalUniqueItems, cartTotal } = req.body;
    const Cart = await cartModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true })
    return res.status(200).json({
      message: 'Cart Updated!',
      success: true,
      Cart,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating cart: ${error}`,
      success: false,
      error,
    });
  }
}


export const getCart = async (req, res) => {
  try {
    const { id } = req.params;
    const Cart = await cartModel.findById(id);
    if (!Cart) {
      return res.status(200).send
        ({
          message: 'Cart Not Found',
          success: false,
        });
    }
    return res.status(200).json({
      message: 'Cart Found successfully!',
      success: true,
      Cart,
    });

  }
  catch (error) {
    return res.status(400).json({
      message: `Error while get cart: ${error}`,
      success: false,
      error,
    });
  }
}




const sendOTP = async (email, otp, res) => {

  if (!email || !otp) {

    res.status(500).json({
      success: false,
      message: 'Error on otp Send',
      error: error.message,
    });
  } else {
    try {
      // Configure nodemailer transporter
      const transporter = nodemailer.createTransport({
        // SMTP configuration
        host: process.env.MAIL_HOST, // Update with your SMTP host
        port: process.env.MAIL_PORT, // Update with your SMTP port
        secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
        auth: {
          user: process.env.MAIL_USERNAME, // Update with your email address
          pass: process.env.MAIL_PASSWORD,// Update with your email password
        }
      });

      // Email message
      const mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
        to: email, // Update with your email address
        subject: 'Brandnow Email Verification',
        html: `<h3>OTP: <b>${otp}</b></h3>` // HTML body with OTP in bold
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('error sent successfully', error);

          res.status(500).json({
            success: false,
            message: 'Error on otp Send',
            error: error.message,
          });

        } else {
          res.status(200).send('OTP sent successfully');
          console.log('OTP sent successfully');

        }
      });

    } catch (error) {
      // Handle errors
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

};



export const SendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // Send OTP via Phone
    await sendOTP(email, otp);

    res.status(200).json({ success: true, message: 'OTP sent successfully', OTP: otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};



export const SignupLoginUser = async (req, res) => {
  try {
    const { email, Gtoken } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    await sendOTP(email, otp);

    if (!Gtoken) {
      return res.status(400).json({
        success: false,
        message: 'you can access this page ',
      });
    }

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields',
      });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      if (existingUser.password !== undefined) {
        if (existingUser.status === '0') {
          return res.status(400).json({
            success: false,
            message: 'An error occurred. Please contact support.',
          });
        }
        return res.status(201).json({
          success: true,
          message: 'User found with password',
          password: true,
        });
      } else {
        if (existingUser.status === '0') {
          return res.status(400).json({
            success: false,
            message: 'An error occurred. Please contact support.',
          });
        }
        return res.status(201).json({
          success: true,
          message: 'User found',
          existingUser: { _id: existingUser._id, username: existingUser.username, phone: existingUser.phone, email: existingUser.email },
          token: existingUser.token,
          otp: otp,
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: 'New User found',
        newUser: true,
        otp: otp,
      });
    }
  } catch (error) {
    console.error('Error on login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error on login',
      error: error.message,
    });
  }
}


export const contactEnquire = async (req, res) => {

  const { name, email, message } = req.body;

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    // SMTP configuration
    host: process.env.MAIL_HOST, // Update with your SMTP host
    port: process.env.MAIL_PORT, // Update with your SMTP port
    secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    auth: {
      user: process.env.MAIL_USERNAME, // Update with your email address
      pass: process.env.MAIL_PASSWORD,// Update with your email password
    }
  });

  // Email message
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    to: process.env.MAIL_TO_ADDRESS, // Update with your email address
    subject: 'New Contact Us Form Submission',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Failed to send email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email sent successfully');
    }
  });

};

export const SignupNewUser = async (req, res) => {
  try {
    const { email, Gtoken } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    await sendOTP(email, otp);


    if (!Gtoken) {
      return res.status(400).json({
        success: false,
        message: 'you can access this page ',
      });
    }
    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields',
      });
    }

    // Create a new user
    const user = new userModel({ email });
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    user.token = token; // Update the user's token field with the generated token
    await user.save();

    // Generate JWT token

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      existingUser: { _id: user._id, username: user.username, phone: user.phone, email: user.email },
      otp: otp,
      token,
    });
  } catch (error) {
    console.error('Error on signup:', error);
    res.status(500).json({
      success: false,
      message: 'Error on signup',
      error: error.message,
    });
  }
}


export const LoginUserWithOTP = async (req, res) => {
  try {
    const { email, Gtoken } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    await sendOTP(email, otp);

    if (!Gtoken) {
      return res.status(400).json({
        success: false,
        message: 'you can access this page ',
      });
    }
    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields',
      });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(201).json({
        success: true,
        message: 'User found',
        existingUser: { _id: existingUser._id, username: existingUser.username, phone: existingUser.phone, email: existingUser.email },
        token: existingUser.token,
        otp: otp,
      });

    }
  } catch (error) {
    console.error('Error on signup:', error);
    res.status(500).json({
      success: false,
      message: 'Error on signup',
      error: error.message,
    });
  }
}


export const LoginUserWithPass = async (req, res) => {

  try {
    const { email, Gtoken, password } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    if (!email || !password || !Gtoken) {
      return res.status(400).send({
        success: false,
        message: 'please fill all fields'
      })
    }
    const user = await userModel.findOne({ email })

    // password check

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: 'password is not incorrect',
        user,
      });
    }

    // const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    return res.status(200).json({
      success: true,
      message: 'login sucesssfully with password',
      existingUser: { _id: user._id, username: user.username, phone: user.phone, email: user.email },
      token: user.token,
      checkpass: true,
    });


  } catch (error) {
    return res.status(500).send
      ({
        message: `error on login ${error}`,
        sucesss: false,
        error
      })
  }

}

