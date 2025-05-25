import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("GEMINI_API_KEY:", GEMINI_API_KEY);
console.log("Current working directory:", process.cwd());

const app = express();
app.use(cors());
app.use(express.json());

// Defensive: Warn if API key is missing
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in environment variables.");
  process.exit(1);
}

// Helper to extract Gemini's reply
function extractBotReply(data) {
  try {
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I didn't understand that."
    );
  } catch (e) {
    return "Sorry, I couldn't process that.";
  }
}

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const userFile = req.body.file;

  // Validate input
  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing message.' });
  }
  if (userFile && (!userFile.data || !userFile.mime_type)) {
    return res.status(400).json({ error: 'Invalid file structure.' });
  }

  try {
    // Prepare Gemini API request
    const parts = [{ text: userMessage }];
    if (userFile && userFile.data && userFile.mime_type) {
      parts.push({ inline_data: userFile });
    }
    const body = { contents: [{ parts }] };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await geminiRes.json();
    console.log("Gemini API status:", geminiRes.status);
    console.log("Gemini API response:", JSON.stringify(data));

    if (!geminiRes.ok) {
      console.error("Gemini API error:", data.error);
      return res.status(500).json({ error: data.error?.message || 'Gemini API error.' });
    }

    const botReply = extractBotReply(data);
    res.json({ generated_text: botReply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || 'Internal Server Error.' });
  }
});

// Health check endpoint (optional)
app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
