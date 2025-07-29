import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { PassThrough } from 'stream';
import Invoice from '../models/Invoice.js';
import QRCode from 'qrcode'; // 📦 Importation du QR Code

// ✅ Générer la facture et l'envoyer par mail avec QR Code
export const generateInvoice = async (req, res) => {
  try {
    const { basket, paymentMethod, user } = req.body;

    const doc = new PDFDocument();
    const stream = new PassThrough();
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const fileName = `facture_${Date.now()}.pdf`;

      // ✅ Configuration SMTP fiable
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000,
      });

      await transporter.sendMail({
        from: `"Paris Sportif" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Votre Facture de Paiement',
        text: 'Merci pour votre paiement. Vous trouverez votre facture en pièce jointe.',
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
          },
        ],
      });

      console.log('✅ Email envoyé avec succès');

      // ✅ Sauvegarde de la facture
      await Invoice.create({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        paymentMethod,
        fileName,
      });

      // ✅ Réponse HTTP avec le PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.end(pdfBuffer);
    });

    // ✅ Contenu de la facture
    doc.fontSize(20).text('Facture de Paiement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Nom: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Méthode de paiement: ${paymentMethod}`);
    doc.moveDown();

    let total = 0;
    basket.forEach((bet, index) => {
      doc.text(`${index + 1}. Match: ${bet.matchDescription}`);
      doc.text(`   Choix: ${bet.choice}`);
      doc.text(`   Côte: ${bet.odds}`);
      doc.text(`   Montant: ${bet.amount} $`);
      doc.moveDown();
      total += bet.amount;
    });

    doc.text(`Total payé: ${total.toFixed(2)} $`, { align: 'right' });
    doc.moveDown(2);

    // ✅ QR Code
    const qrData = `Nom: ${user.name}\nEmail: ${user.email}\nTotal payé: ${total.toFixed(2)} $`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    doc.image(qrCodeImage, {
      fit: [150, 150],
      align: 'center',
      valign: 'center',
    });

    doc.end();
  } catch (error) {
    console.error("Erreur lors de la génération ou l'envoi de la facture:", error);
    res.status(500).json({ message: "Erreur lors de la génération ou l'envoi de la facture" });
  }
};

// ✅ Historique des factures
export const getInvoiceHistory = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
