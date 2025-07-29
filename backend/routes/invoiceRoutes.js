import express from 'express';
import { generateInvoice, getInvoiceHistory } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📄 Route pour générer une facture
router.post('/generate', generateInvoice);

// 📂 Route pour récupérer l'historique des factures de l'utilisateur connecté
router.get('/history', protect, getInvoiceHistory);

export default router;
