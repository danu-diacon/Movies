import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMovie } from '../api/client';
import MovieForm from '../components/MovieForm';
import ErrorMessage from '../components/ErrorMessage';

export default function CreateMoviePage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(dto) {
    setError(null);
    setSubmitting(true);
    try {
      const created = await createMovie(dto);
      const id = created.id || created.Id;
      navigate(`/movies/${id}`);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Add Movie</h1>
      {error && <div className="mb-4"><ErrorMessage error={error} /></div>}
      <MovieForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
