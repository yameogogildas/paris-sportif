// backend/routes/paymentRoutes.js
import express from 'express';
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';

const router = express.Router();

// ✅ Stripe config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ PayPal config
const Environment = process.env.PAYPAL_MODE === 'live'
  ? paypal.core.LiveEnvironment
  : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

// 💳 Stripe Payment
router.post('/stripe', async (req, res) => {
  let { amount } = req.body;
  console.log("📥 Montant brut reçu (Stripe):", amount);

  amount = Number(amount);
  if (!amount || isNaN(amount) || amount <= 0) {
    console.error("❌ Montant invalide pour Stripe:", amount);
    return res.status(400).json({ error: "Montant invalide pour Stripe." });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // 💵 Convertir en centimes
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    console.log("✅ Stripe PaymentIntent créé :", paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Erreur Stripe :", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 💰 PayPal Payment
router.post('/paypal', async (req, res) => {
  console.log("📥 Requête PayPal reçue :", req.body);
  let { total } = req.body;
  total = Number(total);

  if (!total || isNaN(total) || total <= 0) {
    console.error("❌ Montant 'total' invalide :", total);
    return res.status(400).json({ error: "Montant requis pour PayPal." });
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: total.toString(),
        },
      },
    ],
  });

  try {
    const order = await paypalClient.execute(request);
    if (!order.result?.id) {
      console.error("❌ Erreur lors de la création de commande PayPal :", order.result);
      return res.status(500).json({ error: "Commande PayPal non générée." });
    }

    console.log("✅ Commande PayPal créée :", order.result.id);
    res.json({ id: order.result.id });

  } catch (err) {
    console.error("❌ Erreur PayPal backend :", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
