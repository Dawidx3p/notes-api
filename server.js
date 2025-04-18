import express from 'express';
import cors from 'cors';
import { openDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inicjalizacja bazy
const init = async () => {
  const db = await openDb();
  await db.exec(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    done INTEGER,
    type TEXT
  )`);
};
init();

// --- Notes Endpoints ---
app.get('/api/notes', async (req, res) => {
  const db = await openDb();
  const notes = await db.all('SELECT * FROM notes');
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body;
  const db = await openDb();
  await db.run('INSERT INTO notes (title, content) VALUES (?, ?)', [title, content]);
  res.status(201).json({ message: 'Notatka dodana' });
});

app.put('/api/notes/:id', async (req, res) => {
  const { title, content } = req.body;
  const db = await openDb();
  await db.run('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, req.params.id]);
  res.json({ message: 'Notatka zaktualizowana' });
});

app.delete('/api/notes/:id', async (req, res) => {
  const db = await openDb();
  await db.run('DELETE FROM notes WHERE id = ?', [req.params.id]);
  res.json({ message: 'Notatka usunięta' });
});

// --- Tasks Endpoints ---
app.get('/api/tasks', async (req, res) => {
  const type = req.query.type || 'one-time';
  const db = await openDb();
  const tasks = await db.all('SELECT * FROM tasks WHERE type = ?', [type]);
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const { text, type } = req.body;
  const db = await openDb();
  await db.run('INSERT INTO tasks (text, done, type) VALUES (?, 0, ?)', [text, type]);
  res.status(201).json({ message: 'Zadanie dodane' });
});

app.put('/api/tasks/:id', async (req, res) => {
  const { done } = req.body;
  const db = await openDb();
  await db.run('UPDATE tasks SET done = ? WHERE id = ?', [done ? 1 : 0, req.params.id]);
  res.json({ message: 'Zadanie zaktualizowane' });
});

app.delete('/api/tasks/:id', async (req, res) => {
  const db = await openDb();
  await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  res.json({ message: 'Zadanie usunięte' });
});

app.listen(PORT, () => {
  console.log(`API działa na http://localhost:${PORT}`);
});