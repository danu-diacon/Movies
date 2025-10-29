# 🎬 Movies API

A lightweight RESTful API built with **.NET 8**, **MongoDB**, and **Redis**, designed to manage and serve movie and TV series data efficiently.  
Supports **pagination**, **filtering by genres**, **sorting**, **bulk import**, and **server-side caching** for optimal performance.

---

## 🚀 Features

✅ CRUD operations for movies and series  
✅ Bulk insertion of multiple movies  
✅ Pagination & sorting on all endpoints  
✅ Filtering by genre(s) (case-insensitive)  
✅ Type filtering (Movie / Series)  
✅ Full-text search by title  
✅ Redis cache for improved performance  
✅ Clean architecture & DTO mapping  
✅ MongoDB integration with async data access  

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend | ASP.NET Core 8 (Web API) |
| Database | MongoDB |
| Cache | Redis (StackExchange.Redis) |
| Serialization | System.Text.Json |
| Containerization | Docker / Docker Compose |

---

## ⚙️ Project Structure

```
Movies/
 ├── Movies.Api/
 │   ├── Controllers/
 │   │   └── MovieController.cs
 │   ├── Services/
 │   │   └── MovieService.cs
 │   ├── Dtos/
 │   │   ├── MovieCreateDto.cs
 │   │   ├── MovieUpdateDto.cs
 │   │   └── MovieResponseDto.cs
 │   ├── appsettings.json
 │   ├── Program.cs
 │   └── Dockerfile
 ├── Movies.Domain/
 │   ├── Movie.cs
 │   ├── MongoDbSettings.cs
 │   └── MediaType.cs
 └── docker-compose.yml
```

## 🐳 Running the Project with Docker

Make sure you have **Docker** and **Docker Compose** installed on your machine.  
Once you’ve cloned this repository, you can start all containers (API, MongoDB, Redis, etc.) using a single command:

```bash
docker compose up --build -d