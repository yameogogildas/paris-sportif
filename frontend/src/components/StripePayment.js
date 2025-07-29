import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeCheckoutForm from "./StripeCheckoutForm";

// Clé publique test Stripe
const stripePromise = loadStripe("pk_test_51NQAKVJ0EVZtzM5tRZFi5jzm6v0WPUZ5U6D1B1skGi9Vb7eM9Dgw5on94vOUXgZNNPqCmvZ4MwnobFJidFlpYgqr00gX5fRE5ZtY");

const StripePayment = ({ amount, onSuccess }) => {
  console.log("🎯 Montant dans StripePayment :", amount);

  return (
    <div style={{
      maxWidth: "400px",
      margin: "0 auto",
      padding: "20px",
      background: "#1c1c1c",
      borderRadius: "10px"
    }}>
      <h2 style={{ color: "#fff", textAlign: "center", marginBottom: "20px" }}>
        Paiement par carte
      </h2>
      <Elements stripe={stripePromise}>
        {/* ✅ On passe bien les props à StripeCheckoutForm via un wrapper */}
        <StripeWrapper amount={amount} onSuccess={onSuccess} />
      </Elements>
    </div>
  );
};

const StripeWrapper = (props) => {
  console.log("📦 Props dans StripeWrapper :", props);
  return <StripeCheckoutForm {...props} />;
};

export default StripePayment;
