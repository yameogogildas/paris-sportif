import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./BlockedPage.css";

const BlockedPage = () => {
  const location = useLocation();
  const { email } = location.state || {};
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/appeal", { email, message });
      setFeedback("✅ Votre contestation a été envoyée à l'administrateur.");
      setMessage("");
    } catch (error) {
      setFeedback("❌ Une erreur s'est produite lors de l'envoi.");
    }
  };

  return (
    <div className="blocked-page">
      <div className="blocked-card">
        <h1 className="blocked-title">🚫 Accès restreint</h1>
        <p className="blocked-message">
          Votre compte a été désactivé car vous n'avez pas respecté les conditions d'utilisation.
        </p>

        <p className="blocked-instruction">
          Si vous souhaitez contester cette décision, veuillez nous envoyer un message ci-dessous :
        </p>

        <form className="blocked-form" onSubmit={handleSubmit}>
          <textarea
            className="blocked-textarea"
            placeholder="Expliquez les raisons pour lesquelles vous souhaitez réactiver votre compte..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
          />
          <button className="blocked-button" type="submit">📩 Envoyer ma contestation</button>
        </form>

        {feedback && <p className="blocked-feedback">{feedback}</p>}

        <Link to="/login" className="blocked-link">🔙 Retour à la page de connexion</Link>
      </div>
    </div>
  );
};

export default BlockedPage;
