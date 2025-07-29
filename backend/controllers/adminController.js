import User from '../models/User.js';
import Match from '../models/Match.js';
import Bet from '../models/Bet.js';
import { io } from '../server.js';

// 🔄 Met à jour les paris liés à un match terminé
const updateBetsForMatch = async (matchId) => {
  const match = await Match.findById(matchId);
  if (!match || match.status !== "Terminé" || !match.winner) return;

  const bets = await Bet.find({ match: matchId });

  for (const bet of bets) {
    bet.isWon = bet.choice === match.winner;
    await bet.save();
  }
};

// 🔍 Obtenir tous les utilisateurs
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Ajouter un utilisateur
export const addUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, isAdmin: false });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Modifier un utilisateur
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ message: 'Cannot modify admin' });

    const { name, email } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;

    const updated = await user.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🚫 Désactiver un utilisateur
export const deactivateUser = async (req, res) => {
  try {
    console.log("ID reçu pour désactivation:", req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ message: 'Cannot deactivate admin' });

    user.isActive = false;
    await user.save();
    console.log("Utilisateur désactivé avec succès.");
    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error("Erreur lors de la désactivation:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Activer un utilisateur
export const activateUser = async (req, res) => {
  try {
    console.log("ID reçu pour activation:", req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = true;
    await user.save();
    console.log("Utilisateur activé avec succès.");
    res.json({ message: 'User activated successfully' });
  } catch (err) {
    console.error("Erreur lors de l'activation:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ⚽ ➕ Créer un match
export const createMatch = async (req, res) => {
  try {
    const {
      team1, team2, team1Logo, team2Logo,
      date, odds, scoreTeam1, scoreTeam2,
      category, status, winner
    } = req.body;

    const match = await Match.create({
      team1,
      team2,
      team1Logo,
      team2Logo,
      date,
      odds,
      scoreTeam1: scoreTeam1 ?? 0,
      scoreTeam2: scoreTeam2 ?? 0,
      category,
      status: status || "En attente",
      winner: ["team1", "team2", "draw"].includes(winner) ? winner : undefined
    });

    io.emit('matchCreated', match);
    res.status(201).json(match);
  } catch (err) {
    console.error("Erreur createMatch:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Mettre à jour un match (scores, statut, winner)
export const updateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const body = req.body;

    match.team1 = body.team1 || match.team1;
    match.team2 = body.team2 || match.team2;
    match.team1Logo = body.team1Logo || match.team1Logo;
    match.team2Logo = body.team2Logo || match.team2Logo;
    match.date = body.date || match.date;
    match.category = body.category || match.category;

    match.odds = {
      team1: body.odds?.team1 ?? match.odds.team1,
      draw: body.odds?.draw ?? match.odds.draw,
      team2: body.odds?.team2 ?? match.odds.team2,
    };

    match.scoreTeam1 = body.scoreTeam1 ?? match.scoreTeam1;
    match.scoreTeam2 = body.scoreTeam2 ?? match.scoreTeam2;
    match.status = body.status || match.status;
    match.winner = ["team1", "team2", "draw"].includes(body.winner) ? body.winner : match.winner;

    const updated = await match.save();
    io.emit('matchUpdated', updated);

    if (match.status === "Terminé" && match.winner) {
      await updateBetsForMatch(match._id);
    }

    res.json(updated);
  } catch (err) {
    console.error("Erreur updateMatch:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 🏑 Mise à jour rapide statut et gagnant d’un match
export const setMatchResult = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const { status, winner } = req.body;
    match.status = status || match.status;
    match.winner = ["team1", "team2", "draw"].includes(winner) ? winner : match.winner;

    await match.save();
    io.emit('matchUpdated', match);

    if (match.status === "Terminé" && match.winner) {
      await updateBetsForMatch(match._id);
    }

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🗑️ Supprimer un match
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    await match.deleteOne();
    io.emit('matchDeleted', req.params.id);

    res.json({ message: 'Match deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
