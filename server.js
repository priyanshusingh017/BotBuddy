import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("GEMINI_API_KEY:", GEMINI_API_KEY ? "Loaded" : "Missing");
console.log("Current working directory:", process.cwd());

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in environment variables.");
  process.exit(1); // Exit the process if API key is missing
}

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON requests

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (e.g., HTML, CSS, assets)
app.use(express.static(path.join(__dirname, 'public')));

// Serve login.html as the root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

// Extract Gemini API response content
function extractBotReply(data) {
  try {
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I didn't understand that."
    );
  } catch (e) {
    console.error("Error extracting bot reply:", e);
    return "Sorry, I couldn't process that.";
  }
}

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  const { message, file } = req.body;

  // Validate user message
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing message.' });
  }

  // Validate file if provided
  if (file && (!file.data || !file.mime_type)) {
    return res.status(400).json({ error: 'Invalid file structure.' });
  }

  try {
    // Prepare Gemini API request body
    const parts = [{ text: message }];
    if (file?.data && file?.mime_type) {
      parts.push({ inline_data: file });
    }
    const requestBody = { contents: [{ parts }] };

    // Send request to Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
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
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Access the app at http://localhost:${PORT}/`);
});
