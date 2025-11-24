using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Moq;
using Movies.Api.Services;
using Movies.Domain;

namespace Movies.Tests;

public class MovieServiceTests
{
    private Mock<IMongoCollection<Movie>> _mockCollection;
    private Mock<IMongoDatabase> _mockDatabase;
    private Mock<IMongoClient> _mockClient;
    private Mock<IAsyncCursor<Movie>> _mockCursor;
    private MovieService _service;

    [SetUp]
    public void Setup()
    {
        _mockCollection = new Mock<IMongoCollection<Movie>>();
        _mockDatabase = new Mock<IMongoDatabase>();
        _mockClient = new Mock<IMongoClient>();
        _mockCursor = new Mock<IAsyncCursor<Movie>>();

        // Setup database and collection
        _mockClient
            .Setup(c => c.GetDatabase(It.IsAny<string>(), null))
            .Returns(_mockDatabase.Object);

        _mockDatabase
            .Setup(d => d.GetCollection<Movie>(It.IsAny<string>(), null))
            .Returns(_mockCollection.Object);

        // Mock settings
        var mongoSettings = Options.Create(new MongoDbSettings
        {
            ConnectionString = "mongodb://localhost:27017",
            DatabaseName = "testDb",
            CollectionName = "Movies"
        });

        _service = new MovieService(mongoSettings);
        
        // Injectăm manual mock-ul
        typeof(MovieService)
            .GetField("_movies", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
            ?.SetValue(_service, _mockCollection.Object);
    }

    #region GetAllAsync Tests

    [Test]
    public async Task GetAllAsync_ShouldReturnAllMovies()
    {
        // Arrange
        var movies = new List<Movie>
        {
            new Movie { Id = Guid.NewGuid(), Title = "Movie 1", Type = MediaType.Movie },
            new Movie { Id = Guid.NewGuid(), Title = "Series 1", Type = MediaType.Series }
        };

        SetupFindAsync(movies);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result[0].Title, Is.EqualTo("Movie 1"));
        Assert.That(result[1].Title, Is.EqualTo("Series 2"));
    }

