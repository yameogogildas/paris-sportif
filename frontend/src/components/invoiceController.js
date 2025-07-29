import Invoice from '../models/Invoice.js';
import fs from 'fs';
import path from 'path';

export const getInvoiceHistory = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
