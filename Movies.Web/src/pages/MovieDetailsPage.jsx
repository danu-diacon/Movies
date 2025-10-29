import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteMovie, getMovie } from '../api/client';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMovie(id);
        if (mounted) setMovie(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this movie?')) return;
    try {
      await deleteMovie(id);
      navigate('/');
    } catch (err) {
      setError(err);
    }
  }

  if (loading) return <Loading />;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-6"><ErrorMessage error={error} /></div>;
  if (!movie) return null;

  const title = movie.title ?? movie.Title;
  const description = movie.description ?? movie.Description;
  const rating = movie.rating ?? movie.Rating;
  const posterUrl = movie.posterUrl ?? movie.PosterUrl;
  const watchUrl = movie.watchUrl ?? movie.WatchUrl;
  const genres = movie.genres ?? movie.Genres ?? [];
  const realiseDate = movie.realiseDate ?? movie.RealiseDate;
  const type = (movie.type ?? movie.Type) === 1 ? 'Series' : (movie.type ?? movie.Type) === 'Series' ? 'Series' : 'Movie';
  const seasons = movie.seasons ?? movie.Seasons ?? null;
  const episodes = movie.episodes ?? movie.Episodes ?? null;
  const realise = realiseDate ? new Date(realiseDate).toLocaleDateString() : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        {posterUrl ? (
          <img src={posterUrl} alt={title} className="w-full rounded-lg" />
        ) : (
          <div className="aspect-2/3 bg-slate-800 rounded-lg" />
        )}
      </div>
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <div className="text-slate-300">{description}</div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded">⭐ {rating ?? 'N/A'}</span>
          {realise && <span>Release: {realise}</span>}
          {type && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">{type}</span>
          )}
          {type === 'Series' && (seasons || episodes) && (
            <span className="inline-flex items-center gap-1 bg-white/5 text-slate-300 px-2 py-0.5 rounded">
              {seasons ? `${seasons} seasons` : ''}{seasons && episodes ? ' • ' : ''}{episodes ? `${episodes} ep.` : ''}
            </span>
          )}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.map((g) => (
                <span key={g} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs">{g}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Link to={`/movies/${id}/edit`} className="btn btn-secondary">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
          <Link to="/" className="btn ml-auto">Back</Link>
          {watchUrl && (
            <a href={watchUrl} target="_blank" rel="noreferrer" className="btn">Watch ▶</a>
          )}
        </div>
      </div>
    </div>
  );
}
