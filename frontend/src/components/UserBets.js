import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import InvoiceHistory from "./InvoiceHistory";
import { MdDelete, MdOutlineHistory, MdReceipt, MdFilterList, MdAttachMoney } from "react-icons/md";
import "./UserBets.css";

const socket = io("http://localhost:5000");

const UserBets = ({ user, setUser }) => {
  const [bets, setBets] = useState([]);
  const [activePage, setActivePage] = useState("");
  const [wallet, setWallet] = useState(user?.wallet || 0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchBets = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/bets/mybets", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBets(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWallet = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/wallet", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setWallet(data.balance);
      setUser((prevUser) => ({ ...prevUser, wallet: data.balance }));
      localStorage.setItem("userInfo", JSON.stringify({ ...user, wallet: data.balance }));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du portefeuille :", error);
    }
  };

  const updateBetStatus = (updatedMatch) => {
    setBets((prevBets) =>
      prevBets.map((bet) => {
        if (bet.match._id === updatedMatch._id) {
          let newIsWon = null;
          if (updatedMatch.status === "Terminé") {
            if (bet.choice === "team1" && updatedMatch.scoreTeam1 > updatedMatch.scoreTeam2) {
              newIsWon = true;
            } else if (bet.choice === "team2" && updatedMatch.scoreTeam2 > updatedMatch.scoreTeam1) {
              newIsWon = true;
            } else if (bet.choice === "draw" && updatedMatch.scoreTeam1 === updatedMatch.scoreTeam2) {
              newIsWon = true;
            } else {
              newIsWon = false;
            }
          }
          return { ...bet, isWon: newIsWon };
        }
        return bet;
      })
    );
  };

  const deleteBet = async (betId) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce pari ?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/bets/${betId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBets(bets.filter((bet) => bet._id !== betId));
        alert("Pari supprimé avec succès !");
      } catch (error) {
        console.error("Erreur lors de la suppression du pari :", error);
      }
    }
  };

  const getFilteredBets = () => {
    if (filterType === "thisMonth") return filterBetsByMonth();
    if (filterType === "lastMonth") return filterBetsByLastMonth();
    if (filterType === "custom") return filterBetsByDate();
    return bets;
  };

  const filterBetsByDate = () => {
    return bets.filter((bet) => {
      const betDate = new Date(bet.createdAt);
      const isAfterStart = startDate ? betDate >= new Date(startDate) : true;
      const isBeforeEnd = endDate ? betDate <= new Date(endDate) : true;
      return isAfterStart && isBeforeEnd;
    });
  };

  const filterBetsByMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return bets.filter((bet) => {
      const date = new Date(bet.createdAt);
      return date >= firstDay && date <= lastDay;
    });
  };

  const filterBetsByLastMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
    return bets.filter((bet) => {
      const date = new Date(bet.createdAt);
      return date >= firstDay && date <= lastDay;
    });
  };

  useEffect(() => {
    if (!user) return;
    if (activePage === "bets") {
      fetchBets();
      socket.on("matchUpdated", updateBetStatus);
    }
    fetchWallet();
    return () => socket.off("matchUpdated");
  }, [user, activePage]);

  return (
    <div className="bets-page">
      <h2 className="bets-title"><MdOutlineHistory /> Mon Historique</h2>

      <div className="wallet-info">
        <p className="wallet-balance">
          <MdAttachMoney size={20} /> Solde : <strong>{wallet} $</strong>
        </p>
      </div>

      <div className="history-buttons">
        <button
          className={activePage === "bets" ? "active" : ""}
          onClick={() => setActivePage("bets")}
        >
          <MdOutlineHistory size={20} /> Voir mes Paris
        </button>
        <button
          className={activePage === "invoices" ? "active" : ""}
          onClick={() => setActivePage("invoices")}
        >
          <MdReceipt size={20} /> Mes Factures
        </button>
      </div>

      <div className="month-filter">
        <button onClick={() => setFilterType("thisMonth")}><MdFilterList /> Ce Mois-ci</button>
        <button onClick={() => setFilterType("lastMonth")}><MdFilterList /> Mois Dernier</button>
        <button onClick={() => setFilterType("custom")}><MdFilterList /> Personnaliser</button>
      </div>

      {activePage === "" && (
        <p>Veuillez sélectionner une section à afficher.</p>
      )}

      {activePage === "bets" && (
        <div className="table-container">
          <table className="bets-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Choix</th>
                <th>Côte</th>
                <th>Montant</th>
                <th>Gain Potentiel</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredBets().map((bet) => (
                <tr key={bet._id}>
                  <td>{bet.match ? `${bet.match.team1} vs ${bet.match.team2}` : "Match indisponible"}</td>
                  <td>{bet.choice}</td>
                  <td>{bet.odds}</td>
                  <td>{bet.amount} $</td>
                  <td>{bet.potentialWin?.toFixed(2)} $</td>
                  <td>
                    {bet.isWon === null ? (
                      <span className="pending">En attente</span>
                    ) : bet.isWon ? (
                      <span className="won">Gagné ✅</span>
                    ) : (
                      <span className="lost">Perdu ❌</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => deleteBet(bet._id)}
                      title="Supprimer le pari"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activePage === "invoices" && <InvoiceHistory user={user} />}
    </div>
  );
};

export default UserBets;
