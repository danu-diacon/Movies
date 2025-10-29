import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteMovie, getMovies, getMoviesByGenres, getMoviesByType, searchMovies } from '../api/client';
import { MEDIA_TYPES } from '../config';
import MultiSelect from '../components/MultiSelect';
import { GENRE_OPTIONS } from '../config';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import MovieCard from '../components/MovieCard';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [genresSelected, setGenresSelected] = useState([]);

  const loader = useMemo(() => ({ abort: new AbortController() }), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
  const genres = genresSelected;

      if (query) {
        // Start from title search
        data = await searchMovies(query);
        // Filter by genres (client-side)
        if (genres.length > 0) {
          data = data.filter((m) => hasAllGenres(m, genres));
        }
        // Filter by type (client-side)
        if (typeFilter !== 'All') {
          data = data.filter((m) => normalizeType(m) === typeFilter);
        }
      } else if (genres.length > 0) {
        // Fetch by genres server-side, then optionally filter by type
        data = await getMoviesByGenres(genres);
        if (typeFilter !== 'All') {
          data = data.filter((m) => normalizeType(m) === typeFilter);
        }
      } else if (typeFilter !== 'All') {
        data = await getMoviesByType(typeFilter);
      } else {
        data = await getMovies();
      }
      setMovies(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [query, typeFilter, genresSelected]);

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
        <div>
          <label className="label">Type</label>
          <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All</option>
            <option value={MEDIA_TYPES.Movie}>Movie</option>
            <option value={MEDIA_TYPES.Series}>Series</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Genres</label>
          <MultiSelect options={GENRE_OPTIONS} value={genresSelected} onChange={setGenresSelected} />
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

function normalizeType(m) {
  const t = m.type ?? m.Type;
  if (t === 1 || t === 'Series') return 'Series';
  return 'Movie';
}

function getGenres(m) {
  return (m.genres ?? m.Genres ?? []).map((g) => String(g).toLowerCase());
}

function hasAllGenres(m, required) {
  const set = new Set(getGenres(m));
  return required.every((g) => set.has(String(g).toLowerCase()))
}

// no more string parsing; using array from MultiSelect
