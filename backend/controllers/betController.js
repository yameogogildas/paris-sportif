import Bet from '../models/Bet.js';
import Match from '../models/Match.js';
import User from '../models/User.js';

// ➕ Créer un pari simple
const placeBet = async (req, res) => {
  const { matchId, choice, amount } = req.body;

  try {
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match introuvable." });
    }

    if (match.status === "Terminé") {
      return res.status(400).json({ message: "Ce match est terminé. Aucun pari possible." });
    }

    let selectedOdds;
    if (choice === 'team1') selectedOdds = match.odds.team1;
    else if (choice === 'team2') selectedOdds = match.odds.team2;
    else if (choice === 'draw') selectedOdds = match.odds.draw;
    else return res.status(400).json({ message: "Choix invalide." });

    const potentialWin = parseFloat((amount * selectedOdds).toFixed(2));

    const bet = new Bet({
      user: req.user.id,
      match: matchId,
      choice,
      odds: selectedOdds,
      amount,
      potentialWin,
      isWon: null,
      isPaid: false,
      createdAt: new Date(),
    });

    await bet.save();
    res.status(201).json(bet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création du pari.' });
  }
};

// ➕ Sauvegarder un panier de plusieurs paris avec méthode de paiement
const saveBasket = async (req, res) => {
  const { bets, paymentMethod } = req.body;

  try {
    if (!bets || !Array.isArray(bets) || bets.length === 0) {
      return res.status(400).json({ message: "Aucun pari fourni." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    let totalAmount = 0;
    const savedBets = [];

    for (const betItem of bets) {
      if (!betItem.matchId || !betItem.choice || !betItem.amount) {
        continue;
      }

      const match = await Match.findById(betItem.matchId);
      if (!match || match.status === "Terminé") continue;

      if (!["team1", "team2", "draw"].includes(betItem.choice)) continue;

      let selectedOdds;
      if (betItem.choice === 'team1') selectedOdds = match.odds.team1;
      else if (betItem.choice === 'team2') selectedOdds = match.odds.team2;
      else if (betItem.choice === 'draw') selectedOdds = match.odds.draw;

      const amount = parseFloat(betItem.amount);
      const potentialWin = parseFloat((amount * selectedOdds).toFixed(2));
      totalAmount += amount;

      const bet = new Bet({
        user: req.user.id,
        match: betItem.matchId,
        choice: betItem.choice,
        odds: selectedOdds,
        amount,
        potentialWin,
        paymentMethod: paymentMethod || "Inconnu",
        isWon: null,
        isPaid: false,
        createdAt: new Date(),
      });

      const savedBet = await bet.save();
      savedBets.push(savedBet);
    }

    if (user.wallet < totalAmount) {
      return res.status(400).json({ message: "Solde insuffisant." });
    }

    user.wallet -= totalAmount;
    await user.save();

    res.status(201).json(savedBets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la sauvegarde du panier." });
  }
};

// 🔎 Récupérer tous les paris de l'utilisateur
const getUserBets = async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user.id })
      .populate('match')
      .sort({ createdAt: -1 });

    res.json(bets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🗑️ Supprimer un pari
const deleteBet = async (req, res) => {
  const { id } = req.params;

  try {
    const bet = await Bet.findById(id);
    if (!bet) {
      return res.status(404).json({ message: "Pari introuvable." });
    }

    // Vérification que l'utilisateur qui supprime le pari est bien celui qui l'a créé
    if (bet.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Vous n'êtes pas autorisé à supprimer ce pari." });
    }

    // Utilisation de deleteOne() au lieu de remove()
    await Bet.deleteOne({ _id: id });  // Suppression du pari par son ID
    res.status(200).json({ message: "Pari supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression du pari." });
  }
};

// 🗑️ Supprimer tous les paris de l'utilisateur
const deleteAllBets = async (req, res) => {
  try {
    // Suppression de tous les paris de l'utilisateur connecté
    await Bet.deleteMany({ user: req.user.id });
    res.status(200).json({ message: "Tous les paris ont été supprimés avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de tous les paris." });
  }
};

// 🔁 Met à jour tous les paris liés à un match terminé
const updateBetsForMatch = async (matchId) => {
  const match = await Match.findById(matchId);
  if (!match || match.status !== "Terminé" || !match.winner) return;

  const bets = await Bet.find({ match: matchId });

  for (const bet of bets) {
    bet.isWon = bet.choice === match.winner;
    await bet.save();
  }
};

export {
  placeBet,
  saveBasket,
  getUserBets,
  deleteBet,  // Export de la fonction de suppression d'un pari
  deleteAllBets,  // Export de la fonction de suppression de tous les paris
  updateBetsForMatch
};
