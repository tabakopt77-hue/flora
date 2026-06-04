import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'backend', 'brain.json');

interface Memory {
  id: number;
  content: string;
  source: string;
  category: string;
  timestamp: string;
}

interface Quarantine {
  id: number;
  content: string;
  source: string;
  reason: string;
  status: string;
  timestamp: string;
}

interface DbSchema {
  memories: Memory[];
  quarantine: Quarantine[];
}

let dbInstance: any = null;

async function readDb(): Promise<DbSchema> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { memories: [], quarantine: [] };
  }
}

async function writeDb(data: DbSchema) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  // Ensure file exists
  const data = await readDb();
  await writeDb(data);

  dbInstance = {
    run: async (sql: string, ...params: any[]) => {
      const db = await readDb();
      if (sql.includes('INSERT INTO memories')) {
        db.memories.push({
          id: Date.now(),
          content: params[0],
          source: params[1],
          category: params[2],
          timestamp: new Date().toISOString()
        });
      } else if (sql.includes('INSERT INTO quarantine')) {
        db.quarantine.push({
          id: Date.now(),
          content: params[0],
          source: params[1],
          reason: params[2],
          status: 'pending',
          timestamp: new Date().toISOString()
        });
      } else if (sql.includes('UPDATE quarantine SET status = ? WHERE id = ?')) {
        const item = db.quarantine.find(q => q.id === params[1]);
        if (item) item.status = params[0];
      }
      await writeDb(db);
    },
    all: async (sql: string, ...params: any[]) => {
      const db = await readDb();
      if (sql.includes('SELECT * FROM quarantine WHERE status = "pending"')) {
        const results = db.quarantine.filter(q => q.status === 'pending');
        if (sql.includes('LIMIT 5')) {
          return results.slice(0, 5);
        }
        return results;
      }
      return [];
    }
  };

  return dbInstance;
}
