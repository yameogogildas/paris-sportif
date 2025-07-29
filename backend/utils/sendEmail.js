import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();  // 🔥 Toujours charger les variables d'environnement

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,    // important: false pour STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    requireTLS: true, // 🛡️ 🔥 Obligatoire pour Gmail STARTTLS
  });

  await transporter.sendMail({
    from: `"Support Mon App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

export default sendEmail;
