import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';

// Load environment variables
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in environment variables.");
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:3000', 'https://botbuddy-aadn.onrender.com'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());
app.use(morgan('dev'));

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/html', express.static(path.join(__dirname, 'public/html')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public/assets/favicon.ico')));

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

  // Validate message
  if (!message || typeof message !== 'string') {
    console.error('Invalid or missing message:', message);
    return res.status(400).json({ error: 'Invalid or missing message.' });
  }

  // Validate file (if provided)
  if (file && (!file.data || !file.mime_type)) {
    console.error('Invalid file structure:', file);
    return res.status(400).json({ error: 'Invalid file structure.' });
  }

  try {
    // Prepare request for Gemini API
    const parts = [{ text: message }];
    if (file?.data && file?.mime_type) {
      parts.push({ inline_data: file });
    }
    const requestBody = { contents: [{ parts }] };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    console.log('Sending request to Gemini API:', requestBody);

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await geminiRes.json();
    console.log("Gemini API status:", geminiRes.status);
    console.log("Gemini API response:", JSON.stringify(data, null, 2));

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

// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'html', '404.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Access the app at http://localhost:${PORT}/`);
});
