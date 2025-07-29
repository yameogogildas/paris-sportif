import { useState, useEffect } from 'react';
import Wallet from '../components/Wallet'; // <-- Ton composant Wallet.js

const WalletPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  if (!user) return <div>Chargement...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Portefeuille de {user.name}</h1>
      <Wallet user={user} />
    </div>
  );
};

export default WalletPage;
