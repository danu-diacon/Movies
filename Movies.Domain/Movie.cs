namespace Movies.Domain;

public class Movie
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Rating { get; set; }
    public DateTime RealiseDate { get; set; }
    public List<string> Genres { get; set; }
    
    public string PosterUrl { get; set; }
    public string WatchUrl { get; set; }
    
    public MediaType Type { get; set; } = MediaType.Movie;
    
    public int? Seasons { get; set; }
    public int? Episodes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}