import { Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Note } from '../types';

interface Props {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  title: string;
  canCreate: boolean;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').slice(0, 120);
}

export function NoteList({ notes, selectedNoteId, onSelectNote, onCreateNote, onDeleteNote, title, canCreate }: Props) {
  return (
    <div className="w-64 min-w-[220px] bg-[#f7f6f3] border-r border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{notes.length}개의 노트</p>
        </div>
        {canCreate && (
          <button
            onClick={onCreateNote}
            className="bg-brand-500 hover:bg-brand-600 text-white rounded-md p-1.5 transition-colors"
            title="새 노트"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 px-4">
            <span className="text-4xl">📄</span>
            <p className="text-sm text-center">노트가 없습니다{canCreate && <><br /><span className="text-brand-500">+</span> 버튼으로 추가하세요</>}</p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`group relative px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${selectedNoteId === note.id ? 'bg-white border-l-2 border-l-brand-500' : ''}`}
            >
              <p className="text-sm font-medium text-gray-800 truncate pr-6">{note.title || 'Untitled'}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{stripHtml(note.content) || '내용 없음'}</p>
              <p className="text-xs text-gray-300 mt-1">
                {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true, locale: ko })}
              </p>
              {note.tags && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {note.tags.split(',').map(t => (
                    <span key={t} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
              <button
                onClick={e => { e.stopPropagation(); onDeleteNote(note.id); }}
                className="absolute right-2 top-3 hidden group-hover:block text-gray-300 hover:text-red-400 p-1"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
