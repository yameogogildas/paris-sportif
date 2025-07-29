import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './wallet.css'; // ✅ import du fichier CSS

const Wallet = ({ user }) => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
      return;
    }
    fetchWallet();
  }, [user]);

  const fetchWallet = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/wallet', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBalance(data.balance);
    } catch (error) {
      console.error("Erreur Wallet :", error);
      if (error.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
      }
    }
  };

  const handleDeposit = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/wallet/deposit',
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchWallet();
      setAmount('');
    } catch (error) {
      alert("Erreur lors du dépôt.");
    }
  };

  const handleWithdraw = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/wallet/withdraw',
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchWallet();
      setAmount('');
    } catch (error) {
      alert("Erreur lors du retrait.");
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-box">
        <h2 className="wallet-title">💰 Mon Portefeuille</h2>
        <p className="wallet-balance">
          Solde actuel : <strong>{balance.toFixed(2)} FCFA</strong>
        </p>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Montant"
          className="wallet-input"
        />

        <div className="wallet-buttons">
          <button onClick={handleDeposit} className="deposit-btn">Déposer</button>
          <button onClick={handleWithdraw} className="withdraw-btn">Retirer</button>
        </div>

        {/* ✅ Bouton de retour en bas */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button onClick={() => navigate('/matches')} className="return-btn">
            ← Retour à la page des matchs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
