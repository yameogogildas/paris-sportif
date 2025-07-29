import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import speakeasy from 'speakeasy';
import { generateQRCode } from '../utils/qrcodeGenerator.js';

// 🔐 Génère un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ➕ Inscription
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin: role === 'admin',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔑 Connexion avec 2FA
export const login = async (req, res) => {
  const { email, password, token } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }

    // 🔒 Vérification de l’état actif
    if (!user.isActive) {
      return res.status(403).json({
        message: "L'administrateur vous a désactivé car vous n'avez pas suivi les conditions d'utilisation.",
        allowAppeal: true,
      });
    }

    // Si l'utilisateur n'a pas encore activé la 2FA
    if (!user.twoFASecret) {
      const secret = speakeasy.generateSecret({ name: `GAMBLERS - ${user.email}` });
      user.twoFASecret = secret.base32;
      await user.save();

      const qrCodeUrl = await generateQRCode(secret.otpauth_url);

      return res.status(200).json({
        message: 'Veuillez configurer la double authentification.',
        qrCodeUrl,
        tempToken: generateToken(user._id),
        need2FASetup: true,
      });
    }

    // Si la 2FA est activée mais pas de token fourni
    if (!token) {
      return res.status(401).json({ message: 'Veuillez fournir le code de vérification.' });
    }

    // Vérification du code OTP
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Code de vérification invalide.' });
    }

    // ✅ Si tout est bon
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔁 Mot de passe oublié (avec expiration 24h)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 🔁 Expiration mise à 24 heures
    user.resetToken = hashedToken;
    user.resetTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    await sendEmail({
      to: email,
      subject: '🔐 Réinitialisation du mot de passe',
      text: `Clique ici pour réinitialiser ton mot de passe : ${resetURL}`,
    });

    res.json({ message: 'Lien de réinitialisation envoyé par email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔁 Réinitialisation du mot de passe
export const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: '⏳ Lien invalide ou expiré.' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: '✅ Mot de passe réinitialisé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
