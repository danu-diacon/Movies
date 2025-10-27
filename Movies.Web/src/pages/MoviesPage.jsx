import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteMovie, getMovies, searchMovies } from '../api/client';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import MovieCard from '../components/MovieCard';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const loader = useMemo(() => ({ abort: new AbortController() }), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = query ? await searchMovies(query) : await getMovies();
      setMovies(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
    return () => loader.abort.abort();
  }, [fetchData, loader.abort]);

  async function handleDelete(id) {
    if (!confirm('Delete this movie?')) return;
    try {
      await deleteMovie(id);
      setMovies((list) => list.filter((m) => (m.id || m.Id) !== id));
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="label">Search by title</label>
          <input
            className="input"
            placeholder="Type a title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn" onClick={fetchData}>Search</button>
      </div>

      {error && <ErrorMessage error={error} />}
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {movies.length === 0 ? (
            <p className="text-slate-400">No movies found.</p>
          ) : (
            movies.map((m) => (
              <MovieCard key={m.id || m.Id} movie={m} onDelete={handleDelete} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
