import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

console.log("🔐 Identifiant chargé :", process.env.GD_USER);


// Route de test
app.get("/", (req, res) => {
  res.send("Serveur actif ✅");
});

// -----------------------------------------------------
// 🔹 Route réelle Geodynamics - Check-in
// -----------------------------------------------------
app.post("/api/geodynamics/checkin", async (req, res) => {
  const { employeeId, vehicleId, timestamp } = req.body; // ⬅️ SUPPRIMER lat, lon

  if (!employeeId || !timestamp) { // ⬅️ SUPPRIMER la vérification de lat/lon
    return res.status(400).json({ error: "Paramètres manquants." });
  }

  // Construction du header Basic Auth
  const rawAuth = `${process.env.GD_USER}|${process.env.GD_COMPANY}:${process.env.GD_PASS}`;
  const encodedAuth = Buffer.from(rawAuth).toString("base64");

  // ⬅️ CHANGER l'URL pour l'endpoint réel des clockings
  const apiUrl = "https://api.intellitracer.be/api/v2/clockings";

  console.log("🔐 Headers d'authentification:", {
    "Authorization": `Basic ${encodedAuth}`,
    "Content-Type": "application/json",
  });
  console.log("🌐 URL appelée:", apiUrl);
  console.log("📦 Payload envoyé:", {
    userId: employeeId,
    vehicleId: vehicleId || "456", // ⬅️ UTILISER vehicleId
    timestamp,
    // ⬅️ SUPPRIMER latitude et longitude
  });

  try {
    // Requête vers Geodynamics
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: employeeId,
        vehicleId: vehicleId || "456", // ⬅️ UTILISER vehicleId
        timestamp,
        // ⬅️ SUPPRIMER latitude et longitude
      }),
    });

    // ... reste du code inchangé
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi Geodynamics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------
// 🔹 Route réelle Geodynamics - Check-out
// -----------------------------------------------------
app.post("/api/geodynamics/checkout", async (req, res) => {
  const { employeeId, vehicleId, timestamp } = req.body; // ⬅️ SUPPRIMER lat, lon

  if (!employeeId || !timestamp) { // ⬅️ SUPPRIMER la vérification de lat/lon
    return res.status(400).json({ error: "Paramètres manquants." });
  }

  const rawAuth = `${process.env.GD_USER}|${process.env.GD_COMPANY}:${process.env.GD_PASS}`;
  const encodedAuth = Buffer.from(rawAuth).toString("base64");

  // ⬅️ CHANGER l'URL pour l'endpoint réel des clockings
  const apiUrl = "https://api.intellitracer.be/api/v2/clockings";

  console.log("🔐 Headers d'authentification:", {
    "Authorization": `Basic ${encodedAuth}`,
    "Content-Type": "application/json",
  });
  console.log("🌐 URL appelée:", apiUrl);
  console.log("📦 Payload envoyé:", {
    userId: employeeId,
    vehicleId: vehicleId || "456", // ⬅️ UTILISER vehicleId
    timestamp,
    // ⬅️ SUPPRIMER latitude et longitude
  });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: employeeId,
        vehicleId: vehicleId || "456", // ⬅️ UTILISER vehicleId
        timestamp,
        // ⬅️ SUPPRIMER latitude et longitude
      }),
    });

    if (!response.ok) {
      console.error("❌ Erreur API Geodynamics (checkout):", response.status, data);
      return res.status(response.status).json({ success: false, error: data });
    }

    console.log("✅ Envoi réussi (CHECK-OUT) pour", employeeId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi Geodynamics (checkout):", error);
    res.status(500).json({ success: false, error: error.message });
  }
});




// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
