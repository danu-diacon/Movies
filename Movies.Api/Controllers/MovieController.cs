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
        var result = movies.Select(m => new MovieResponseDto
        {
            Id = m.Id,
            Title = m.Title,
            Description = m.Description,
            Rating = m.Rating,
            RealiseDate = m.RealiseDate,
            Genres = m.Genres,
            PosterUrl = m.PosterUrl,
            WatchUrl = m.WatchUrl,
            CreatedAt = m.CreatedAt,
            UpdatedAt = m.UpdatedAt
        }).ToList();
        
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
        var movie = await _movieService.GetByIdAsync(id);
        if (movie is null) return NotFound();

        var result = new MovieResponseDto
        {
            Id = movie.Id,
            Title = movie.Title,
            Description = movie.Description,
            Rating = movie.Rating,
            RealiseDate = movie.RealiseDate,
            Genres = movie.Genres,
            PosterUrl = movie.PosterUrl,
            WatchUrl = movie.WatchUrl,
            CreatedAt = movie.CreatedAt,
            UpdatedAt = movie.UpdatedAt
        };

        return Ok(result);
    }
    
    [HttpGet("search")]
    public async Task<ActionResult<List<MovieResponseDto>>> Search([FromQuery] string title)
    {
        var movies = await _movieService.SearchByTitleAsync(title);

        var result = movies.Select(m => new MovieResponseDto
        {
            Id = m.Id,
            Title = m.Title,
            Description = m.Description,
            Rating = m.Rating,
            RealiseDate = m.RealiseDate,
            Genres = m.Genres,
            PosterUrl = m.PosterUrl,
            WatchUrl = m.WatchUrl,
            CreatedAt = m.CreatedAt,
            UpdatedAt = m.UpdatedAt
        }).ToList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] MovieCreateDto dto)
    {
        var movie = new Movie
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Rating = dto.Rating,
            RealiseDate = dto.RealiseDate,
            Genres = dto.Genres,
            PosterUrl = dto.PosterUrl,
            WatchUrl = dto.WatchUrl
        };

        await _movieService.CreateAsync(movie);
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

        await _movieService.UpdateAsync(id, existing);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var existing = await _movieService.GetByIdAsync(id);
        if (existing is null) return NotFound();

        await _movieService.DeleteAsync(id);
        return NoContent();
    }
}