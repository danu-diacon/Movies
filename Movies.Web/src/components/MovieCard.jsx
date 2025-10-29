import { Link } from 'react-router-dom';

export default function MovieCard({ movie, onDelete }) {
  const {
    id,
    title,
    posterUrl,
    rating,
    genres = [],
    realiseDate,
    type,
    seasons,
    episodes,
  } = normalizeMovie(movie);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden flex flex-col">
      <Link to={`/movies/${id}`} className="block group">
        {posterUrl ? (
          <img src={posterUrl} alt={title} className="h-56 w-full object-cover transition group-hover:opacity-90" />
        ) : (
          <div className="h-56 w-full bg-slate-800 flex items-center justify-center text-slate-400">No image</div>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-semibold text-white line-clamp-2 min-h-12">
          <Link to={`/movies/${id}`} className="hover:underline">
            {title}
          </Link>
        </h3>
        <div className="text-sm text-slate-400 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded">
            ⭐ {rating ?? 'N/A'}
          </span>
          {realiseDate && <span>{realiseDate}</span>}
          {type && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">
              {type}
            </span>
          )}
          {type === 'Series' && (seasons || episodes) && (
            <span className="inline-flex items-center gap-1 bg-white/5 text-slate-300 px-2 py-0.5 rounded">
              {seasons ? `${seasons} seasons` : ''}{seasons && episodes ? ' • ' : ''}{episodes ? `${episodes} ep.` : ''}
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link to={`/movies/${id}`} className="btn btn-sm">Details</Link>
          <Link to={`/movies/${id}/edit`} className="btn btn-sm btn-secondary">Edit</Link>
          <button onClick={() => onDelete?.(id)} className="btn btn-sm btn-danger ml-auto">Delete</button>
        </div>
      </div>
    </div>
  );
}

function normalizeMovie(m) {
  const d = m.realiseDate || m.RealiseDate;
  const id = m.id || m.Id;
  const title = m.title || m.Title;
  const posterUrl = m.posterUrl || m.PosterUrl;
  const rating = m.rating ?? m.Rating;
  const genres = m.genres || m.Genres || [];
  const realiseDate = d ? new Date(d).toISOString().slice(0, 10) : '';
  const type = (m.type || m.Type) === 1 ? 'Series' : (m.type || m.Type) === 'Series' ? 'Series' : 'Movie';
  const seasons = m.seasons ?? m.Seasons ?? null;
  const episodes = m.episodes ?? m.Episodes ?? null;
  return { id, title, posterUrl, rating, genres, realiseDate, type, seasons, episodes };
}
