import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import CreateMoviePage from './pages/CreateMoviePage';
import EditMoviePage from './pages/EditMoviePage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-900 text-slate-100">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<MoviesPage />} />
            <Route path="/movies/new" element={<CreateMoviePage />} />
            <Route path="/movies/:id" element={<MovieDetailsPage />} />
            <Route path="/movies/:id/edit" element={<EditMoviePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App
