import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  choice: { type: String },
  odds: { type: Number },
  amount: { type: Number },
  potentialWin: { type: Number }
});

const basketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bets: [betSchema]
});

const Basket = mongoose.model('Basket', basketSchema);

export default Basket;
