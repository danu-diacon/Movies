# Movies Web (React + Vite + Tailwind)

Simple UI for browsing and managing Movies, backed by the API at `http://localhost:5125/api`.

## Features
- List movies with search by title
- View movie details
- Create, edit and delete movies

## API
The frontend calls the following endpoints of your backend:
- GET `GET /api/Movie`
- GET `GET /api/Movie/{id}`
- GET `GET /api/Movie/search?title=...`
- POST `POST /api/Movie`
- PUT `PUT /api/Movie/{id}`
- DELETE `DELETE /api/Movie/{id}`

The base URL is set in `src/config.js`. Adjust if your backend runs elsewhere.

## Run locally

1. Install dependencies
	- `npm install`
2. Start the dev server
	- `npm run dev`
3. Open the app in your browser (Vite will print the local URL).

Make sure your backend is running on `http://localhost:5125`.

## Build
`npm run build` generates the production build in `dist/`.
