import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { User, Settings, LogOut, Shield, CheckCircle, XCircle, Trash, Edit, PlusCircle } from "lucide-react";
import "./AdminDashboard.css";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const socket = io("http://localhost:5000");

const AdminDashboard = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [matchForm, setMatchForm] = useState({
    team1: "",
    team2: "",
    team1Logo: "",
    team2Logo: "",
    date: "",
    odds: { team1: 0, draw: 0, team2: 0 },
    scoreTeam1: 0,
    scoreTeam2: 0,
    category: "football",
    status: "En attente",
    winner: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const matchesRes = await axios.get("http://localhost:5000/api/matches");
        setMatches(matchesRes.data);

        const usersRes = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUsers(usersRes.data);

        const appealsRes = await axios.get("http://localhost:5000/api/appeal", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const responseData = appealsRes.data;
        setAppeals(Array.isArray(responseData) ? responseData : []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    socket.on("matchUpdated", (updatedMatch) => {
      setMatches((prev) => prev.map((m) => (m._id === updatedMatch._id ? updatedMatch : m)));
    });

    socket.on("matchCreated", (newMatch) => {
      setMatches((prev) => [newMatch, ...prev]);
    });

    socket.on("matchDeleted", (deletedMatchId) => {
      setMatches((prev) => prev.filter((m) => m._id !== deletedMatchId));
    });

    return () => {
      socket.off("matchUpdated");
      socket.off("matchCreated");
      socket.off("matchDeleted");
    };
  }, [user]);

  const handleMatchChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("odds.")) {
      const field = name.split(".")[1];
      setMatchForm((prev) => ({
        ...prev,
        odds: { ...prev.odds, [field]: parseFloat(value) || 0 },
      }));
    } else if (name === "scoreTeam1" || name === "scoreTeam2") {
      setMatchForm((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setMatchForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

 const handleCreateOrUpdateMatch = async (e) => {
  e.preventDefault();
  try {
    const updatedForm = {
      ...matchForm,
      category: matchForm.category.toLowerCase(),
    };

    if (!updatedForm.winner) {
      delete updatedForm.winner;
    }

    let updatedMatch;
    if (selectedMatch) {
      updatedMatch = await axios.put(
        `http://localhost:5000/api/admin/match/${selectedMatch._id}`,
        updatedForm,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      socket.emit("matchUpdated", updatedMatch.data);  
    } else {
      updatedMatch = await axios.post("http://localhost:5000/api/admin/match", updatedForm, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      socket.emit("matchCreated", updatedMatch.data);
    }

    alert("✅ Match modifié !");
    setMatchForm({
      team1: "",
      team2: "",
      team1Logo: "",
      team2Logo: "",
      date: "",
      odds: { team1: 0, draw: 0, team2: 0 },
      scoreTeam1: 0,
      scoreTeam2: 0,
      category: "football",
      status: "En attente",
      winner: ""
    });
    setSelectedMatch(null);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi :", error.response?.data || error.message);
    alert("Erreur lors de la création ou mise à jour !");
  }
};

  const handleSelectMatch = (match) => {
    setSelectedMatch(match);
    setMatchForm({
      team1: match.team1,
      team2: match.team2,
      team1Logo: match.team1Logo,
      team2Logo: match.team2Logo,
      date: match.date?.substring(0, 16),
      odds: match.odds,
      scoreTeam1: match.scoreTeam1,
      scoreTeam2: match.scoreTeam2,
      category: match.category,
      status: match.status,
      winner: match.winner || ""
    });
  };

  const handleDeleteMatch = async (id) => {
    if (window.confirm("Supprimer ce match ?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/match/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        alert("✅ Match supprimé !");
      } catch (error) {
        console.error(error);
        alert("Erreur lors de la suppression !");
      }
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/activate`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert("✅ Utilisateur activé !");
      refreshUsers();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'activation.");
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert("✅ Utilisateur désactivé !");
      refreshUsers();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la désactivation.");
    }
  };

  const refreshUsers = async () => {
    try {
      const usersRes = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const adminCount = users.filter((u) => u.isAdmin).length;

  const chartData = {
    labels: ["Matchs", "Utilisateurs", "Admins"],
    datasets: [
      {
        label: "Statistiques",
        data: [matches.length, users.length, adminCount],
        backgroundColor: ["#3498db", "#2ecc71", "#e67e22"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Vue d’ensemble des Statistiques" },
    },
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin</h2>
        <ul>
          <li onClick={() => navigate("/admin/dashboard")}><Shield size={16} /> Tableau de bord</li>
          <li onClick={() => navigate("/admin/users")}><User size={16} /> Utilisateurs</li>
          <li onClick={() => navigate("/admin/settings")}><Settings size={16} /> Paramètres</li>
          <li onClick={() => navigate("/login")}><LogOut size={16} /> Déconnexion</li>
        </ul>
      </aside>

      <main className="admin-dashboard">
        <h1 className="dashboard-title">🎛️ Tableau de Bord Admin</h1>

        <form className="edit-form" onSubmit={handleCreateOrUpdateMatch}>
          {Object.entries(matchForm).map(([key, value]) =>
            typeof value === "object" && key === "odds" ? (
              Object.entries(value).map(([subKey, subVal]) => (
                <div className="form-group" key={subKey}>
                  <label>{subKey}</label>
                  <input
                    type="number"
                    name={`odds.${subKey}`}
                    value={subVal}
                    onChange={handleMatchChange}
                    required
                  />
                </div>
              ))
            ) : key === "category" ? (
              <div className="form-group" key={key}>
                <label>Catégorie</label>
                <select name="category" value={value} onChange={handleMatchChange} required>
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                  <option value="tenis">Tennis</option>
                </select>
              </div>
            ) : key === "status" ? (
              <div className="form-group" key={key}>
                <label>Statut</label>
                <select name="status" value={value} onChange={handleMatchChange} required>
                  <option value="En attente">En attente</option>
                  <option value="En cours">En cours</option>
                  <option value="Mi-temps">Mi-temps</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>
            ) : key === "winner" ? (
              <div className="form-group" key={key}>
                <label>Gagnant</label>
                <select
                  name="winner"
                  value={value}
                  onChange={handleMatchChange}
                  disabled={matchForm.status !== "Terminé"}
                >
                  <option value="">-- Aucun --</option>
                  <option value="team1">{matchForm.team1} a gagné</option>
                  <option value="draw">Match nul</option>
                  <option value="team2">{matchForm.team2} a gagné</option>
                </select>
                {matchForm.status !== "Terminé" && (
                  <small style={{ color: "gray" }}>* Ce champ ne peut être rempli que quand le match est terminé.</small>
                )}
              </div>
            ) : (
              <div className="form-group" key={key}>
                <label>{key}</label>
                <input
                  type={key.includes("date") ? "datetime-local" : key.includes("score") ? "number" : "text"}
                  name={key}
                  value={value}
                  onChange={handleMatchChange}
                  required={key !== "winner"}
                />
              </div>
            )
          )}

          <button type="submit" className="submit-button">
            {selectedMatch ? "Mettre à jour" : "Créer"}
          </button>
        </form>

        <h2 className="section-title">📅 Liste des matchs</h2>
        <ul className="match-list">
          {matches.map((match) => (
            <li key={match._id} className="match-item">
              <div className="match-info">
                <span>{match.team1} vs {match.team2} ({match.date})</span>
                <button className="update-button" onClick={() => handleSelectMatch(match)}>
                  <Edit size={16} /> Modifier
                </button>
                <button className="deactivate-button" onClick={() => handleDeleteMatch(match._id)}>
                  <Trash size={16} /> Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="section-title">👥 Gestion des utilisateurs</h2>
        <ul className="match-list">
          {users.map((u) => (
            <li key={u._id} className="match-item">
              <div className="match-info">
                <span className="team-name">{u.name}  ({u.email})</span>
                <span className="team-score">Rôle : {u.isAdmin ? "Admin" : "Utilisateur"}</span>
                <span className="match-status">Statut : {u.isActive ? "✅ Actif" : "⛔ Inactif"}</span>
                <div className="button-group">
                  <button
                    className="update-button"
                    onClick={() => handleActivateUser(u._id)}
                    disabled={u.isActive}
                  >
                    <CheckCircle size={16} /> Activer
                  </button>
                  <button
                    className="deactivate-button"
                    onClick={() => handleDeactivateUser(u._id)}
                    disabled={!u.isActive || u.isAdmin}
                  >
                    <XCircle size={16} /> Désactiver
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="chart-container" style={{ width: "70%", margin: "40px auto" }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <h2 className="section-title">📩 Messages de contestation</h2>
        <ul className="match-list">
          {appeals.length === 0 ? (
            <li className="match-item">Aucune contestation reçue.</li>
          ) : (
            appeals.map((appeal) => {
              const userAppeal = users.find((u) => u._id === appeal.userId);
              return (
                <li key={appeal._id} className="match-item">
                  <div className="match-info">
                    <span className="team-name">✉️ {appeal.email}</span>
                    <span className="team-score">{appeal.message}</span>
                    <span className="match-status">⏱️ {new Date(appeal.createdAt).toLocaleString()}</span>
                    {userAppeal && (
                      <span className="team-score">Utilisateur concerné : {userAppeal.name}  ({userAppeal.email})</span>
                    )}
                    <button
                      className="update-button"
                      onClick={() => handleActivateUser(appeal.userId)}
                    >
                      <CheckCircle size={16} /> Réactiver ce compte
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </main>
    </div>
  );
};

export default AdminDashboard;
