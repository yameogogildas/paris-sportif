import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminBets.css"; // ➔ Nouveau fichier CSS

const AdminBets = ({ user }) => {
  const [bets, setBets] = useState([]);

  useEffect(() => {
    const fetchBets = async () => {
      const { data } = await axios.get("http://localhost:5000/api/admin/allbets", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBets(data);
    };
    fetchBets();
  }, [user]);

  return (
    <div className="admin-bets-page">
      <h2 className="admin-bets-title">📄 Tous les Tickets Utilisateurs</h2>

      <table className="bets-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Match</th>
            <th>Choix</th>
            <th>Côte</th>
            <th>Montant</th>
            <th>Gain Potentiel</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {bets.map((bet) => (
            <tr key={bet._id}>
              <td>{bet.user.name}</td>
              <td>{bet.match.team1} vs {bet.match.team2}</td>
              <td>{bet.choice || bet.choices.join(', ')}</td>
              <td>{bet.odds || bet.combinedOdds}</td>
              <td>{bet.amount} $</td>
              <td>{bet.potentialWin} $</td>
              <td>
                {bet.isWon === null ? "⏳ En attente" : bet.isWon ? "🟢 Gagné" : "🔴 Perdu"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBets;
