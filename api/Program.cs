using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Data;
using Api.Models;
using Api.Seeds;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1) DB
var connStr = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr));

// 1.5) Controllers
builder.Services.AddControllers();

// 2) Password service
builder.Services.AddScoped<PasswordService>();

// 2.5) JWT service
builder.Services.AddScoped<JwtService>();

// 2.6) CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// 3) JWT config
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"]!;
var jwtIssuer = jwtSection["Issuer"]!;
var jwtAudience = jwtSection["Audience"]!;
var jwtKeyBytes = Encoding.UTF8.GetBytes(jwtKey);

// 4) Authentication + Authorization
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtKeyBytes),

            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("admin"));

    options.AddPolicy("DoctorOnly", policy =>
        policy.RequireRole("doctor"));

    options.AddPolicy("PatientOnly", policy =>
        policy.RequireRole("patient"));

    options.AddPolicy("DoctorOrAdmin", policy =>
        policy.RequireRole("doctor", "admin"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Protected endpoint to get current user
app.MapGet("/auth/me", async (HttpContext http, AppDbContext db) =>
{
    // Get the Sub claim (user ID) from the JWT - use ClaimTypes.NameIdentifier
    var userIdClaim = http.User.FindFirstValue(ClaimTypes.NameIdentifier);
    
    if (string.IsNullOrEmpty(userIdClaim))
        return Results.Unauthorized();

    if (!Guid.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();

    var user = await db.AppUsers.FindAsync(userId);
    if (user == null)
        return Results.Unauthorized();

    return Results.Ok(new { user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.Role, user.CreatedAt });
})
.RequireAuthorization();

// Admin endpoints group
var adminGroup = app.MapGroup("/admin")
    .RequireAuthorization("AdminOnly");

adminGroup.MapGet("/users", async (AppDbContext db) =>
{
    var users = await db.AppUsers
        .OrderBy(u => u.CreatedAt)
        .Select(u => new { u.Id, u.Email, u.FirstName, u.LastName, u.Phone, u.Role, u.CreatedAt })
        .ToListAsync();

    return Results.Ok(users);
});

// Doctor endpoints group
var doctorGroup = app.MapGroup("/doctor")
    .RequireAuthorization("DoctorOnly");

doctorGroup.MapGet("/hello", (ClaimsPrincipal user) =>
{
    var email = user.FindFirstValue(ClaimTypes.Email);
    return Results.Ok(new { message = $"Hello Doctor {email}" });
});

// Patient endpoints group
var patientGroup = app.MapGroup("/patient")
    .RequireAuthorization("PatientOnly");

patientGroup.MapGet("/appointments", () =>
{
    return Results.Ok(new { message = "Patient appointments placeholder" });
});

// Weather endpoint (optional)
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild",
    "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast(
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

// Seed admin user
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var passwordService = scope.ServiceProvider.GetRequiredService<PasswordService>();
    await AdminSeeder.SeedAdminAsync(context, passwordService);
}

app.Run();

// DTOs
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
