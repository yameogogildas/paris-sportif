import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./BetBasket.css";

// URL de l'API backend
const API_URL = "http://localhost:5000";

// Méthodes de paiement disponibles
const paymentMethods = [
  { name: "Orange Money", logo: "/images/orange-money.png" },
  { name: "MTN Mobile Money", logo: "/images/mtn-money.png" },
  { name: "Visa", logo: "/images/visa.png" },
  { name: "MasterCard", logo: "/images/mastercard.png" },
  { name: "PayPal", logo: "/images/paypal.png" },
  { name: "TestPay", logo: "/images/testpay.png" },
];

const BetBasket = ({ basket, setBasket, user, setUser }) => {
  const navigate = useNavigate();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [loading, setLoading] = useState(false);  // Indicateur de chargement

  // Supprimer un pari du panier
  const removeBet = (index) => {
    const newBasket = [...basket];
    newBasket.splice(index, 1);
    setBasket(newBasket);
  };

  // Ajouter un pari
  const handleAddMore = () => navigate("/matches");

  // Retour au panier
  const handleBackToCoupon = () => navigate("/bets");

  // Fonction pour récupérer l'adresse IP publique de l'utilisateur
  const getIpAddress = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.error("Erreur lors de l'obtention de l'IP : ", error);
      return null;
    }
  };

  // Gestion du mode de paiement
  const handlePaymentMethod = async (method) => {
    const totalAmount = basket.reduce((acc, bet) => acc + parseFloat(bet.amount || 0), 0);

    if (!user || !user.token) {
      alert("Veuillez vous connecter pour valider !");
      navigate("/login");
      return;
    }

    // Vérification du solde pour tous les modes de paiement
    if ((["Orange Money", "MTN Mobile Money"].includes(method) || ["Visa", "MasterCard"].includes(method)) && user.wallet < totalAmount) {
      alert("Fonds insuffisants dans le portefeuille !");
      return;
    }

    setLoading(true);  // Démarre l'indicateur de chargement

    const ipAddress = await getIpAddress();  // Récupérer l'IP

    try {
      if (method === "PayPal") {
        window.location.href = `/paypal?amount=${totalAmount}`;
        return;
      }

      if (["Visa", "MasterCard"].includes(method)) {
        window.location.href = `/stripe?amount=${totalAmount}`;
        return;
      }

      alert(`Paiement via ${method} en cours...`);

      const filteredBets = basket
        .filter((bet) => bet?.match?._id && bet?.choice && bet?.amount)
        .map((bet) => ({
          matchId: bet.match._id,
          choice: bet.choice,
          odds: Number(bet.odds || bet.combinedOdds || 1.0),
          amount: Number(bet.amount),
          potentialWin: Number(bet.potentialWin),
        }));

      console.log("📦 Données envoyées à savebasket:", filteredBets);

      // Sauvegarder les paris dans le panier
      const saveRes = await axios.post(
        `${API_URL}/api/bets/savebasket`,
        { paymentMethod: method, ipAddress, bets: filteredBets },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (saveRes.status !== 201 && saveRes.status !== 200) throw new Error("Erreur lors de l'enregistrement des paris.");

      // Génération de la facture
      const invoiceData = basket.map((b) => ({
        matchDescription: b.match ? `${b.match.team1} vs ${b.match.team2}` : "Match inconnu",
        choice: b.choice,
        odds: Number(b.odds || 1.0),
        amount: Number(b.amount),
      }));

      const invoiceRes = await axios.post(
        `${API_URL}/api/invoice/generate`,
        {
          basket: invoiceData,
          paymentMethod: method,
          user: { id: user._id, name: user.name, email: user.email },
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([invoiceRes.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `facture_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();

      alert(`✅ Paiement via ${method} effectué avec succès`);

      // Mise à jour du portefeuille de l'utilisateur
      const updatedUser = { ...user, wallet: user.wallet - totalAmount };
      setUser(updatedUser);  // Mettre à jour l'état avec le nouveau solde
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));

      setBasket([]);  // Vider le panier après le paiement
      navigate("/bets");
    } catch (error) {
      console.error("Erreur lors du paiement :", error);
      if (error.response?.data?.message) {
        alert("Erreur : " + error.response.data.message);
      } else {
        alert("Erreur lors de la sauvegarde du panier.");
      }
    } finally {
      setLoading(false);  // Arrête l'indicateur de chargement
    }
  };

  const total = basket.reduce((acc, bet) => acc + parseFloat(bet.potentialWin || 0), 0);

  const confirmPayment = (method) => {
    const confirm = window.confirm(`Confirmez-vous le paiement via ${method} ?`);
    if (confirm) {
      handlePaymentMethod(method);
    }
  };

  return (
    <div className="basket-page">
      <h2 className="basket-title">🧺 Votre Panier de Paris</h2>
      <p className="wallet-balance">
        💼 Solde Portefeuille : <strong>{user?.wallet ?? 0} $</strong>
      </p>

      {basket.length === 0 ? (
        <p className="empty-basket">
          Aucun pari ajouté. <br /> ➔ Allez vite sélectionner vos matchs !
        </p>
      ) : (
        <>
          <table className="basket-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Choix</th>
                <th>Côte</th>
                <th>Montant</th>
                <th>Gain Potentiel</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {basket.map((bet, index) => (
                <tr key={index}>
                  <td>{bet.match ? `${bet.match.team1} (${bet.match.scoreTeam1}) vs (${bet.match.scoreTeam2}) ${bet.match.team2}` : "Match indisponible"}</td>
                  <td>{bet.choices ? bet.choices.join(", ") : bet.choice}</td>
                  <td>{bet.odds || bet.combinedOdds}</td>
                  <td>{bet.amount} $</td>
                  <td>{bet.potentialWin} $</td>
                  <td>
                    <button className="remove-button" onClick={() => removeBet(index)}>❌ Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="payment-section">
            <p className="total-text">Total Potentiel : <strong>{total.toFixed(2)} $</strong></p>
            <div className="buttons">
              <button className="add-button" onClick={handleAddMore}>➕ Ajouter un Pari</button>
              <button className="pay-button" onClick={() => setShowPaymentOptions(!showPaymentOptions)}>💸 Choisir un Mode de Paiement</button>
              <button className="coupon-button" onClick={handleBackToCoupon}>🔙 Retour aux Coupons</button>
            </div>

            {showPaymentOptions && (
              <div className="payment-options">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="payment-method" onClick={() => confirmPayment(method.name)} style={{ cursor: "pointer" }}>
                    <img src={method.logo} alt={method.name} />
                    <p>{method.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {loading && <div className="loading">Chargement en cours...</div>}  {/* Indicateur de chargement */}
    </div>
  );
};

export default BetBasket;
