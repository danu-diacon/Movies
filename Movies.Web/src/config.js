export const API_BASE = 'http://localhost:5125/api';

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
export const GENRE_OPTIONS = [
	'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
	'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
	'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
];
