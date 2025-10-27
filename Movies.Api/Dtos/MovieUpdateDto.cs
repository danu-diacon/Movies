namespace Movies.Api.Dtos;

public class MovieUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Rating { get; set; }
    public DateTime RealiseDate { get; set; }
    public List<string> Genres { get; set; } = new();
    public string PosterUrl { get; set; } = string.Empty;
    public string WatchUrl { get; set; } = string.Empty;
}