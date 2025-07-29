import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";

const StripeCheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  console.log("✅ amount reçu dans CheckoutForm :", amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const montant = Number(amount);
    if (!montant || isNaN(montant) || montant <= 0) {
      console.error("❌ Montant invalide dans CheckoutForm :", amount);
      alert("Montant invalide côté client");
      return;
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/payment/stripe", {
        amount: montant,
      });

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.paymentIntent?.status === "succeeded") {
        alert("✅ Paiement réussi !");
        onSuccess();
      } else {
        alert("❌ Paiement échoué.");
      }
    } catch (error) {
      console.error("❌ Erreur Stripe :", error.message);
      alert("Erreur de paiement : " + (error.response?.data?.error || "Inconnue"));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe} style={{ marginTop: "20px" }}>
        Payer
      </button>
    </form>
  );
};

export default StripeCheckoutForm;
