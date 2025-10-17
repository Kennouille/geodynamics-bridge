import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

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
  const { employeeId, vehicleId, timestamp } = req.body;

  if (!employeeId || !timestamp) {
    return res.status(400).json({ error: "Paramètres manquants." });
  }

  // Construction du header Basic Auth
  const rawAuth = `${process.env.GD_USER}|${process.env.GD_COMPANY}:${process.env.GD_PASS}`;
  const encodedAuth = Buffer.from(rawAuth).toString("base64");

  const apiUrl = "https://api.intellitracer.be/api/v2/clocking";

  console.log("🔐 Headers d'authentification:", {
    "Authorization": `Basic ${encodedAuth}`,
    "Content-Type": "application/json",
  });
  console.log("🌐 URL appelée:", apiUrl);
  console.log("📦 Payload envoyé:", {
    ClockingType: "1",
    UserCode: employeeId,
    VehicleCode: vehicleId || "456",
    DateTimeUtc: timestamp,
  });

  try {
    // Requête vers Geodynamics
    const response = await fetch(apiUrl, {
      method: "PUT", // ⬅️ CHANGER POST EN PUT
      headers: {
        "Authorization": `Basic ${encodedAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ClockingType: "1", // ou "2" pour checkout
        UserCode: employeeId,
        VehicleCode: vehicleId || "456",
        DateTimeUtc: timestamp,
      }),
    });

    console.log("📡 Réponse Geodynamics - Status:", response.status);
    const rawBody = await response.text();
    console.log("📡 Réponse Geodynamics - Body:", rawBody);

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { raw: rawBody };
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
  const { employeeId, vehicleId, timestamp } = req.body;

  if (!employeeId || !timestamp) {
    return res.status(400).json({ error: "Paramètres manquants." });
  }

  const rawAuth = `${process.env.GD_USER}|${process.env.GD_COMPANY}:${process.env.GD_PASS}`;
  const encodedAuth = Buffer.from(rawAuth).toString("base64");

  const apiUrl = "https://api.intellitracer.be/api/v2/clocking";

  console.log("🔐 Headers d'authentification:", {
    "Authorization": `Basic ${encodedAuth}`,
    "Content-Type": "application/json",
  });
  console.log("🌐 URL appelée:", apiUrl);
  console.log("📦 Payload envoyé:", {
    ClockingType: "2",
    UserCode: employeeId,
    VehicleCode: vehicleId || "456",
    DateTimeUtc: timestamp,
  });

  try {
    const response = await fetch(apiUrl, {
      method: "PUT", // ⬅️ CHANGER POST EN PUT
      headers: {
        "Authorization": `Basic ${encodedAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ClockingType: "1", // ou "2" pour checkout
        UserCode: employeeId,
        VehicleCode: vehicleId || "456",
        DateTimeUtc: timestamp,
      }),
    });

    console.log("📡 Réponse Geodynamics - Status:", response.status);
    const rawBody = await response.text();
    console.log("📡 Réponse Geodynamics - Body:", rawBody);

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { raw: rawBody };
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