import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [need2FA, setNeed2FA] = useState(false); // ✅ Gérer la double authentification permanente

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        token: token || undefined,
      });

      if (data.need2FASetup) {
        setQrCodeUrl(data.qrCodeUrl);
        setTempToken(data.tempToken);
        alert("✅ Veuillez scanner le QR Code avec Google Authenticator puis entrez le code de vérification.");
        setLoading(false);
        return;
      }

      if (!data.isActive) {
        navigate("/blocked", { state: { email } });
        setLoading(false);
        return;
      }

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      navigate(data.isAdmin ? "/admin" : "/matches");
    } catch (err) {
      setLoading(false);

      if (err.response?.status === 403 && err.response?.data?.allowAppeal) {
        navigate("/blocked", { state: { email } });
      } else if (err.response?.data?.message === "Veuillez fournir le code de vérification.") {
        // ✅ Si le backend demande un code 2FA
        setNeed2FA(true);
        alert("Veuillez entrer le code Google Authenticator.");
      } else {
        const msg = err.response?.data?.message || "Erreur de connexion.";
        alert(`❌ ${msg}`);
      }
    }
  };

  const handleTokenChange = async (e) => {
    const newToken = e.target.value;
    setToken(newToken);

    if (newToken.length === 6) {
      setLoading(true);
      try {
        const { data } = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
          token: newToken,
        });

        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
        navigate(data.isAdmin ? "/admin" : "/matches");
      } catch (err) {
        setLoading(false);
        const msg = err.response?.data?.message || "Code invalide.";
        alert(`❌ ${msg}`);
      }
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="form">
        <h2>Connexion</h2>

        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Champ QR Code + Code 2FA */}
        {(qrCodeUrl || need2FA) && (
          <div className="qr-section animated">
            {qrCodeUrl && (
              <>
                <h4>Scannez le QR Code avec Google Authenticator</h4>
                <img src={qrCodeUrl} alt="QR Code" style={{ width: "200px", marginBottom: "15px" }} />
              </>
            )}
            <input
              type="text"
              placeholder="Entrez le code 2FA"
              value={token}
              onChange={handleTokenChange}
              maxLength={6}
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Chargement..." : qrCodeUrl || need2FA ? "Valider le code" : "Se connecter"}
        </button>

        <div className="links">
          <Link to="/forgot-password">🔐 Mot de passe oublié ?</Link>
          <Link to="/register">📝 Créer un compte</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
