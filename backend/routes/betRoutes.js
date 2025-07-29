import express from 'express';
import { placeBet, getUserBets, saveBasket, deleteBet } from '../controllers/betController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ➕ Route pour un seul pari
router.post('/', protect, placeBet);

// ➕ Route pour sauvegarder tout le panier
router.post('/savebasket', protect, saveBasket);

// 🔎 Route pour voir les paris de l’utilisateur
router.get('/mybets', protect, getUserBets);

// 🗑️ Route pour supprimer un pari
router.delete('/:id', protect, deleteBet);  // Suppression d'un pari

export default router;
