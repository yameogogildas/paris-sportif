// resetAdminPassword.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js'; // 🛠️ chemin vers ton modèle User

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    const email = 'admin@example.com'; // 🔁 mets ici l'email exact de l'admin
    const newPassword = 'AdminNew123_'; // 🔁 le nouveau mot de passe (fort !)

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ Admin introuvable');
      process.exit(1);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log('✅ Mot de passe admin réinitialisé avec succès');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
};

resetAdminPassword();
