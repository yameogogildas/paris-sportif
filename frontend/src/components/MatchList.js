import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import WalletIcon from "./WalletIcon";
import "./MatchList.css";

const socket = io("http://localhost:5000");

const MatchList = ({ user, basket, setBasket }) => {
  const [matches, setMatches] = useState([]);
  const [selections, setSelections] = useState({});
  const [amount, setAmount] = useState(0);
  const [isCombo, setIsCombo] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [selectedSport, setSelectedSport] = useState("Tous");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data } = await axios.get("http://localhost:5000/api/matches");
      setMatches(data);
    };
    fetchMatches();

    socket.on("matchUpdated", (updatedMatch) => {
      setMatches((prev) =>
        prev.map((m) => (m._id === updatedMatch._id ? updatedMatch : m))
      );
    });
    socket.on("matchCreated", (newMatch) => {
      setMatches((prev) => [newMatch, ...prev]);
    });
    socket.on("matchDeleted", (id) => {
      setMatches((prev) => prev.filter((m) => m._id !== id));
    });

    return () => {
      socket.off("matchUpdated");
      socket.off("matchCreated");
      socket.off("matchDeleted");
    };
  }, []);

  const toggleChoice = (matchId, choice) => {
    setSelections((prev) => {
      const current = prev[matchId] || [];
      return {
        ...prev,
        [matchId]: current.includes(choice)
          ? current.filter((c) => c !== choice)
          : [...current, choice],
      };
    });
  };

  const handlePlaceBet = (match) => {
    const selectedChoices = selections[match._id];
    if (!selectedChoices?.length || !amount || amount <= 0) {
      alert("Veuillez sélectionner un pari et un montant valide.");
      return;
    }
    if (isCombo) {
      const combinedOdds = selectedChoices.reduce(
        (acc, c) => acc * match.odds[c], 1
      );
      const potentialWin = (amount * combinedOdds).toFixed(2);
      const newBet = {
        matchId: match._id,
        match,
        choices: selectedChoices,
        combinedOdds: combinedOdds.toFixed(2),
        amount,
        potentialWin,
        type: "combiné",
      };
      setBasket((prev) => [...prev, newBet]);
    } else {
      const bets = selectedChoices.map((choice) => ({
        matchId: match._id,
        match,
        choice,
        odds: match.odds[choice],
        amount,
        potentialWin: (amount * match.odds[choice]).toFixed(2),
        type: "simple",
      }));
      setBasket((prev) => [...prev, ...bets]);
    }
    setSelections((prev) => ({ ...prev, [match._id]: [] }));
    setAmount(0);
    setIsCombo(false);
    navigate("/basket");
  };

  const matchesBySport = matches.reduce((acc, match) => {
    const sport = match.category?.toLowerCase?.() || "autre";
    if (!acc[sport]) acc[sport] = [];
    acc[sport].push(match);
    return acc;
  }, {});

  const filteredSports =
    selectedSport === "Tous"
      ? matchesBySport
      : {
          [selectedSport.toLowerCase()]:
            matchesBySport[selectedSport.toLowerCase()] || [],
        };

  const sportNames = {
    football: "Football",
    basketball: "Basketball",
    tenis: "Tennis",
    autre: "Autre",
  };

  return (
    <div style={backgroundWrapperStyle}>
      <div style={{ background: "#001833", padding: "10px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>TOP-EVENTS</div>
        <div style={{ display: "flex", gap: "20px", color: "#ccc" }}>
          <span style={{ cursor: "pointer" }}>Club World Cup</span>
          <span style={{ cursor: "pointer" }}>NBA Finals</span>
          <span style={{ cursor: "pointer" }}>NHL Finals</span>
        </div>
        <input
          type="text"
          placeholder="Recherche par match"
          style={{ padding: "6px", borderRadius: "6px", border: "none", minWidth: "180px" }}
        />
      </div>

      <div style={topNavStyle}>
        <div style={topLeftStyle}>GAMBLERS</div>
        <div style={topCenterStyle}>
          <span style={navItemStyle} onClick={() => navigate("/matches")}>Matchs</span>
          <span style={navItemStyle} onClick={() => navigate("/basket")}>Panier</span>
          <span style={navItemStyle} onClick={() => navigate("/bets")}>Historique</span>
        </div>
        <div style={topRightStyle}>
          <WalletIcon user={user} />
          <div onClick={() => navigate("/profile")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <img src={user?.photo || "/image/default-profile.png"} alt="Profil" style={profilePicStyle} />
            <span style={{ color: "#fff" }}>{user?.name}</span>
          </div>
        </div>
      </div>

      <div style={bannerStyle}>
        <img src="/image/ballon.png" alt="banner" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
      </div>

      <div style={pageContainerStyle}>
        <div style={sidebarLeftStyle}>
          <h2 style={logoStyle}>GAMBLERS</h2>
          <ul style={sidebarList}>
            <li><button className="sidebar-btn" onClick={() => navigate("/matches")}>🏟️ Matchs</button></li>
            <li><button className="sidebar-btn" onClick={() => navigate("/basket")}>🧺 Mon Panier</button></li>
            <li><button className="sidebar-btn" onClick={() => navigate("/bets")}>📜 Historique</button></li>
            {user?.isAdmin && <li><button className="sidebar-btn" onClick={() => navigate("/admin")}>🛠️ Admin</button></li>}
            <li><button className="sidebar-btn" onClick={() => navigate("/login")}>🚪 Déconnexion</button></li>
          </ul>
        </div>

        <div style={mainContentStyle}>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="sportFilter" style={{ color: "#fff", marginRight: "10px" }}>Filtrer par sport:</label>
            <select
              id="sportFilter"
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              style={{ padding: "6px", borderRadius: "5px" }}
            >
              <option value="Tous">Tous</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="tenis">Tennis</option>
            </select>
          </div>

          {Object.entries(filteredSports).map(([sport, sportMatches]) => (
            <div key={sport} style={{ marginBottom: "30px", width: "100%" }}>
              <h3 style={{ color: "#00c8ff", marginBottom: "10px" }}>🏅 {sportNames[sport] || sport}</h3>
              <div style={horizontalMatchesListStyle}>
                {sportMatches.map((match) => (
                  <div key={match._id} style={matchCardStyle}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <img src={match.team1Logo} alt={match.team1} style={{ width: "30px", height: "30px", marginRight: "8px" }} />
                      <p style={{ fontSize: "14px", fontWeight: "bold", color: "#fff" }}>
                        {match.team1} {match.scoreTeam1} - {match.scoreTeam2} {match.team2}
                      </p>
                      <img src={match.team2Logo} alt={match.team2} style={{ width: "30px", height: "30px", marginLeft: "8px" }} />
                    </div>
                    {/* Affichage du statut du match */}
                    <div style={{ marginTop: "10px", color: "#fff", fontSize: "12px" }}>
                      Statut : <strong>{match.status}</strong>
                    </div>
                    <div style={oddsContainerStyle}>
                      <button style={oddButtonStyle}>{match.odds?.team1}</button>
                      <button style={oddButtonStyle}>{match.odds?.draw}</button>
                      <button style={oddButtonStyle}>{match.odds?.team2}</button>
                    </div>
                    <button onClick={() => setExpandedMatchId(match._id === expandedMatchId ? null : match._id)} style={toggleButtonStyle}>
                      {expandedMatchId === match._id ? "▲" : "▼"} Détails
                    </button>
                    {expandedMatchId === match._id && (
                      <div style={{ marginTop: "10px", color: "#fff" }}>
                        <label><input type="checkbox" onChange={() => toggleChoice(match._id, 'team1')} checked={selections[match._id]?.includes('team1') || false} /> {match.team1}</label><br />
                        <label><input type="checkbox" onChange={() => toggleChoice(match._id, 'draw')} checked={selections[match._id]?.includes('draw') || false} /> Nul</label><br />
                        <label><input type="checkbox" onChange={() => toggleChoice(match._id, 'team2')} checked={selections[match._id]?.includes('team2') || false} /> {match.team2}</label>
                        <input
                          type="number"
                          placeholder="Montant"
                          className="amount-input"
                          value={amount}
                          min="1"
                          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                          style={{ width: "100%", margin: "10px 0" }}
                        />
                        <label><input type="checkbox" checked={isCombo} onChange={() => setIsCombo(!isCombo)} /> Parier en Combiné</label>
                        <button style={betButtonStyle} onClick={() => handlePlaceBet(match)}>Parier</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={couponStyle}>
          <h3 style={{ color: "#fff", marginBottom: "20px" }}>🎟️ Mon Coupon</h3>
          {basket.length === 0 ? <p style={{ color: "#ccc" }}>Aucun pari</p> : (
            basket.map((bet, i) => (
              <div key={i} style={betItemStyle}>
                <p>{bet.match.team1} vs {bet.match.team2}</p>
                <p>Choix: {bet.choices?.join(", ") || bet.choice}</p>
                <p>Cote: {bet.odds || bet.combinedOdds}</p>
                <p>Mise: {bet.amount} FCFA</p>
                <p>Gain: {bet.potentialWin} FCFA</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ STYLES
const backgroundWrapperStyle = { backgroundImage: "url('/image/stadium-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed", minHeight: "100vh" };
const topNavStyle = { display: "flex", justifyContent: "space-between", padding: "10px 20px", alignItems: "center", background: "#002244" };
const topLeftStyle = { color: "#00c8ff", fontWeight: "bold", fontSize: "24px" };
const topCenterStyle = { display: "flex", gap: "20px" };
const topRightStyle = { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" };
const navItemStyle = { cursor: "pointer", color: "#fff" };
const profilePicStyle = { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" };
const bannerStyle = { width: "90%", height: "120px", margin: "20px auto", borderRadius: "12px", overflow: "hidden" };
const pageContainerStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "90%", margin: "auto", paddingTop: "20px" };
const sidebarLeftStyle = { width: "220px", padding: "20px", background: "linear-gradient(180deg, #003366, #00509e)", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", minHeight: "100vh" };
const logoStyle = { fontSize: "20px", color: "#00aaff", fontWeight: "bold" };
const sidebarList = { listStyle: "none", padding: "0", width: "100%", display: "flex", flexDirection: "column", gap: "15px" };
const mainContentStyle = { flex: "3", display: "flex", flexDirection: "column", alignItems: "center" };
const horizontalMatchesListStyle = { display: "flex", overflowX: "auto", gap: "20px", justifyContent: "center", flexWrap: "nowrap" };
const matchCardStyle = { background: "#0c1c44", borderRadius: "12px", padding: "15px", width: "240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", color: "#fff", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)" };
const oddsContainerStyle = { display: "flex", gap: "10px", marginBottom: "10px" };
const oddButtonStyle = { background: "red", color: "#fff", fontWeight: "bold", fontSize: "14px", padding: "6px 10px", border: "none", borderRadius: "8px" };
const toggleButtonStyle = { fontSize: "12px", padding: "4px 10px", marginTop: "8px", cursor: "pointer", background: "#00509e", color: "#fff", border: "none", borderRadius: "5px" };
const betButtonStyle = { background: "green", color: "#fff", fontWeight: "bold", fontSize: "14px", padding: "8px 20px", border: "none", borderRadius: "8px", marginTop: "10px", cursor: "pointer" };
const couponStyle = { width: "250px", background: "#002244", padding: "20px", minHeight: "100vh" };
const betItemStyle = { background: "#fff", color: "#002244", padding: "10px", borderRadius: "10px", marginBottom: "10px" };


export default MatchList;
