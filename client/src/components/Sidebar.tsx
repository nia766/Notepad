import { useState } from 'react';
import { BookOpen, Tag, Search, Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight, StickyNote } from 'lucide-react';
import type { Notebook, Tag as TagType } from '../types';

interface Props {
  notebooks: Notebook[];
  tags: TagType[];
  selectedNotebookId: string | null;
  selectedTagId: string | null;
  view: 'all' | 'notebook' | 'tag';
  onSelectAll: () => void;
  onSelectNotebook: (id: string) => void;
  onSelectTag: (id: string) => void;
  onCreateNotebook: (name: string) => void;
  onRenameNotebook: (id: string, name: string) => void;
  onDeleteNotebook: (id: string) => void;
  onDeleteTag: (id: string) => void;
  onSearch: (q: string) => void;
  searchQuery: string;
}

export function Sidebar({
  notebooks, tags, selectedNotebookId, selectedTagId, view,
  onSelectAll, onSelectNotebook, onSelectTag,
  onCreateNotebook, onRenameNotebook, onDeleteNotebook, onDeleteTag,
  onSearch, searchQuery,
}: Props) {
  const [notebooksOpen, setNotebooksOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [addingNotebook, setAddingNotebook] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function submitNewNotebook() {
    if (newNotebookName.trim()) {
      onCreateNotebook(newNotebookName.trim());
      setNewNotebookName('');
    }
    setAddingNotebook(false);
  }

  function submitRename(id: string) {
    if (renameValue.trim()) onRenameNotebook(id, renameValue.trim());
    setRenamingId(null);
  }

  return (
    <aside className="w-56 min-w-[200px] bg-[#1e1e1e] text-gray-200 flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <span className="font-bold text-white text-lg">내 메모장</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2 bg-gray-700 rounded-md px-2 py-1.5">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="검색..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-200 placeholder-gray-400 outline-none w-full"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {/* All Notes */}
        <button
          onClick={onSelectAll}
          className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${view === 'all' && !searchQuery ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
        >
          <StickyNote size={15} />
          모든 노트
        </button>

        {/* Notebooks */}
        <div className="mt-2">
          <div className="flex items-center justify-between px-3 py-1">
            <button
              onClick={() => setNotebooksOpen(o => !o)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200"
            >
              {notebooksOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              노트북
            </button>
            <button
              onClick={() => setAddingNotebook(true)}
              className="text-gray-400 hover:text-white p-0.5 rounded"
              title="노트북 추가"
            >
              <Plus size={14} />
            </button>
          </div>

          {notebooksOpen && (
            <div>
              {addingNotebook && (
                <div className="flex items-center gap-1 px-4 py-1">
                  <input
                    autoFocus
                    value={newNotebookName}
                    onChange={e => setNewNotebookName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') submitNewNotebook(); if (e.key === 'Escape') setAddingNotebook(false); }}
                    className="flex-1 bg-gray-700 text-white text-sm px-2 py-0.5 rounded outline-none"
                    placeholder="노트북 이름"
                  />
                  <button onClick={submitNewNotebook} className="text-green-400 hover:text-green-300"><Check size={13} /></button>
                  <button onClick={() => setAddingNotebook(false)} className="text-gray-400 hover:text-gray-200"><X size={13} /></button>
                </div>
              )}
              {notebooks.map(nb => (
                <div key={nb.id} className="group relative">
                  {renamingId === nb.id ? (
                    <div className="flex items-center gap-1 px-4 py-1">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') submitRename(nb.id); if (e.key === 'Escape') setRenamingId(null); }}
                        className="flex-1 bg-gray-700 text-white text-sm px-2 py-0.5 rounded outline-none"
                      />
                      <button onClick={() => submitRename(nb.id)} className="text-green-400"><Check size={13} /></button>
                      <button onClick={() => setRenamingId(null)} className="text-gray-400"><X size={13} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectNotebook(nb.id)}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${view === 'notebook' && selectedNotebookId === nb.id ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
                    >
                      <BookOpen size={14} className="shrink-0" />
                      <span className="flex-1 truncate text-left">{nb.name}</span>
                      <span className="text-xs text-gray-500">{nb.note_count}</span>
                    </button>
                  )}
                  {renamingId !== nb.id && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                      <button
                        onClick={() => { setRenamingId(nb.id); setRenameValue(nb.name); }}
                        className="text-gray-400 hover:text-white p-0.5"
                      ><Edit2 size={11} /></button>
                      <button
                        onClick={() => onDeleteNotebook(nb.id)}
                        className="text-gray-400 hover:text-red-400 p-0.5"
                      ><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setTagsOpen(o => !o)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200"
            >
              {tagsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              태그
            </button>
            {tagsOpen && tags.map(tag => (
              <div key={tag.id} className="group relative">
                <button
                  onClick={() => onSelectTag(tag.id)}
                  className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-gray-700 transition-colors ${view === 'tag' && selectedTagId === tag.id ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
                >
                  <Tag size={13} className="shrink-0" />
                  <span className="flex-1 truncate text-left">{tag.name}</span>
                  <span className="text-xs text-gray-500">{tag.note_count}</span>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex">
                  <button onClick={() => onDeleteTag(tag.id)} className="text-gray-400 hover:text-red-400 p-0.5">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
