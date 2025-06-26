
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/api/chat", async (req, res) => {
  try {
    const userInput = req.body.message;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: userInput }]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    res.json({ reply });
  } catch (err) {
    console.error("❌ Gemini REST error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch response from Gemini API" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


