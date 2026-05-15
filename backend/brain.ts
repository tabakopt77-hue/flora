import { GoogleGenAI, Type } from '@google/genai';
import { getDb } from './db.js';

let aiClient: GoogleGenAI | null = null;

function getAi() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is required');
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Watchdog: Filters incoming content
export async function processIncomingMemory(content: string, source: string) {
  const ai = getAi();
  
  const prompt = `
    You are the Watchdog and Classifier for a floral shop's AI brain.
    Analyze the following incoming message from a user or external system.
    
    1. Check if it's harmful, spam, toxic, or completely irrelevant gibberish. If so, flag it as "unsafe".
    2. If safe, classify it into one of these departments: 'floristry' (bouquets, design), 'care' (plant care), 'orders' (buying, delivery), 'general' (greetings, other).
    
    Message: "${content}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN, description: 'True if safe and relevant, false if spam/harmful' },
            reason: { type: Type.STRING, description: 'Reason for flagging if unsafe, or empty if safe' },
            category: { type: Type.STRING, description: 'floristry, care, orders, or general' }
          },
          required: ['isSafe', 'category']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const db = await getDb();

    if (result.isSafe) {
      // Send to Main Brain (Clustered by category)
      await db.run(
        'INSERT INTO memories (content, source, category) VALUES (?, ?, ?)',
        [content, source, result.category]
      );
      return { status: 'stored', category: result.category };
    } else {
      // Send to Quarantine
      await db.run(
        'INSERT INTO quarantine (content, source, reason) VALUES (?, ?, ?)',
        [content, source, result.reason || 'Flagged by Watchdog']
      );
      return { status: 'quarantined', reason: result.reason };
    }
  } catch (error) {
    console.error('Watchdog error:', error);
    throw error;
  }
}

// Background Task: "Sleep" processing of quarantine
export async function processQuarantine() {
  const db = await getDb();
  const pending = await db.all('SELECT * FROM quarantine WHERE status = "pending" LIMIT 5');
  
  if (pending.length === 0) return;

  const ai = getAi();
  console.log(`[Brain] Processing ${pending.length} quarantined items in background...`);

  for (const item of pending) {
    // Deep analysis during "free time"
    const prompt = `
      You are the deep-analysis module. Review this quarantined message: "${item.content}".
      It was flagged for: "${item.reason}".
      Is there any salvageable, safe knowledge here? Or should it be permanently deleted?
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING, description: "'salvage' or 'delete'" },
              salvagedContent: { type: Type.STRING, description: 'The safe part of the content, if any' },
              category: { type: Type.STRING, description: 'Category if salvaged' }
            },
            required: ['action']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');

      if (result.action === 'salvage' && result.salvagedContent) {
        await db.run('INSERT INTO memories (content, source, category) VALUES (?, ?, ?)', [result.salvagedContent, item.source + '_salvaged', result.category || 'general']);
        await db.run('UPDATE quarantine SET status = "salvaged" WHERE id = ?', [item.id]);
        console.log(`[Brain] Salvaged item ${item.id}`);
      } else {
        await db.run('UPDATE quarantine SET status = "deleted" WHERE id = ?', [item.id]);
        console.log(`[Brain] Permanently deleted item ${item.id}`);
      }
    } catch (e) {
      console.error(`[Brain] Failed to process quarantine item ${item.id}`, e);
    }
  }
}
