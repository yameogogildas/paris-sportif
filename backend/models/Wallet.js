// backend/models/Wallet.js
import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
});

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
