using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Movies.Api.Dtos;
using Movies.Api.Services;
using Movies.Domain;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovieController : ControllerBase
{
    private readonly MovieService _movieService;
    private readonly IDistributedCache _cache;

    public MovieController(MovieService movieService, IDistributedCache cache)
    {
        _movieService = movieService;
        _cache = cache;
    }

    [HttpGet]
    public async Task<ActionResult<List<MovieResponseDto>>> GetAll()
    {
        var cacheKey = "movies_all";
        var cachedData = await _cache.GetStringAsync(cacheKey);

        if (cachedData != null)
        {
            var cachedMovies = JsonSerializer.Deserialize<List<MovieResponseDto>>(cachedData);
            return Ok(cachedMovies);
        }
        
        var movies = await _movieService.GetAllAsync();
        var result = movies.Select(ToResponseDto).ToList();
        
        var jsonData = JsonSerializer.Serialize(result);
        await _cache.SetStringAsync(cacheKey, jsonData, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
        });

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MovieResponseDto>> GetById(Guid id)
    {
        var key = $"movie_{id}";
        var cached = await _cache.GetStringAsync(key);
        if (cached != null) return Ok(JsonSerializer.Deserialize<MovieResponseDto>(cached));
        
        var movie = await _movieService.GetByIdAsync(id);
        if (movie is null) return NotFound();

        var result = ToResponseDto(movie);
        
        await _cache.SetStringAsync(key, JsonSerializer.Serialize(result),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2) });

        return Ok(result);
    }
    
    [HttpGet("type/{type}")]
    public async Task<ActionResult<List<MovieResponseDto>>> GetByType(MediaType type)
    {
        var key = $"movie_type_{type}";
        var cached = await _cache.GetStringAsync(key);
        if (cached != null)
        {
            var cachedMovies = JsonSerializer.Deserialize<List<MovieResponseDto>>(cached);
            return Ok(cachedMovies);
        }

        var movies = await _movieService.GetByTypeAsync(type);
        var result = movies.Select(ToResponseDto).ToList();

        await _cache.SetStringAsync(key, JsonSerializer.Serialize(result),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2) });

        return Ok(result);
    }
    
    [HttpGet("search")]
    public async Task<ActionResult<List<MovieResponseDto>>> Search([FromQuery] string title)
    {
        var movies = await _movieService.SearchByTitleAsync(title);

        var result = movies.Select(ToResponseDto).ToList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] MovieCreateDto dto)
    {
        var movie = FromCreateDto(dto);

        await _movieService.CreateAsync(movie);
        await _cache.RemoveAsync("movies_all");
        return CreatedAtAction(nameof(GetById), new { id = movie.Id }, movie);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] MovieUpdateDto dto)
    {
        var existing = await _movieService.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.Title = dto.Title;
        existing.Description = dto.Description;
        existing.Rating = dto.Rating;
        existing.RealiseDate = dto.RealiseDate;
        existing.Genres = dto.Genres;
        existing.PosterUrl = dto.PosterUrl;
        existing.WatchUrl = dto.WatchUrl;
        existing.Type = dto.Type;
        existing.Seasons = dto.Seasons;
        existing.Episodes = dto.Episodes;

        await _movieService.UpdateAsync(id, existing);
        await _cache.RemoveAsync("movies_all");
        await _cache.RemoveAsync($"movie_{id}");
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var existing = await _movieService.GetByIdAsync(id);
        if (existing is null) return NotFound();

        await _movieService.DeleteAsync(id);
        await _cache.RemoveAsync("movies_all");
        await _cache.RemoveAsync($"movie_{id}");
        return NoContent();
    }
    
    [HttpPost("bulk")]
    public async Task<ActionResult> CreateBulk([FromBody] List<MovieCreateDto> dtos)
    {
        if (dtos == null || !dtos.Any())
            return BadRequest("Movie list cannot be empty.");

        var movies = dtos.Select(FromCreateDto).ToList();
        await _movieService.CreateManyAsync(movies);
        await _cache.RemoveAsync("movies_all");

        return Ok(new { message = $"{movies.Count} movies/series added successfully." });
    }
    
    [HttpGet("genres")]
    public async Task<ActionResult<List<MovieResponseDto>>> GetByGenres([FromQuery] string genres)
    {
        if (string.IsNullOrWhiteSpace(genres))
            return BadRequest("You must provide at least one genre.");

        var genreList = genres.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
        var movies = await _movieService.GetByGenresAsync(genreList);

        var result = movies.Select(ToResponseDto).ToList();
        return Ok(result);
    }
    
    // ==================== HELPERS ====================

    private static MovieResponseDto ToResponseDto(Movie m) => new()
    {
        Id = m.Id,
        Title = m.Title,
        Description = m.Description,
        Rating = m.Rating,
        RealiseDate = m.RealiseDate,
        Genres = m.Genres,
        PosterUrl = m.PosterUrl,
        WatchUrl = m.WatchUrl,
        Type = m.Type,
        Seasons = m.Seasons,
        Episodes = m.Episodes,
        CreatedAt = m.CreatedAt,
        UpdatedAt = m.UpdatedAt
    };

    private static Movie FromCreateDto(MovieCreateDto dto) => new()
    {
        Id = Guid.NewGuid(),
        Title = dto.Title,
        Description = dto.Description,
        Rating = dto.Rating,
        RealiseDate = dto.RealiseDate,
        Genres = dto.Genres,
        PosterUrl = dto.PosterUrl,
        WatchUrl = dto.WatchUrl,
        Type = dto.Type,
        Seasons = dto.Seasons,
        Episodes = dto.Episodes,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };
}