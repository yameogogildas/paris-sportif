import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      alert("Lien de réinitialisation envoyé !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi de l'email");
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="form">
        <h2>Mot de passe oublié</h2>
        <input
          type="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Envoyer</button>
        <div className="links">
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
