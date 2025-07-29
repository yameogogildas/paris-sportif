import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Verify2FA = ({ user }) => {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/auth/verify-2fa",
        { token },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("✅ Authentification 2FA réussie !");
      navigate("/matches");
    } catch (error) {
      console.error(error);
      alert("❌ Code invalide. Réessayez.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>✅ Vérification du Code 2FA</h2>
      <form onSubmit={handleVerify} style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Entrez le code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px", width: "200px" }}
        />
        <div style={{ marginTop: "20px" }}>
          <button type="submit">Vérifier</button>
        </div>
      </form>
    </div>
  );
};

export default Verify2FA;
