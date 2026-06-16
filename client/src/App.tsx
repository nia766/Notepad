import { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { api } from './api';
import type { Notebook, Note, Tag } from './types';

type View = 'all' | 'notebook' | 'tag';

export default function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [view, setView] = useState<View>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedNote = notes.find(n => n.id === selectedNoteId) ?? null;
  const selectedNotebook = notebooks.find(n => n.id === selectedNote?.notebook_id);

  async function loadAll() {
    const [nbs, tgs] = await Promise.all([api.notebooks.list(), api.tags.list()]);
    setNotebooks(nbs);
    setTags(tgs);
  }

  async function loadNotes(params: { notebook_id?: string; tag_id?: string; q?: string } = {}) {
    const result = await api.notes.list(params);
    setNotes(result);
    if (result.length > 0 && !result.find(n => n.id === selectedNoteId)) {
      setSelectedNoteId(result[0].id);
    } else if (result.length === 0) {
      setSelectedNoteId(null);
    }
  }

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (searchQuery) {
      loadNotes({ q: searchQuery });
      setView('all');
    } else if (view === 'notebook' && selectedNotebookId) {
      loadNotes({ notebook_id: selectedNotebookId });
    } else if (view === 'tag' && selectedTagId) {
      loadNotes({ tag_id: selectedTagId });
    } else {
      loadNotes();
    }
  }, [view, selectedNotebookId, selectedTagId, searchQuery]);

  function handleSelectNotebook(id: string) {
    setSelectedNotebookId(id);
    setSelectedTagId(null);
    setView('notebook');
    setSearchQuery('');
  }

  function handleSelectTag(id: string) {
    setSelectedTagId(id);
    setSelectedNotebookId(null);
    setView('tag');
    setSearchQuery('');
  }

  function handleSelectAll() {
    setView('all');
    setSelectedNotebookId(null);
    setSelectedTagId(null);
    setSearchQuery('');
  }

  async function handleCreateNotebook(name: string) {
    const nb = await api.notebooks.create(name);
    setNotebooks(prev => [nb, ...prev]);
    setSelectedNotebookId(nb.id);
    setView('notebook');
  }

  async function handleRenameNotebook(id: string, name: string) {
    await api.notebooks.update(id, name);
    setNotebooks(prev => prev.map(n => n.id === id ? { ...n, name } : n));
  }

  async function handleDeleteNotebook(id: string) {
    if (!window.confirm('노트북을 삭제하면 모든 노트도 삭제됩니다. 계속하시겠습니까?')) return;
    await api.notebooks.delete(id);
    setNotebooks(prev => prev.filter(n => n.id !== id));
    if (selectedNotebookId === id) { setView('all'); setSelectedNotebookId(null); }
    loadNotes();
  }

  async function handleDeleteTag(id: string) {
    await api.tags.delete(id);
    setTags(prev => prev.filter(t => t.id !== id));
    if (selectedTagId === id) { setView('all'); setSelectedTagId(null); }
  }

  async function handleCreateNote() {
    if (!selectedNotebookId) return;
    const note = await api.notes.create(selectedNotebookId);
    setNotes(prev => [note, ...prev]);
    setSelectedNoteId(note.id);
    setNotebooks(prev => prev.map(n => n.id === selectedNotebookId ? { ...n, note_count: n.note_count + 1 } : n));
  }

  async function handleDeleteNote(id: string) {
    if (!window.confirm('이 노트를 삭제하시겠습니까?')) return;
    const note = notes.find(n => n.id === id);
    await api.notes.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setSelectedNoteId(remaining[0]?.id ?? null);
    }
    if (note) setNotebooks(prev => prev.map(n => n.id === note.notebook_id ? { ...n, note_count: Math.max(0, n.note_count - 1) } : n));
  }

  const handleUpdateNote = useCallback(async (id: string, data: { title: string; content: string; tags: string[] }) => {
    await api.notes.update(id, data);
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data, tags: data.tags.join(',') || null, updated_at: new Date().toISOString() } : n));
    loadAll();
  }, []);

  const noteListTitle = searchQuery
    ? `검색: "${searchQuery}"`
    : view === 'notebook' ? (notebooks.find(n => n.id === selectedNotebookId)?.name ?? '노트북')
    : view === 'tag' ? (tags.find(t => t.id === selectedTagId)?.name ?? '태그')
    : '모든 노트';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        notebooks={notebooks}
        tags={tags}
        selectedNotebookId={selectedNotebookId}
        selectedTagId={selectedTagId}
        view={view}
        onSelectAll={handleSelectAll}
        onSelectNotebook={handleSelectNotebook}
        onSelectTag={handleSelectTag}
        onCreateNotebook={handleCreateNotebook}
        onRenameNotebook={handleRenameNotebook}
        onDeleteNotebook={handleDeleteNotebook}
        onDeleteTag={handleDeleteTag}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />
      <NoteList
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        title={noteListTitle}
        canCreate={view === 'notebook' && !!selectedNotebookId}
      />
      <main className="flex-1 overflow-hidden">
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            notebook={selectedNotebook}
            onUpdate={handleUpdateNote}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <span className="text-6xl">📝</span>
            <p className="text-lg font-medium">노트를 선택하세요</p>
            <p className="text-sm">왼쪽에서 노트북을 만들고 노트를 추가해보세요</p>
          </div>
        )}
      </main>
    </div>
  );
}
