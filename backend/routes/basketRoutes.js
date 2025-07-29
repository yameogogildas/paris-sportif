import express from 'express';
import {
  placeBet,
  saveBasket,
  getUserBets,
  updateBetsForMatch,
  deleteBet,
  deleteAllBets,
} from '../controllers/betController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ➕ Placer un pari simple
router.post('/place', protect, placeBet);

// 🧺 Enregistrer un panier de paris validés/payés
router.post('/savebasket', protect, saveBasket);

// 📜 Récupérer l'historique des paris
router.get('/', protect, getUserBets);

// 🛠️ Mise à jour automatique des paris liés à un match (optionnelle pour admin ou cron)
router.put('/update/:matchId', protect, async (req, res) => {
  try {
    await updateBetsForMatch(req.params.matchId);
    res.status(200).json({ message: 'Mise à jour des paris réussie' });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour des paris." });
  }
});

// 🗑️ Supprimer un pari
router.delete('/:id', protect, deleteBet); // Suppression d'un pari par ID

// 🗑️ Supprimer tous les paris de l'utilisateur
router.delete('/all', protect, deleteAllBets);  // Suppression de tous les paris de l'utilisateur

export default router;
