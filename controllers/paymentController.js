const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    console.log('Creating payment intent...');
    console.log('request in payment',req);
    console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);
    
    const { orderId } = req.body;
    console.log('Order ID:', orderId);

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log('Order found:', order._id);
    console.log('Order amount:', order.totalAmount);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });

    console.log('Payment intent created successfully');
    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      orderId: order._id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: error.message });
  }
};

// Handle payment success
exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'processing',
        paymentStatus: 'paid',
        paymentId: paymentIntentId
      },
      { new: true }
    );

    res.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle webhook events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(req);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId;
    await Order.findByIdAndUpdate(orderId, {
      status: 'failed',
      paymentStatus: 'failed',
      paymentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};