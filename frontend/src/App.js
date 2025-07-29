import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import io from "socket.io-client";

import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminDashboard from "./components/AdminDashboard";
import MatchList from "./components/MatchList";
import BetBasket from "./components/BetBasket";
import UserBets from "./components/UserBets";
import Wallet from "./components/Wallet";
import Profile from "./components/Profile";
import PayPalPayment from "./components/PayPalPayment";
import StripePayment from "./components/StripePayment";
import InvoiceHistory from "./components/InvoiceHistory";
import BlockedPage from "./components/BlockedPage";
import Enable2FA from "./components/Enable2FA";
import Verify2FA from "./components/Verify2FA";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [basket, setBasket] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // ✅ Connexion WebSocket vers le backend (utilise l’IP de ton backend ici)
    const socket = io("http://192.168.153.1:5000", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🟢 WebSocket connecté :", socket.id);
      socket.emit("ping");
    });

    socket.on("pong", () => {
      console.log("✅ Pong reçu du serveur WebSocket");
    });

    socket.on("disconnect", () => {
      console.log("🔴 WebSocket déconnecté");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const backgroundStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL + '/images/gamblers.png'})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
  };

  return (
    <div style={backgroundStyle}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/blocked" element={<BlockedPage />} />
          <Route path="/enable-2fa" element={user ? <Enable2FA user={user} /> : <Navigate to="/login" />} />
          <Route path="/verify-2fa" element={user ? <Verify2FA user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.isAdmin ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/matches" element={
            user
              ? user.is2FAEnabled && !user.is2FAVerified
                ? <Navigate to="/verify-2fa" />
                : <MatchList user={user} basket={basket} setBasket={setBasket} />
              : <Navigate to="/login" />
          } />
          <Route path="/basket" element={
            user
              ? user.is2FAEnabled && !user.is2FAVerified
                ? <Navigate to="/verify-2fa" />
                : <BetBasket basket={basket} setBasket={setBasket} user={user} setUser={setUser} />
              : <Navigate to="/login" />
          } />
          <Route path="/bets" element={
            user
              ? user.is2FAEnabled && !user.is2FAVerified
                ? <Navigate to="/verify-2fa" />
                : <UserBets user={user} />
              : <Navigate to="/login" />
          } />
          <Route path="/wallet" element={
            user
              ? user.is2FAEnabled && !user.is2FAVerified
                ? <Navigate to="/verify-2fa" />
                : <Wallet user={user} />
              : <Navigate to="/login" />
          } />
          <Route path="/profile" element={
            user
              ? user.is2FAEnabled && !user.is2FAVerified
                ? <Navigate to="/verify-2fa" />
                : <Profile user={user} />
              : <Navigate to="/login" />
          } />
          <Route path="/invoices" element={
            user
              ? user.is2FAEnabled && !user.is2FAVerified
                ? <Navigate to="/verify-2fa" />
                : <InvoiceHistory user={user} />
              : <Navigate to="/login" />
          } />
          <Route path="/paypal" element={<PayPalPayment />} />
          <Route path="/stripe" element={<StripePayment />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
