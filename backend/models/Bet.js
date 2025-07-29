import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  choice: {
    type: String,
    enum: ['team1', 'team2', 'draw'],
    required: true
  },
  odds: {
    type: Number,
    required: true,
    min: 1  // Modification ici : permettre une cote de 1
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  potentialWin: {
    type: Number,
    required: true
  },
  isWon: {
    type: Boolean,
    default: null // null = en attente, true = gagné, false = perdu
  },
  isPaid: {
    type: Boolean,
    default: false // false = pas encore payé
  },
  choices: [{
    type: String,
    enum: ['team1', 'team2', 'draw']
  }],
  paymentMethod: {
    type: String,
    enum: ['Orange Money', 'MTN Mobile Money', 'Visa', 'MasterCard', 'PayPal', 'Inconnu'],
    default: 'Inconnu'
  }
}, {
  timestamps: true
});

const Bet = mongoose.model('Bet', betSchema);

export default Bet;
