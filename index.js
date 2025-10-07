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
import fetch from "node-fetch"; // ajoute ceci tout en haut si pas déjà importé

app.post("/api/geodynamics/checkin", async (req, res) => {
  const { employeeId, lat, lon, timestamp } = req.body;

  if (!employeeId || !lat || !lon || !timestamp) {
    return res.status(400).json({ error: "Paramètres manquants." });
  }

  // Construction du header Basic Auth
  const rawAuth = `${process.env.GD_USER}|${process.env.GD_COMPANY}:${process.env.GD_PASS}`;
  const encodedAuth = Buffer.from(rawAuth).toString("base64");

  // Exemple d’URL de l’API (endpoint réel à confirmer avec ton compte)
  const apiUrl = "https://api.intellitracer.be/api/v2/timeclock/start";

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
        timestamp,
        latitude: lat,
        longitude: lon,
      }),
    });

    // Lire le corps une seule fois
    const rawBody = await response.text();
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { raw: rawBody }; // s'il n'y a pas de JSON, on garde le texte brut
    }



    // Vérifie si la réponse est valide
    if (!response.ok) {
      console.error("❌ Erreur API Geodynamics:", response.status, data);
      return res.status(response.status).json({ success: false, error: data });
    }

    console.log("✅ Envoi réussi à Geodynamics pour", employeeId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi Geodynamics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------
// 🔹 Route réelle Geodynamics - Check-out
// -----------------------------------------------------
app.post("/api/geodynamics/checkout", async (req, res) => {
  const { employeeId, lat, lon, timestamp } = req.body;

  if (!employeeId || !lat || !lon || !timestamp) {
    return res.status(400).json({ error: "Paramètres manquants." });
  }

  const rawAuth = `${process.env.GD_USER}|${process.env.GD_COMPANY}:${process.env.GD_PASS}`;
  const encodedAuth = Buffer.from(rawAuth).toString("base64");

  // endpoint de sortie
  const apiUrl = "https://api.intellitracer.be/api/v2/timeclock/stop";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: employeeId,
        timestamp,
        latitude: lat,
        longitude: lon,
      }),
    });

    // Lire le corps une seule fois
    const rawBody = await response.text();
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { raw: rawBody }; // s'il n'y a pas de JSON, on garde le texte brut
    }



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
