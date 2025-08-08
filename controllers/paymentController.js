const Stripe = require('stripe');
let stripeClient = null;

function getStripeClient() {
  if (stripeClient) return stripeClient;
  const secret = process.env.STRIPE_SECRET;
  if (!secret) {
    console.error('Stripe: STRIPE_SECRET is not set in environment.');
    return null;
  }
  stripeClient = new Stripe(secret);
  return stripeClient;
}
const Order = require('../models/Order');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
  
    
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
    const stripe = getStripeClient();
    if (!stripe) return res.status(500).json({ message: 'Stripe is not configured on the server' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });

    console.log('Payment intent created successfully');
    console.log('Payment intent:', paymentIntent);
    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
      paymentMethod: 'stripe',
      paymentAmount: order.totalAmount,
      paymentCurrency: 'inr',
      paymentStatus: 'pending',
      paymentMethod: 'stripe',
      paymentAmount: order.amount,
      paymentCurrency: 'inr',
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
  const signatureHeader = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = getStripeClient();
    if (!stripe) return res.status(500).send('Stripe is not configured on the server');
    // req.body must be the raw Buffer. app.js ensures raw body for this route.
    event = stripe.webhooks.constructEvent(
      req.body,
      signatureHeader,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await handlePaymentSucceededByIntent(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error('Error handling webhook:', err);
    return res.status(500).json({ received: true });
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

// Update order on successful payment intent using metadata from Stripe
const handlePaymentSucceededByIntent = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId;
    await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'processing',
        paymentStatus: 'paid',
        paymentId: paymentIntent.id
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};