export const API_BASE =
  import.meta.env.VITE_API_BASE || `${window.location.origin}/api`;

export const MOVIE_ENDPOINT = `${API_BASE}/Movie`;

// Media types used in UI and API routing
export const MEDIA_TYPES = {
	Movie: 'Movie',
	Series: 'Series',
};

// Optional numeric mapping for enum payloads (adjust if backend differs)
export const MEDIA_TYPE_ENUM = {
	Movie: 0,
	Series: 1,
};

// Default genre options for selects; adjust as needed
// Genres collected from sample data + a few common extras. Keep these
// aligned with backend values (some backends use plural forms like "Dramas").
export const GENRE_OPTIONS = [
	'Action',
	'Adventures',
	'Animation',
	'Biographical',
	'Cartoon series',
	"Children's",
	'Comedy',
	'Crime',
	'Detectives',
	'Documentary',
	'Dramas',
	'Family',
	'Fantasy',
	'Fairy tales',
	'Full-length',
	'For adults',
	'Foreign',
	'Historical',
	'Horror',
	'Melodramas',
	'Music',
	'Mystery',
	'Romantic',
	'Short films',
	'Sports',
	'Sci-Fi',
	'Thrillers',
	'Western',
	'Westerns'
];
