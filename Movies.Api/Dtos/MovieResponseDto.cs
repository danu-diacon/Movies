namespace Movies.Api.Dtos;

public class MovieResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Rating { get; set; }
    public DateTime RealiseDate { get; set; }
    public List<string> Genres { get; set; } = new();
    public string PosterUrl { get; set; } = string.Empty;
    public string WatchUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}