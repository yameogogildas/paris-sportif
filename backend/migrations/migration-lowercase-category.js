import mongoose from "mongoose";
import dotenv from "dotenv";
import Match from "../models/Match.js"; // Assure-toi que le chemin est correct

dotenv.config();

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connexion à MongoDB réussie.");

    const result = await Match.updateMany({}, [
      { $set: { category: { $toLower: "$category" } } }
    ]);

    console.log(`✅ Migration terminée. ${result.modifiedCount} documents mis à jour.`);

    await mongoose.disconnect();
    console.log("🔌 Déconnecté de MongoDB.");
  } catch (error) {
    console.error("❌ Erreur pendant la migration :", error);
  }
};

runMigration();
