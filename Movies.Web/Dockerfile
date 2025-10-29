# ---- Build Vite app ----
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Export doar build-ul ----
FROM scratch AS export
COPY --from=build /app/dist /