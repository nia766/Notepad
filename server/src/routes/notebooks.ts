import { Router } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';

export const notebooksRouter = Router();

notebooksRouter.get('/', async (_req, res) => {
  const result = await db.execute(
    'SELECT n.*, COUNT(notes.id) as note_count FROM notebooks n LEFT JOIN notes ON notes.notebook_id = n.id GROUP BY n.id ORDER BY n.updated_at DESC'
  );
  res.json(result.rows);
});

notebooksRouter.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute({
    sql: 'INSERT INTO notebooks (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
    args: [id, name.trim(), now, now],
  });
  res.json({ id, name: name.trim(), created_at: now, updated_at: now, note_count: 0 });
});

notebooksRouter.put('/:id', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const now = new Date().toISOString();
  await db.execute({
    sql: 'UPDATE notebooks SET name = ?, updated_at = ? WHERE id = ?',
    args: [name.trim(), now, req.params.id],
  });
  res.json({ success: true });
});

notebooksRouter.delete('/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM notebooks WHERE id = ?', args: [req.params.id] });
  res.json({ success: true });
});
