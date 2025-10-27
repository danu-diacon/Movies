export default function ErrorMessage({ error }) {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.message || 'Something went wrong';
  return (
    <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded p-3 text-sm">
      {message}
    </div>
  );
}
