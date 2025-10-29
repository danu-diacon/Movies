import axios from 'axios';
import { API_BASE } from '../config';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;
    const message = (typeof data === 'string' && data) || data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(`${status ?? ''} ${message}`.trim()));
  }
);

export async function getMovies() {
  const { data } = await api.get('/Movie');
  return data;
}

export async function getMovie(id) {
  const { data } = await api.get(`/Movie/${id}`);
  return data;
}

export async function searchMovies(title) {
  const { data } = await api.get('/Movie/search', { params: { title } });
  return data;
}

export async function getMoviesByType(type) {
  // type should be enum name: 'Movie' or 'Series'
  const { data } = await api.get(`/Movie/type/${encodeURIComponent(type)}`);
  return data;
}

export async function getMoviesByGenres(genres) {
  // genres can be array or comma-separated string
  const list = Array.isArray(genres) ? genres : String(genres).split(',');
  const joined = list.map((g) => String(g).trim()).filter(Boolean).join(',');
  const { data } = await api.get('/Movie/genres', { params: { genres: joined } });
  return data;
}

export async function createMovie(movie) {
  const { data } = await api.post('/Movie', movie);
  return data;
}

export async function updateMovie(id, movie) {
  await api.put(`/Movie/${id}`, movie);
  return null;
}

export async function deleteMovie(id) {
  await api.delete(`/Movie/${id}`);
  return null;
}
