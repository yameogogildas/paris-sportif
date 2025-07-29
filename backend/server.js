import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';

// 🔗 Import des routes
import authRoutes from './routes/authRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import betRoutes from './routes/betRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import appealRoutes from './routes/appealRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ✅ Stripe init
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
console.log("✅ Clé Stripe chargée");

// ✅ Middleware CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://192.168.")) {
      callback(null, true);
    } else {
      console.warn("❌ Origine bloquée par CORS :", origin);
      callback(new Error("CORS bloqué"));
    }
  },
  credentials: true,
}));

// ✅ Middleware JSON
app.use(express.json());

// ✅ WebSocket init
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://192.168.")) {
        callback(null, true);
      } else {
        callback(new Error("WebSocket CORS bloqué"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// ✅ Gestion des connexions socket
io.on("connection", (socket) => {
  console.log("🟢 Client WebSocket connecté :", socket.id);

  socket.on("ping", () => {
    console.log("📡 Ping reçu");
    socket.emit("pong");
  });

  socket.on("disconnect", () => {
    console.log("🔴 Déconnexion :", socket.id);
  });
});

// ✅ Export io pour d'autres modules
export { io };

// ✅ Routes API
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/appeal', appealRoutes);
app.use('/api/invoice', invoiceRoutes);

// ✅ Paiement par carte (Stripe)
app.post('/api/payment/card-intent', async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("❌ Erreur Stripe :", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connecté"))
.catch((err) => console.error("❌ Erreur MongoDB :", err));

// ✅ Serveur React (production)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur Node lancé sur http://0.0.0.0:${PORT}`);
});
