import { useState } from "react";
import axios from "axios";

const AppealForm = ({ email }) => {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/appeal", { email, message });
      setSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Erreur lors de l'envoi de votre message.");
    }
  };

  return submitted ? (
    <p style={{ color: "green" }}>📨 Message envoyé avec succès !</p>
  ) : (
    <form onSubmit={handleSubmit} className="appeal-form">
      <h3>⚠️ Votre compte est désactivé</h3>
      <textarea
        rows="4"
        placeholder="Expliquez pourquoi vous contestez..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <button type="submit">Envoyer la contestation</button>
    </form>
  );
};

export default AppealForm;
