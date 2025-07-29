import Appeal from "../models/Appeal.js";

export const submitAppeal = async (req, res) => {
  try {
    const { email, message } = req.body;
    const newAppeal = new Appeal({ email, message });
    await newAppeal.save();
    res.json({ message: "Contestation envoyée." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getAllAppeals = async (req, res) => {
  try {
    const appeals = await Appeal.find().sort({ createdAt: -1 });
    res.json(appeals);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
