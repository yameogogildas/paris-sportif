import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 0 15px rgba(0,0,0,0.1)" }}>
      <div style={{ textAlign: "center" }}>
        <img
          src="/image/default-profile.png"
          alt="Icone"
          style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" }}
        />
        <h2 style={{ marginBottom: "5px" }}>{user.name}</h2>
        <p style={{ color: "#555" }}>{user.email}</p>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => navigate("/forgot-password")}
          style={{ padding: "10px 20px", background: "#007BFF", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          🔐 Mot de passe oublié ?
        </button>
      </div>
    </div>
  );
};

export default Profile;
