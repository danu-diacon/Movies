using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using Movies.Api.Services;
using Movies.Domain;

var builder = WebApplication.CreateBuilder(args);

// --- MongoDB GUID Serialization ---
BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

// --- General configuration ---
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// --- MongoDB Settings ---
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// --- Redis Cache ---
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration =
        builder.Configuration.GetConnectionString("Redis") ??
        builder.Configuration["Redis:ConnectionString"] ??
        "redis:6379"; // fallback sigur pentru Docker

    options.InstanceName = "Movies_";
});

// --- Services ---
builder.Services.AddScoped<MovieService>();

// --- MVC & Swagger ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// --- Swagger ---
if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Docker")
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Movies API v1");
        options.RoutePrefix = string.Empty; // Swagger la /
    });
}

// --- Middleware ---
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.MapControllers();
app.Run();