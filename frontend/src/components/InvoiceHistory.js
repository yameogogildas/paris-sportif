import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./InvoiceHistory.css";

const InvoiceHistory = ({ user }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (!user || !user.token) {
      navigate("/login");
      return;
    }

    const fetchInvoices = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/invoice/history", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setInvoices(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des factures :", error);
      }
    };

    fetchInvoices();
  }, [user, navigate]);

  return (
    <div className="invoice-page">
      <h2 className="invoice-title">📄 Historique des Factures</h2>

      {invoices.length === 0 ? (
        <p className="empty-invoice">Aucune facture disponible.</p>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Méthode de Paiement</th>
              <th>Date</th>
              <th>Facture</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td>{invoice.userName}</td>
                <td>{invoice.userEmail}</td>
                <td>{invoice.paymentMethod}</td>
                <td>{new Date(invoice.createdAt).toLocaleString()}</td>
                <td>
                  <a
                    href={`http://localhost:5000/api/invoice/files/${invoice.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📥 Télécharger
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InvoiceHistory;
