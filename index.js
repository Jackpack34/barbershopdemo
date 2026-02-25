const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 🔐 Zezwól tylko Twojemu frontendowi
app.use(cors({
  origin: "https://twojadomena.pl" // <-- PODMIEŃ NA SWOJĄ DOMENĘ
}));

app.use(express.json());

// 📌 Test endpoint (sprawdź czy backend działa)
app.get("/", (req, res) => {
  res.json({ message: "Backend działa 🚀" });
});

// 📩 Endpoint do rezerwacji
app.post("/send-booking", async (req, res) => {
  try {
    const { name, email, date } = req.body;

    if (!name || !email || !date) {
      return res.status(400).json({ error: "Brakuje danych" });
    }

    console.log("Nowa rezerwacja:", name, email, date);

    // 👉 tutaj później możesz dodać wysyłanie maila

    res.status(200).json({ message: "Rezerwacja wysłana" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// 📩 Endpoint do kontaktu
app.post("/send-contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Brakuje danych" });
    }

    console.log("Nowa wiadomość:", name, email, message);

    res.status(200).json({ message: "Wiadomość wysłana" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});