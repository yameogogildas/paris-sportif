import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }, // ✅ Pour activation/désactivation
  resetToken: { type: String },
  resetTokenExpire: { type: Date },
  twoFASecret: { type: String }, // ✅ Clé secrète pour la double authentification
}, {
  timestamps: true // ✅ Pour createdAt / updatedAt automatiques
});

// 🔐 Hachage automatique du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Ne pas re-hasher si inchangé
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Méthode pour comparer le mot de passe entré avec le hash stocké
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
