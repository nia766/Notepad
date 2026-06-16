import { Router } from 'express';
import { db } from '../db';

export const tagsRouter = Router();

tagsRouter.get('/', async (_req, res) => {
  const result = await db.execute(
    'SELECT t.*, COUNT(nt.note_id) as note_count FROM tags t LEFT JOIN note_tags nt ON nt.tag_id = t.id GROUP BY t.id ORDER BY t.name'
  );
  res.json(result.rows);
});

tagsRouter.delete('/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM tags WHERE id = ?', args: [req.params.id] });
  res.json({ success: true });
});