    [Test]
    public async Task GetAllAsync_ShouldReturnEmptyList_WhenNoMoviesExist()
    {
        // Arrange
        SetupFindAsync(new List<Movie>());

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.Empty);
    }

    #endregion

    #region GetByIdAsync Tests

    [Test]
    public async Task GetByIdAsync_ShouldReturnMovie_WhenMovieExists()
    {
        // Arrange
        var movieId = Guid.NewGuid();
        var movie = new Movie { Id = movieId, Title = "Test Movie" };

        SetupFindAsync(new List<Movie> { movie });

        // Act
        var result = await _service.GetByIdAsync(movieId);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(movieId));
        Assert.That(result.Title, Is.EqualTo("Test Movie"));
    }

    [Test]
    public async Task GetByIdAsync_ShouldReturnNull_WhenMovieDoesNotExist()
    {
        // Arrange
        var movieId = Guid.NewGuid();
        SetupFindAsync(new List<Movie>());

        // Act
        var result = await _service.GetByIdAsync(movieId);

        // Assert
        Assert.That(result, Is.Null);
    }

    #endregion

    #region GetByTypeAsync Tests

    [Test]
    public async Task GetByTypeAsync_ShouldReturnMovies_WhenTypeIsMovie()
    {
        // Arrange
        var movies = new List<Movie>
        {
            new Movie { Id = Guid.NewGuid(), Title = "Movie 1", Type = MediaType.Movie },
            new Movie { Id = Guid.NewGuid(), Title = "Movie 2", Type = MediaType.Movie }
        };

        SetupFindAsync(movies);

        // Act
        var result = await _service.GetByTypeAsync(MediaType.Movie);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result.All(m => m.Type == MediaType.Movie), Is.True);
    }

    [Test]
    public async Task GetByTypeAsync_ShouldReturnSeries_WhenTypeIsSeries()
    {
        // Arrange
        var series = new List<Movie>
        {
            new Movie { Id = Guid.NewGuid(), Title = "Series 1", Type = MediaType.Series, Seasons = 5 },
            new Movie { Id = Guid.NewGuid(), Title = "Series 2", Type = MediaType.Series, Seasons = 3 }
        };

        SetupFindAsync(series);

        // Act
        var result = await _service.GetByTypeAsync(MediaType.Series);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result.All(m => m.Type == MediaType.Series), Is.True);
    }

    [Test]
    public async Task GetByTypeAsync_ShouldReturnEmptyList_WhenNoMatchingType()
    {
        // Arrange
        SetupFindAsync(new List<Movie>());

        // Act
        var result = await _service.GetByTypeAsync(MediaType.Movie);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.Empty);
    }

    #endregion

    #region SearchByTitleAsync Tests

    [Test]
    public async Task SearchByTitleAsync_ShouldReturnEmptyList_WhenTitleIsNull()
    {
        // Act
        var result = await _service.SearchByTitleAsync(null);

        // Assert
        Assert.That(result, Is.Empty);
    }

    [Test]
    public async Task SearchByTitleAsync_ShouldReturnEmptyList_WhenTitleIsWhitespace()
    {
        // Act
        var result = await _service.SearchByTitleAsync("   ");

        // Assert
        Assert.That(result, Is.Empty);
    }

    [Test]
    public async Task SearchByTitleAsync_ShouldReturnMatchingMovies()
    {
        // Arrange
        var movies = new List<Movie>
        {
            new Movie { Id = Guid.NewGuid(), Title = "The Dark Knight" },
            new Movie { Id = Guid.NewGuid(), Title = "The Dark Knight Rises" }
        };

        SetupFindAsync(movies);

        // Act
        var result = await _service.SearchByTitleAsync("Dark");

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task SearchByTitleAsync_ShouldReturnEmptyList_WhenNoMatches()
    {
        // Arrange
        SetupFindAsync(new List<Movie>());

        // Act
        var result = await _service.SearchByTitleAsync("NonExistentTitle");

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.Empty);
    }

    #endregion

    #region CreateAsync Tests

    [Test]
    public async Task CreateAsync_ShouldSetIdAndTimestamps()
    {
        // Arrange
        var movie = new Movie
        {
            Title = "New Movie",
            Description = "Test Description",
            Rating = 8.5
        };

        Movie capturedMovie = null;
        _mockCollection
            .Setup(c => c.InsertOneAsync(It.IsAny<Movie>(), null, default))
            .Callback<Movie, InsertOneOptions, CancellationToken>((m, _, _) => capturedMovie = m)
            .Returns(Task.CompletedTask);

        var beforeCreate = DateTime.UtcNow;

        // Act
        await _service.CreateAsync(movie);

        var afterCreate = DateTime.UtcNow;

        // Assert
        Assert.That(capturedMovie, Is.Not.Null);
        Assert.That(capturedMovie.Id, Is.Not.EqualTo(Guid.Empty));
        Assert.That(capturedMovie.CreatedAt, Is.GreaterThanOrEqualTo(beforeCreate));
        Assert.That(capturedMovie.CreatedAt, Is.LessThanOrEqualTo(afterCreate));
        Assert.That(capturedMovie.UpdatedAt, Is.GreaterThanOrEqualTo(beforeCreate));
        Assert.That(capturedMovie.UpdatedAt, Is.LessThanOrEqualTo(afterCreate));
    }

    [Test]
    public async Task CreateAsync_ShouldCallInsertOneAsync()
    {
        // Arrange
        var movie = new Movie { Title = "Test Movie" };

        _mockCollection
            .Setup(c => c.InsertOneAsync(It.IsAny<Movie>(), null, default))
            .Returns(Task.CompletedTask);

        // Act
        await _service.CreateAsync(movie);

        // Assert
        _mockCollection.Verify(
            c => c.InsertOneAsync(It.IsAny<Movie>(), null, default),
            Times.Once);
    }

    #endregion

    #region CreateManyAsync Tests

    [Test]
    public async Task CreateManyAsync_ShouldCallInsertManyAsync()
    {
        // Arrange
        var movies = new List<Movie>
        {
            new Movie { Title = "Movie 1" },
            new Movie { Title = "Movie 2" },
            new Movie { Title = "Movie 3" }
        };

        _mockCollection
            .Setup(c => c.InsertManyAsync(It.IsAny<IEnumerable<Movie>>(), null, default))
            .Returns(Task.CompletedTask);

        // Act
        await _service.CreateManyAsync(movies);

        // Assert
        _mockCollection.Verify(
            c => c.InsertManyAsync(
                It.Is<IEnumerable<Movie>>(list => list.Count() == 3),
                null,
                default),
            Times.Once);
    }

    [Test]
    public async Task CreateManyAsync_ShouldHandleEmptyList()
    {
        // Arrange
        var movies = new List<Movie>();

        _mockCollection
            .Setup(c => c.InsertManyAsync(It.IsAny<IEnumerable<Movie>>(), null, default))
            .Returns(Task.CompletedTask);

        // Act
        await _service.CreateManyAsync(movies);

        // Assert
        _mockCollection.Verify(
            c => c.InsertManyAsync(It.IsAny<IEnumerable<Movie>>(), null, default),
            Times.Once);
    }

    #endregion

    #region GetByGenresAsync Tests

    [Test]
    public async Task GetByGenresAsync_ShouldReturnMoviesWithMatchingGenres()
    {
        // Arrange
        var movies = new List<Movie>
        {
            new Movie
            {
                Id = Guid.NewGuid(),
                Title = "Action Movie",
                Genres = new List<string> { "Action", "Adventure" }
            },
            new Movie
            {
                Id = Guid.NewGuid(),
                Title = "Sci-Fi Movie",
                Genres = new List<string> { "Sci-Fi", "Action" }
            }
        };

        SetupFindAsync(movies);

        // Act
        var result = await _service.GetByGenresAsync(new List<string> { "Action" });

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task GetByGenresAsync_ShouldReturnEmptyList_WhenNoMatches()
    {
        // Arrange
        SetupFindAsync(new List<Movie>());

        // Act
        var result = await _service.GetByGenresAsync(new List<string> { "Horror" });

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.Empty);
    }

    [Test]
    public async Task GetByGenresAsync_ShouldHandleMultipleGenres()
    {
        // Arrange
        var movies = new List<Movie>
        {
            new Movie
            {
                Id = Guid.NewGuid(),
                Title = "Mixed Genre Movie",
                Genres = new List<string> { "Action", "Comedy", "Drama" }
            }
        };

        SetupFindAsync(movies);

        // Act
        var result = await _service.GetByGenresAsync(new List<string> { "Action", "Drama" });

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(1));
    }

    #endregion

    #region UpdateAsync Tests

    [Test]
    public async Task UpdateAsync_ShouldUpdateMovieAndSetUpdatedAt()
    {
        // Arrange
        var movieId = Guid.NewGuid();
        var movie = new Movie
        {
            Id = movieId,
            Title = "Updated Title",
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        Movie capturedMovie = null;
        _mockCollection
            .Setup(c => c.ReplaceOneAsync(
                It.IsAny<FilterDefinition<Movie>>(),
                It.IsAny<Movie>(),
                It.IsAny<ReplaceOptions>(),
                default))
            .Callback<FilterDefinition<Movie>, Movie, ReplaceOptions, CancellationToken>(
                (_, m, _, _) => capturedMovie = m)
            .ReturnsAsync(new ReplaceOneResult.Acknowledged(1, 1, null));

        var beforeUpdate = DateTime.UtcNow;

        // Act
        await _service.UpdateAsync(movieId, movie);

        var afterUpdate = DateTime.UtcNow;

        // Assert
        Assert.That(capturedMovie, Is.Not.Null);
        Assert.That(capturedMovie.UpdatedAt, Is.GreaterThanOrEqualTo(beforeUpdate));
        Assert.That(capturedMovie.UpdatedAt, Is.LessThanOrEqualTo(afterUpdate));
    }

    [Test]
    public async Task UpdateAsync_ShouldCallReplaceOneAsync()
    {
        // Arrange
        var movieId = Guid.NewGuid();
        var movie = new Movie { Id = movieId, Title = "Updated Movie" };

        _mockCollection
            .Setup(c => c.ReplaceOneAsync(
                It.IsAny<FilterDefinition<Movie>>(),
                It.IsAny<Movie>(),
                It.IsAny<ReplaceOptions>(),
                default))
            .ReturnsAsync(new ReplaceOneResult.Acknowledged(1, 1, null));

        // Act
        await _service.UpdateAsync(movieId, movie);

        // Assert
        _mockCollection.Verify(
            c => c.ReplaceOneAsync(
                It.IsAny<FilterDefinition<Movie>>(),
                It.IsAny<Movie>(),
                It.IsAny<ReplaceOptions>(),
                default),
            Times.Once);
    }

    #endregion

    #region DeleteAsync Tests

    [Test]
    public async Task DeleteAsync_ShouldCallDeleteOneAsync()
    {
        // Arrange
        var movieId = Guid.NewGuid();

        _mockCollection
            .Setup(c => c.DeleteOneAsync(
                It.IsAny<FilterDefinition<Movie>>(),
                default))
            .ReturnsAsync(new DeleteResult.Acknowledged(1));

        // Act
        await _service.DeleteAsync(movieId);

        // Assert
        _mockCollection.Verify(
            c => c.DeleteOneAsync(
                It.IsAny<FilterDefinition<Movie>>(),
                default),
            Times.Once);
    }

    [Test]
    public Task DeleteAsync_ShouldHandleNonExistentMovie()
    {
        // Arrange
        var movieId = Guid.NewGuid();

        _mockCollection
            .Setup(c => c.DeleteOneAsync(
                It.IsAny<FilterDefinition<Movie>>(),
                default))
            .ReturnsAsync(new DeleteResult.Acknowledged(0));

        // Act & Assert - nu ar trebui să arunce excepție
        Assert.DoesNotThrowAsync(async () => await _service.DeleteAsync(movieId));
        return Task.CompletedTask;
    }

    #endregion

    #region Helper Methods

    private void SetupFindAsync(List<Movie> movies)
    {
        _mockCursor
            .Setup(c => c.Current)
            .Returns(movies);

        _mockCursor
            .SetupSequence(c => c.MoveNext(It.IsAny<CancellationToken>()))
            .Returns(true)
            .Returns(false);

        _mockCursor
            .SetupSequence(c => c.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        _mockCollection
            .Setup(c => c.FindAsync(
                It.IsAny<FilterDefinition<Movie>>(),
                It.IsAny<FindOptions<Movie, Movie>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(_mockCursor.Object);
    }

    #endregion
}