import Match from '../models/Match.js';
import { updateBetsForMatch } from './betController.js';

// 🔍 Obtenir tous les matchs
export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (err) {
    console.error("Erreur lors de la récupération des matchs :", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ➕ Créer un nouveau match
export const createMatch = async (req, res) => {
  try {
    const {
      team1,
      team2,
      team1Logo,
      team2Logo,
      date,
      odds,
      category,
      status,
      scoreTeam1,
      scoreTeam2,
      winner,
      statistics
    } = req.body;

    // ✅ Construction des données du match
    const matchData = {
      team1,
      team2,
      team1Logo,
      team2Logo,
      date,
      odds,
      category: category?.toLowerCase(),
      status: status || "En attente",
      scoreTeam1: scoreTeam1 || 0,
      scoreTeam2: scoreTeam2 || 0,
      statistics
    };

    // ✅ Inclure le winner uniquement s’il est fourni
    if (winner && ["team1", "draw", "team2"].includes(winner)) {
      matchData.winner = winner;
    }

    const newMatch = new Match(matchData);
    const savedMatch = await newMatch.save();

    res.status(201).json(savedMatch);
  } catch (err) {
    console.error("Erreur lors de la création du match :", err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Erreur de validation", errors: err.errors });
    }
    res.status(500).json({ message: err.message });
  }
};

// ✅ Mettre à jour un match (et les paris associés si terminé)
export const updateMatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    const updateData = req.body;

    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase();
    }

    // ✅ Nettoyage du champ winner vide
    if (!updateData.winner) {
      delete updateData.winner;
    }

    const updatedMatch = await Match.findByIdAndUpdate(matchId, updateData, { new: true });

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match non trouvé." });
    }

    // ✅ Mise à jour des paris uniquement si le match est terminé
    if (updatedMatch.status === "Terminé") {
      await updateBetsForMatch(updatedMatch._id);
    }

    res.json(updatedMatch);
  } catch (err) {
    console.error("Erreur lors de la mise à jour du match :", err.message);
    res.status(500).json({ message: err.message });
  }
};
