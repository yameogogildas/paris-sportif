import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  team1Logo: String,
  team2Logo: String,
  date: { type: Date, required: true },
  odds: {
    team1: { type: Number, required: true },
    draw: { type: Number, required: true },
    team2: { type: Number, required: true },
  },
  category: {
    type: String,
    enum: ['football', 'basketball', 'tenis'],
    required: true
  },
  status: {
    type: String,
    enum: ['En attente', 'En cours', 'Mi-temps', 'Terminé'],
    default: 'En attente'
  },
  scoreTeam1: { type: Number, default: 0 },
  scoreTeam2: { type: Number, default: 0 },
  winner: {
    type: String,
    enum: ['team1', 'draw', 'team2'],
    required: false,         // ✅ le champ n'est pas requis
    default: undefined       // ✅ par défaut rien n’est défini
  },
  statistics: {
    possession: { type: String, default: "0%" },
    shotsOnTarget: { type: String, default: "0" },
    totalShots: { type: String, default: "0" },
    fouls: { type: String, default: "0" }
  }
}, { timestamps: true });

const Match = mongoose.model('Match', matchSchema);
export default Match;
