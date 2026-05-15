import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { processIncomingMemory, processQuarantine } from './backend/brain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Set up rate limiter
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  });

  // Apply rate limiter to all /api/ routes
  app.use('/api/', apiLimiter);

  // API Routes for the "Brain"
  app.post('/api/brain/ingest', async (req, res) => {
    try {
      const { content, source } = req.body;
      if (!content || !source) {
        return res.status(400).json({ error: 'Content and source are required' });
      }

      // Watchdog processes the incoming memory
      const result = await processIncomingMemory(content, source);
      res.json({ success: true, result });
    } catch (error) {
      console.error('Ingest error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Webhook for Telegram Bot (Placeholder for external API connection)
  app.post('/api/webhook/telegram', async (req, res) => {
    try {
      // Telegram sends updates here. We extract the message text.
      const message = req.body.message?.text;
      if (message) {
        // Feed it to the brain
        await processIncomingMemory(message, 'telegram');
      }
      res.sendStatus(200); // Always acknowledge Telegram
    } catch (error) {
      console.error('Telegram webhook error:', error);
      res.sendStatus(500);
    }
  });

  // Background Task: "Sleep" processing of quarantine every 5 minutes
  setInterval(() => {
    processQuarantine().catch(console.error);
  }, 5 * 60 * 1000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`[Brain] Watchdog and Clustering systems initialized.`);
  });
}

startServer();
