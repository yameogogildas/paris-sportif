import { useEffect } from "react";

const PayPalPayment = () => {
  useEffect(() => {
    const clientId = "AaiRGJDTMuI_ttq0dOUuVR1uet2YfUDP6IUGm8HNPFQgk3suCr0je428dYtnrmixgtRe51_mFxR1Y4KB";

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;

    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: async () => {
            const amount = 20.00; // 💰 Tu peux rendre dynamique si besoin
            try {
              const res = await fetch("http://localhost:5000/api/payment/paypal", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ total: amount }),
              });

              const data = await res.json();

              if (!res.ok) {
                console.error("❌ Erreur PayPal (backend) :", data.error);
                alert("Erreur PayPal : " + data.error);
                return;
              }

              console.log("✅ Order ID PayPal :", data.id);
              return data.id;
            } catch (err) {
              console.error("❌ Erreur réseau :", err);
              alert("Erreur réseau avec le serveur.");
            }
          },

          onApprove: async (data, actions) => {
            try {
              const details = await actions.order.capture();
              console.log("✅ Paiement PayPal capturé :", details);
              alert("✅ Paiement effectué par " + details.payer.name.given_name);
              window.location.href = "/bets"; // redirection après succès
            } catch (err) {
              console.error("❌ Erreur capture :", err);
              alert("Erreur lors de la validation du paiement.");
            }
          },

          onError: (err) => {
            console.error("❌ Erreur PayPal SDK :", err);
            alert("Erreur lors du paiement.");
          },
        }).render("#paypal-button-container");
      } else {
        console.error("❌ SDK PayPal introuvable");
        alert("Erreur : SDK PayPal non chargé.");
      }
    };

    script.onerror = () => {
      console.error("❌ Échec chargement SDK PayPal");
      alert("Erreur de chargement de PayPal.");
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ padding: "30px", color: "#fff" }}>
      <h2>Paiement PayPal</h2>
      <div id="paypal-button-container" />
    </div>
  );
};

export default PayPalPayment;
