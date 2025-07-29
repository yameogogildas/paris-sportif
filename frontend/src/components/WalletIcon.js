import { useState, useEffect } from "react";
import axios from "axios";
import "./WalletIcon.css";

const WalletIcon = ({ user, setUser }) => {
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(user?.wallet || 0);

  useEffect(() => {
    if (user?.token) {
      refreshWallet();
    }
  }, [user]);

  const refreshWallet = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/wallet", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBalance(data.balance);
      const updatedUser = { ...user, wallet: data.balance };
      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Erreur de récupération du solde :", err);
    }
  };

  const handleTransaction = async (type) => {
    try {
      const url = `http://localhost:5000/api/wallet/${type}`;
      await axios.post(url, { amount: parseFloat(amount) }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAmount('');
      refreshWallet();
    } catch (err) {
      alert("Erreur lors de la transaction.");
      console.error(err);
    }
  };

  return (
    <div className="wallet-icon-container">
      <div className="wallet-button" onClick={() => setVisible(!visible)}>
        💼 <span>{balance.toFixed(2)} FCFA</span>
      </div>

      {visible && (
        <div className="wallet-popup">
          <p><strong>Solde :</strong> {balance.toFixed(2)} FCFA</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant"
            className="wallet-input"
          />
          <div className="wallet-actions">
            <button onClick={() => handleTransaction("deposit")} className="wallet-deposit">Déposer</button>
            <button onClick={() => handleTransaction("withdraw")} className="wallet-withdraw">Retirer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletIcon;
