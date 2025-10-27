import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMovie, updateMovie } from '../api/client';
import MovieForm from '../components/MovieForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function EditMoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(dto) {
    setError(null);
    setSubmitting(true);
    try {
      await updateMovie(id, dto);
      navigate(`/movies/${id}`);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Movie</h1>
      {error && <div className="mb-4"><ErrorMessage error={error} /></div>}
      <MovieForm initialValues={movie} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
