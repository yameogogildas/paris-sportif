import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[._]).{6,}$/;
    return regex.test(pwd);
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage("❌ Le mot de passe doit contenir au moins 6 caractères, une majuscule, une lettre et un caractère spécial ('.' ou '_').");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        newPassword: newPassword, // ✅ Correction ici
      });

      setMessage("✅ Mot de passe réinitialisé avec succès");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setMessage("⏳ Le lien est invalide ou a expiré.");
      } else {
        setMessage("❌ Erreur lors de la réinitialisation du mot de passe.");
      }
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '60px auto',
      padding: '20px',
      background: '#fff',
      borderRadius: '10px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center' }}>Nouveau mot de passe</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ display: 'block', margin: '10px auto', padding: '10px', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Confirmer mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ display: 'block', margin: '10px auto', padding: '10px', width: '100%' }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Valider
        </button>
      </form>
      {message && (
        <p style={{
          textAlign: 'center',
          marginTop: '15px',
          color: message.startsWith('✅') ? 'green' : 'red'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ResetPassword;
