import { Link } from "react-router-dom";

const Home = () => (
  <div style={styles.container}>
    <h1 style={styles.title}>Bienvenue sur Paris Sportif</h1>
    <div style={styles.buttons}>
      <Link to="/login" style={styles.button}>Connexion</Link>
      <Link to="/register" style={styles.button}>Inscription</Link>
    </div>
  </div>
);

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a", // bleu foncé
    color: "white",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
  },
  buttons: {
    display: "flex",
    gap: "20px",
  },
  button: {
    padding: "10px 20px",
    background: "#1e40af", // bleu plus clair
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontSize: "1.2rem",
  },
};

export default Home;
