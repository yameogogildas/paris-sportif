// backend/controllers/walletController.js
import Wallet from '../models/Wallet.js';

export const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deposit = async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ user: req.user.id, balance: amount });
    } else {
      wallet.balance += amount;
    }
    await wallet.save();
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const withdraw = async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    if (wallet.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    wallet.balance -= amount;
    await wallet.save();
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
