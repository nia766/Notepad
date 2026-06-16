import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Heading1, Heading2,
  List, ListOrdered, ListChecks, Quote, Highlighter, AlignLeft,
  AlignCenter, AlignRight, Link, Minus,
} from 'lucide-react';

interface Props { editor: Editor }

function Btn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${active ? 'bg-gray-200 text-brand-600' : 'text-gray-600'}`}
    >
      {children}
    </button>
  );
}

function Sep() { return <div className="w-px h-5 bg-gray-200 mx-0.5" />; }

export function Toolbar({ editor }: Props) {
  const e = editor;

  function setLink() {
    const url = window.prompt('URL 입력:', e.getAttributes('link').href);
    if (url === null) return;
    if (!url) { e.chain().focus().unsetLink().run(); return; }
    e.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-1.5 border-b border-gray-200 bg-white">
      <Btn onClick={() => e.chain().focus().toggleBold().run()} active={e.isActive('bold')} title="굵게"><Bold size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().toggleItalic().run()} active={e.isActive('italic')} title="기울임"><Italic size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().toggleUnderline().run()} active={e.isActive('underline')} title="밑줄"><Underline size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().toggleStrike().run()} active={e.isActive('strike')} title="취소선"><Strikethrough size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().toggleCode().run()} active={e.isActive('code')} title="인라인 코드"><Code size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().toggleHighlight().run()} active={e.isActive('highlight')} title="하이라이트"><Highlighter size={15} /></Btn>
      <Sep />
      <Btn onClick={() => e.chain().focus().toggleHeading({ level: 1 }).run()} active={e.isActive('heading', { level: 1 })} title="제목 1"><Heading1 size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()} active={e.isActive('heading', { level: 2 })} title="제목 2"><Heading2 size={15} /></Btn>
      <Sep />
      <Btn onClick={() => e.chain().focus().toggleBulletList().run()} active={e.isActive('bulletList')} title="글머리 목록"><List size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().toggleOrderedList().run()} active={e.isActive('orderedList')} title="번호 목록"><ListOrdered size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().toggleTaskList().run()} active={e.isActive('taskList')} title="체크리스트"><ListChecks size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().toggleBlockquote().run()} active={e.isActive('blockquote')} title="인용"><Quote size={15} /></Btn>
      <Sep />
      <Btn onClick={() => e.chain().focus().setTextAlign('left').run()} active={e.isActive({ textAlign: 'left' })} title="왼쪽 정렬"><AlignLeft size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().setTextAlign('center').run()} active={e.isActive({ textAlign: 'center' })} title="가운데 정렬"><AlignCenter size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().setTextAlign('right').run()} active={e.isActive({ textAlign: 'right' })} title="오른쪽 정렬"><AlignRight size={15} /></Btn>
      <Sep />
      <Btn onClick={setLink} active={e.isActive('link')} title="링크"><Link size={15} /></Btn>
      <Btn onClick={() => e.chain().focus().setHorizontalRule().run()} title="구분선"><Minus size={15} /></Btn>
    </div>
  );
}
