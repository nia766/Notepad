import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDb } from './db';
import { notebooksRouter } from './routes/notebooks';
import { notesRouter } from './routes/notes';
import { tagsRouter } from './routes/tags';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/notebooks', notebooksRouter);
app.use('/api/notes', notesRouter);
app.use('/api/tags', tagsRouter);

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(console.error);
