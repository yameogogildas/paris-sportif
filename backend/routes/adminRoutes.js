import express from 'express';
import {
  createMatch,
  setMatchResult,
  getUsers,
  addUser,
  updateUser,
  deactivateUser,
  activateUser, // ✅ Ajouté ici
  updateMatch,
  deleteMatch
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🏟️ Gestion des matchs
router.post('/match', protect, admin, createMatch);               // ➕ Créer match
router.put('/match/:id', protect, admin, updateMatch);            // ✏️ Modifier match
router.delete('/match/:id', protect, admin, deleteMatch);         // 🗑️ Supprimer match
router.put('/match/:id/result', protect, admin, setMatchResult);  // 🏁 Résultat match

// 👥 Gestion des utilisateurs
router.get('/users', protect, admin, getUsers);                          // 🔍 Tous les utilisateurs
router.post('/users', protect, admin, addUser);                          // ➕ Ajouter utilisateur
router.put('/users/:id', protect, admin, updateUser);                   // ✏️ Modifier utilisateur
router.put('/users/:id/deactivate', protect, admin, deactivateUser);   // 🚫 Désactiver utilisateur
router.put('/users/:id/activate', protect, admin, activateUser);       // ✅ Activer utilisateur

export default router;
