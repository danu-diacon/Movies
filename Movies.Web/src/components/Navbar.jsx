import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkBase = 'text-sm font-medium px-3 py-2 rounded hover:bg-white/10';
  const active = ({ isActive }) => (
    isActive ? `${linkBase} bg-white/15` : linkBase
  );

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-black/30 text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-semibold">
          🎬 Movies
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={active} end>
            Home
          </NavLink>
          <NavLink to="/movies/new" className={active}>
            Add Movie
          </NavLink>
          {/* <NavLink to="/bulk" className={active}>
            Bulk Import
          </NavLink> */}
        </nav>
      </div>
    </header>
  );
}
