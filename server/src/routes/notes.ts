import { Router } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';

export const notesRouter = Router();

notesRouter.get('/', async (req, res) => {
  const { notebook_id, tag_id, q } = req.query;
  let sql = `
    SELECT n.*, GROUP_CONCAT(t.name) as tags
    FROM notes n
    LEFT JOIN note_tags nt ON nt.note_id = n.id
    LEFT JOIN tags t ON t.id = nt.tag_id
  `;
  const args: string[] = [];
  const where: string[] = [];

  if (notebook_id) { where.push('n.notebook_id = ?'); args.push(notebook_id as string); }
  if (tag_id) { where.push('nt.tag_id = ?'); args.push(tag_id as string); }
  if (q) { where.push("(n.title LIKE ? OR n.content LIKE ?)"); args.push(`%${q}%`, `%${q}%`); }

  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' GROUP BY n.id ORDER BY n.updated_at DESC';

  const result = await db.execute({ sql, args });
  res.json(result.rows);
});

notesRouter.post('/', async (req, res) => {
  const { notebook_id, title, content } = req.body;
  if (!notebook_id) return res.status(400).json({ error: 'notebook_id required' });
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute({
    sql: 'INSERT INTO notes (id, notebook_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, notebook_id, title || 'Untitled', content || '', now, now],
  });
  await db.execute({ sql: 'UPDATE notebooks SET updated_at = ? WHERE id = ?', args: [now, notebook_id] });
  res.json({ id, notebook_id, title: title || 'Untitled', content: content || '', created_at: now, updated_at: now, tags: null });
});

notesRouter.put('/:id', async (req, res) => {
  const { title, content, tags } = req.body;
  const now = new Date().toISOString();
  const note = await db.execute({ sql: 'SELECT notebook_id FROM notes WHERE id = ?', args: [req.params.id] });
  if (!note.rows.length) return res.status(404).json({ error: 'Not found' });

  await db.execute({
    sql: 'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?',
    args: [title, content, now, req.params.id],
  });
  await db.execute({
    sql: 'UPDATE notebooks SET updated_at = ? WHERE id = ?',
    args: [now, note.rows[0].notebook_id as string],
  });

  if (Array.isArray(tags)) {
    await db.execute({ sql: 'DELETE FROM note_tags WHERE note_id = ?', args: [req.params.id] });
    for (const tagName of tags) {
      const trimmed = tagName.trim();
      if (!trimmed) continue;
      let tagId: string;
      const existing = await db.execute({ sql: 'SELECT id FROM tags WHERE name = ?', args: [trimmed] });
      if (existing.rows.length) {
        tagId = existing.rows[0].id as string;
      } else {
        tagId = randomUUID();
        await db.execute({ sql: 'INSERT INTO tags (id, name) VALUES (?, ?)', args: [tagId, trimmed] });
      }
      await db.execute({ sql: 'INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)', args: [req.params.id, tagId] });
    }
  }
  res.json({ success: true });
});

notesRouter.delete('/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM notes WHERE id = ?', args: [req.params.id] });
  res.json({ success: true });
});
