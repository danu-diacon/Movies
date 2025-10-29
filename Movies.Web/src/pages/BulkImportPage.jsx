import { useMemo, useState } from 'react';
import { MEDIA_TYPE_ENUM } from '../config';
import { createMoviesBulk } from '../api/client';

export default function BulkImportPage() {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sample = useMemo(() => `[
  {
    "title": "IT: Welcome to Derry",
    "description": "A prequel to It, set in the 1960s, telling the origins of Pennywise the clown.",
    "rating": 8.2,
    "realiseDate": "2025-10-26T00:00:00.000Z",
    "genres": ["Horror", "Foreign"],
    "posterUrl": "https://example.com/poster1.jpg",
    "watchUrl": "https://example.com/watch1",
    "type": 1,
    "seasons": 1,
    "episodes": 8
  }
]`, []);

  function parseJson() {
    setError(null);
    setMessage('');
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('JSON must be an array of movie objects');
      setItems(parsed);
    } catch (e) {
      setItems([]);
      setError(e);
    }
  }

  function normalizeType(value) {
    if (value === 0 || value === 'Movie') return MEDIA_TYPE_ENUM.Movie ?? 0;
    if (value === 1 || value === 'Series') return MEDIA_TYPE_ENUM.Series ?? 1;
    // default to Movie
    return MEDIA_TYPE_ENUM.Movie ?? 0;
  }

  function toDto(x) {
    return {
      Title: x.title ?? x.Title ?? '',
      Description: x.description ?? x.Description ?? '',
      Rating: x.rating ?? x.Rating ?? 0,
      RealiseDate: x.realiseDate ?? x.RealiseDate ?? null,
      Genres: x.genres ?? x.Genres ?? [],
      PosterUrl: x.posterUrl ?? x.PosterUrl ?? '',
      WatchUrl: x.watchUrl ?? x.WatchUrl ?? '',
      Type: normalizeType(x.type ?? x.Type),
      Seasons: x.seasons ?? x.Seasons ?? 0,
      Episodes: x.episodes ?? x.Episodes ?? 0,
    };
  }

  async function handleImport() {
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      if (items.length === 0) throw new Error('Nothing to import. Paste JSON and click Validate first.');
      const payload = items.map(toDto);
      const res = await createMoviesBulk(payload);
      setMessage(res?.message || `Imported ${payload.length} items.`);
      setItems([]);
      setText('');
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Bulk Import</h1>

      <div className="mb-4 text-sm text-slate-300">
        <p>Paste a JSON array of movies and click Validate. Then Import to send to the backend bulk endpoint.</p>
        <button className="btn btn-sm mt-2" onClick={() => setText(sample)}>Insert sample</button>
      </div>

      <textarea
        className="input min-h-[220px] font-mono"
        placeholder="Paste JSON array here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center gap-2 mt-3">
        <button className="btn" onClick={parseJson} disabled={loading}>Validate</button>
        <button className="btn" onClick={handleImport} disabled={loading || items.length === 0}>Import</button>
        {loading && <span className="text-slate-400 text-sm">Importing…</span>}
      </div>

      {error && (
        <p className="mt-3 text-red-400 text-sm">{String(error.message || error)}</p>
      )}
      {message && (
        <p className="mt-3 text-green-400 text-sm">{message}</p>
      )}

      {items.length > 0 && (
        <div className="mt-6">
          <div className="text-sm text-slate-300 mb-2">Parsed {items.length} item(s). Preview:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.slice(0, 6).map((x, i) => (
              <div key={i} className="rounded border border-white/10 p-3 bg-white/5">
                <div className="font-medium">{x.title ?? x.Title ?? '(no title)'}
                  <span className="ml-2 text-xs text-slate-400">{(x.type ?? x.Type) === 1 || (x.type ?? x.Type) === 'Series' ? 'Series' : 'Movie'}</span>
                </div>
                <div className="text-xs text-slate-400">Rating: {x.rating ?? x.Rating ?? 'n/a'}</div>
                <div className="text-xs text-slate-400">Genres: {(x.genres ?? x.Genres ?? []).join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
