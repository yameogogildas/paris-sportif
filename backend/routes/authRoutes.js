// ✅ backend/routes/authRoutes.js

import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// 🔐 Authentification de base
router.post('/register', register);                  // ➕ Inscription
router.post('/login', login);                        // 🔑 Connexion
router.post('/forgot-password', forgotPassword);     // ❓ Mot de passe oublié
router.post('/reset-password/:token', resetPassword); // 🔁 Réinitialiser mot de passe

// 📧 Route de test pour l'envoi d'email (à supprimer en production)
router.get('/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'ton.email@gmail.com', // Remplace par ton email pour test
      subject: '✅ Test Email depuis Node.js',
      text: 'Si tu lis ceci, ton envoi d’email fonctionne parfaitement !',
    });
    res.json({ message: '📨 Email envoyé avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Erreur lors de l’envoi de l’email' });
  }
});

export default router;
