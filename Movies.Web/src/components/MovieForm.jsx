import { useEffect, useMemo, useState } from 'react';
import { GENRE_OPTIONS, MEDIA_TYPE_ENUM, MEDIA_TYPES } from '../config';
import MultiSelect from './MultiSelect';

const emptyForm = {
  title: '',
  description: '',
  rating: 0,
  realiseDate: '',
  genres: [],
  posterUrl: '',
  watchUrl: '',
  type: MEDIA_TYPES.Movie,
  seasons: '',
  episodes: '',
};

export default function MovieForm({ initialValues, onSubmit, submitting }) {
  const init = useMemo(() => toForm(initialValues), [initialValues]);
  const [form, setForm] = useState(init ?? emptyForm);

  useEffect(() => {
    setForm(init ?? emptyForm);
  }, [init]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleGenresChange(value) {
    const arr = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    update('genres', arr);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = toDto(form);
    onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => update('title', e.target.value)} required />
        </div>
        <div>
          <label className="label">Rating</label>
          <input type="number" step="0.1" min="0" max="10" className="input" value={form.rating} onChange={(e) => update('rating', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">Realise Date</label>
          <input type="date" className="input" value={form.realiseDate} onChange={(e) => update('realiseDate', e.target.value)} />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={(e) => update('type', e.target.value)}>
            <option value={MEDIA_TYPES.Movie}>Movie</option>
            <option value={MEDIA_TYPES.Series}>Series</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Genres</label>
          <MultiSelect options={GENRE_OPTIONS} value={form.genres} onChange={(vals) => update('genres', vals)} />
        </div>
      </div>

      {form.type === MEDIA_TYPES.Series && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Seasons</label>
            <input type="number" min="0" className="input" value={form.seasons} onChange={(e) => update('seasons', e.target.value)} />
          </div>
          <div>
            <label className="label">Episodes</label>
            <input type="number" min="0" className="input" value={form.episodes} onChange={(e) => update('episodes', e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className="label">Poster URL</label>
        <input className="input" value={form.posterUrl} onChange={(e) => update('posterUrl', e.target.value)} />
      </div>
      <div>
        <label className="label">Watch URL</label>
        <input className="input" value={form.watchUrl} onChange={(e) => update('watchUrl', e.target.value)} />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea rows={5} className="input min-h-24" value={form.description} onChange={(e) => update('description', e.target.value)} />
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Movie'}
        </button>
      </div>
    </form>
  );
}

function toForm(values) {
  if (!values) return null;
  // Normalize possible different casings from backend
  const v = values;
  return {
    title: v.title ?? v.Title ?? '',
    description: v.description ?? v.Description ?? '',
    rating: v.rating ?? v.Rating ?? 0,
    realiseDate: v.realiseDate
      ? new Date(v.realiseDate).toISOString().slice(0, 10)
      : v.RealiseDate
      ? new Date(v.RealiseDate).toISOString().slice(0, 10)
      : '',
    genres: v.genres ?? v.Genres ?? [],
    posterUrl: v.posterUrl ?? v.PosterUrl ?? '',
    watchUrl: v.watchUrl ?? v.WatchUrl ?? '',
    type: v.type ?? v.Type ?? MEDIA_TYPES.Movie,
    seasons: v.seasons ?? v.Seasons ?? '',
    episodes: v.episodes ?? v.Episodes ?? '',
  };
}

function toDto(form) {
  // Backend expects create/update dto with these fields
  return {
    Title: form.title,
    Description: form.description,
    Rating: Number(form.rating) || 0,
    RealiseDate: form.realiseDate ? new Date(form.realiseDate).toISOString() : new Date(0).toISOString(),
    Genres: form.genres,
    PosterUrl: form.posterUrl,
    WatchUrl: form.watchUrl,
    Type: MEDIA_TYPE_ENUM[form.type] ?? form.type,
    Seasons: form.type === MEDIA_TYPES.Series ? toIntOrNull(form.seasons) : null,
    Episodes: form.type === MEDIA_TYPES.Series ? toIntOrNull(form.episodes) : null,
  };
}

function toIntOrNull(v) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

