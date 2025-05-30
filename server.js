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

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://botbuddy-aadn.onrender.com',
      ];
      if (!origin || allowedOrigins.includes(origin) || origin === 'null') {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

// Increase JSON body size limit to support file uploads
app.use(express.json({ limit: '5mb' }));

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

// Serve login.html as root page
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

  if (!message || typeof message !== 'string') {
    console.error('Invalid or missing message:', message);
    return res.status(400).json({ success: false, error: 'Invalid or missing message.' });
  }

  if (file) {
    // Basic validation for file object structure and size limit (~3MB here)
    if (
      !file.data ||
      !file.mime_type ||
      typeof file.data !== 'string' ||
      typeof file.mime_type !== 'string' ||
      Buffer.byteLength(file.data, 'base64') > 3 * 1024 * 1024
    ) {
      console.error('Invalid or too large file:', file);
      return res.status(400).json({ success: false, error: 'Invalid or too large file.' });
    }
  }

  try {
    const parts = [{ text: message }];
    if (file?.data && file?.mime_type) {
      parts.push({ inline_data: file });
    }
    const requestBody = { contents: [{ parts }] };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    console.log('Sending request to Gemini API:', JSON.stringify(requestBody));

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
      return res.status(geminiRes.status).json({
        success: false,
        error: data.error?.message || 'Gemini API error.'
      });
    }

    const botReply = extractBotReply(data);
    return res.json({ success: true, generated_text: botReply });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

// Handle 404 errors for API and frontend
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    // API 404 JSON response
    res.status(404).json({ success: false, error: 'API endpoint not found.' });
  } else {
    // Serve 404 HTML page for frontend routes
    res.status(404).sendFile(path.join(__dirname, 'public', 'html', '404.html'));
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Access the app at http://localhost:${PORT}/`);
});
