import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Appeal from '../models/Appeal.js'; // 📄 Assurez-vous d'avoir bien créé ce modèle

// 🔐 Middleware de protection JWT
export const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: '⛔ Aucun token fourni' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: '⛔ Utilisateur introuvable' });
    }

    // 🔒 Compte désactivé
    if (!user.isActive) {
      return res.status(403).json({
        message: "L'administrateur vous a désactivé.",
        allowAppeal: true
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Erreur de vérification du token :', err.message);
    res.status(401).json({ message: '⛔ Token invalide ou expiré' });
  }
};

// 🔒 Vérification des droits administrateur
export const admin = (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: '⛔ Accès refusé (admin requis)' });
  }
};

// 📨 Contrôleur pour soumettre une contestation
export const submitAppeal = async (req, res) => {
  try {
    const { message, email, userId } = req.body;

    if (!message || !email || !userId) {
      return res.status(400).json({ message: '⛔ Informations incomplètes pour la contestation' });
    }

    const newAppeal = await Appeal.create({
      userId,
      email,
      message,
    });

    res.status(201).json({ message: '✅ Contestation envoyée avec succès', appeal: newAppeal });
  } catch (err) {
    console.error('Erreur lors de la soumission de la contestation :', err.message);
    res.status(500).json({ message: '⛔ Erreur serveur lors de la contestation' });
  }
};
