using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Movies.Domain;

namespace Movies.Api.Services;

public class MovieService
{
    private readonly IMongoCollection<Movie> _movies;

    public MovieService(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _movies = database.GetCollection<Movie>(settings.Value.CollectionName);
    }

    public async Task<List<Movie>> GetAllAsync() =>
        await _movies.Find(_ => true).ToListAsync();

    public async Task<Movie?> GetByIdAsync(Guid id) =>
        await _movies.Find(x => x.Id == id).FirstOrDefaultAsync();
    
    public async Task<List<Movie>> GetByTypeAsync(MediaType type)
    {
        var filter = Builders<Movie>.Filter.Eq(x => x.Type, type);
        return await _movies.Find(filter).ToListAsync();
    }
    
    public async Task<List<Movie>> SearchByTitleAsync(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return new List<Movie>();
        
        var filter = Builders<Movie>.Filter.Regex(
            x => x.Title,
            new MongoDB.Bson.BsonRegularExpression(title, "i")
        );

        return await _movies.Find(filter).ToListAsync();
    }

    public async Task CreateAsync(Movie movie)
    {
        movie.Id = Guid.NewGuid();
        movie.CreatedAt = DateTime.UtcNow;
        movie.UpdatedAt = DateTime.UtcNow;
        await _movies.InsertOneAsync(movie);
    }
    
    public async Task CreateManyAsync(List<Movie> movies)
    {
        await _movies.InsertManyAsync(movies);
    }

    public async Task<List<Movie>> GetByGenresAsync(List<string> genres)
    {
        var filter = Builders<Movie>.Filter.AnyIn(x => x.Genres, genres);
        return await _movies.Find(filter).ToListAsync();
    }

    public async Task UpdateAsync(Guid id, Movie movie)
    {
        movie.UpdatedAt = DateTime.UtcNow;
        await _movies.ReplaceOneAsync(x => x.Id == id, movie);
    }

    public async Task DeleteAsync(Guid id) =>
        await _movies.DeleteOneAsync(x => x.Id == id);
}