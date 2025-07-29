import express from "express";
import Appeal from "../models/Appeal.js";

const router = express.Router();

// ➕ Envoyer une contestation
router.post("/", async (req, res) => {
  const { email, message } = req.body;

  try {
    const newAppeal = new Appeal({ email, message });
    await newAppeal.save();
    res.status(201).json({ message: "Contestation envoyée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔒 Liste des contestations (admin seulement)
router.get("/", async (req, res) => {
  try {
    const appeals = await Appeal.find().sort({ createdAt: -1 });
    res.json(appeals);
  } catch (err) {
    res.status(500).json({ message: "Erreur de récupération" });
  }
});

export default router;
