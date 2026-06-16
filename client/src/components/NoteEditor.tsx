import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Toolbar } from './Toolbar';
import { Tag, X } from 'lucide-react';
import type { Note, Notebook } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  note: Note;
  notebook?: Notebook;
  onUpdate: (id: string, data: { title: string; content: string; tags: string[] }) => void;
}

export function NoteEditor({ note, notebook, onUpdate }: Props) {
  const [title, setTitle] = useState(note.title);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note.tags ? note.tags.split(',') : []);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: '내용을 입력하세요...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
    ],
    content: note.content,
    onUpdate: ({ editor }) => scheduleSave(title, editor.getHTML(), tags),
  });

  const scheduleSave = useCallback((t: string, c: string, tgs: string[]) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onUpdate(note.id, { title: t, content: c, tags: tgs }), 800);
  }, [note.id, onUpdate]);

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
    }
    setTitle(note.title);
    setTags(note.tags ? note.tags.split(',') : []);
  }, [note.id]);

  function handleTitleChange(val: string) {
    setTitle(val);
    scheduleSave(val, editor?.getHTML() || '', tags);
  }

  function addTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed || tags.includes(trimmed)) { setTagInput(''); return; }
    const next = [...tags, trimmed];
    setTags(next);
    setTagInput('');
    scheduleSave(title, editor?.getHTML() || '', next);
  }

  function removeTag(name: string) {
    const next = tags.filter(t => t !== name);
    setTags(next);
    scheduleSave(title, editor?.getHTML() || '', next);
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 pt-5 pb-2 border-b border-gray-100">
        <input
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          className="w-full text-2xl font-bold text-gray-900 outline-none placeholder-gray-300 bg-transparent"
          placeholder="제목 없음"
        />
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          {notebook && <span className="bg-gray-100 rounded px-2 py-0.5">{notebook.name}</span>}
          <span>수정: {format(new Date(note.updated_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}</span>
        </div>

        {/* Tags */}
        <div className="flex items-center flex-wrap gap-1.5 mt-2">
          <Tag size={13} className="text-gray-400" />
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
              {t}
              <button onClick={() => removeTag(t)} className="hover:text-red-500"><X size={10} /></button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); } }}
            onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
            placeholder="태그 추가..."
            className="text-xs outline-none text-gray-500 placeholder-gray-300 bg-transparent min-w-[80px]"
          />
        </div>
      </div>

      {/* Toolbar */}
      {editor && <Toolbar editor={editor} />}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto tiptap-editor">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
