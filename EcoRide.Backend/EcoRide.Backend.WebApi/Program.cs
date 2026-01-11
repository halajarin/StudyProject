using System.Text;
using EcoRide.Backend.Business.Helpers;
using EcoRide.Backend.Business.Services;
using EcoRide.Backend.Business.Services.Interfaces;
using EcoRide.Backend.Data.Context;
using EcoRide.Backend.Data.Repositories;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.WebApi.Middleware;
using EcoRide.Backend.WebApi.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// PostgreSQL Configuration
builder.Services.AddDbContext<EcoRideContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL"))
);

// MongoDB Configuration
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var connectionString = builder.Configuration.GetConnectionString("MongoDB");
    return new MongoClient(connectionString);
});

builder.Services.AddScoped(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var databaseName = builder.Configuration["MongoDbSettings:DatabaseName"];
    return client.GetDatabase(databaseName);
});

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        };
    });

builder.Services.AddAuthorization();

// Business Services (Consolidated)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICarpoolService, CarpoolService>();
builder.Services.AddScoped<IPreferenceService, PreferenceService>();

// Helper Services
builder.Services.AddScoped<IEmailHelper, EmailHelper>();
builder.Services.AddScoped<ILocalizationHelper, LocalizationHelper>();

// Repository registration
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICarpoolRepository, CarpoolRepository>();
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

// Configure JSON serialization for enum conversion
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Allow string to enum conversion
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// FluentValidation Configuration
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<LoginDTOValidator>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "EcoRide API", Version = "v1" });
    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Description =
                "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
        }
    );
    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                Array.Empty<string>()
            },
        }
    );
});

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAngular",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:4200")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    );
});

var app = builder.Build();

// HTTP pipeline configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Global error handling middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

// Localization middleware
app.UseMiddleware<LocalizationMiddleware>();

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
