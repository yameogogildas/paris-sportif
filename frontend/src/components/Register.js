import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, usePassword] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[._]).{6,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      return alert(
        "Le mot de passe doit contenir au moins 6 caractères, une majuscule, une lettre, et un caractère spécial ('.' ou '_')."
      );
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      // ✅ Affichage du QR Code après l'inscription
      setQrCode(data.qrCodeUrl);

      alert("Enregistrement réussi ! Veuillez scanner le QR Code pour activer la double authentification.");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="page-container">
      {!qrCode ? (
        <form onSubmit={handleSubmit} className="form">
          <h2>Inscription</h2>
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => usePassword(e.target.value)}
            required
          />
          <button type="submit">S'inscrire</button>
          <div className="links">
            <Link to="/login">Déjà un compte ? Connexion</Link>
          </div>
        </form>
      ) : (
        <div className="qr-section">
          <h3>✅ Veuillez scanner ce QR Code avec votre application Authenticator :</h3>
          <img src={qrCode} alt="QR Code 2FA" style={{ width: "250px", margin: "20px auto" }} />
          <button onClick={() => navigate("/login")} className="login-button">
            Aller à la connexion
          </button>
        </div>
      )}
    </div>
  );
};

export default Register;
