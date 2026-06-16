import type { Notebook, Note, Tag } from './types';

const BASE = '/api';

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  notebooks: {
    list: () => req<Notebook[]>('/notebooks'),
    create: (name: string) => req<Notebook>('/notebooks', { method: 'POST', body: JSON.stringify({ name }) }),
    update: (id: string, name: string) => req('/notebooks/' + id, { method: 'PUT', body: JSON.stringify({ name }) }),
    delete: (id: string) => req('/notebooks/' + id, { method: 'DELETE' }),
  },
  notes: {
    list: (params: { notebook_id?: string; tag_id?: string; q?: string }) => {
      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
      return req<Note[]>('/notes' + (qs.toString() ? '?' + qs : ''));
    },
    create: (notebook_id: string) => req<Note>('/notes', { method: 'POST', body: JSON.stringify({ notebook_id }) }),
    update: (id: string, data: { title?: string; content?: string; tags?: string[] }) =>
      req('/notes/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => req('/notes/' + id, { method: 'DELETE' }),
  },
  tags: {
    list: () => req<Tag[]>('/tags'),
    delete: (id: string) => req('/tags/' + id, { method: 'DELETE' }),
  },
};
