import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Enable2FA = ({ user }) => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:5000/api/auth/enable-2fa",
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setQrCode(data.qrCodeUrl);
      } catch (error) {
        console.error(error);
        alert("Erreur lors de la génération du QR Code.");
      }
    };

    fetchQRCode();
  }, [user.token]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>🔐 Activation de la Double Authentification</h2>
      <p>Scannez ce QR Code avec Google Authenticator :</p>
      {qrCode && <img src={qrCode} alt="QR Code 2FA" style={{ marginTop: "20px" }} />}
      <div style={{ marginTop: "30px" }}>
        <button onClick={() => navigate("/verify-2fa")}>Continuer</button>
      </div>
    </div>
  );
};

export default Enable2FA;
