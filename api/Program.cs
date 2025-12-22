using System.Security.Claims;
using System.Text;
using api.Services;
using Api.Data;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var connStr = builder.Configuration.GetConnectionString("Default");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr));

builder.Services.AddControllers();

builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IMimicService, MimicService>();
builder.Services.AddScoped<IAdviceService, AdviceService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"]!;
var jwtIssuer = jwtSection["Issuer"]!;
var jwtAudience = jwtSection["Audience"]!;
var jwtKeyBytes = Encoding.UTF8.GetBytes(jwtKey);

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

            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.NameIdentifier
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("admin"));
    options.AddPolicy("DoctorOnly", p => p.RequireRole("doctor"));
    options.AddPolicy("PatientOnly", p => p.RequireRole("patient"));
    options.AddPolicy("DoctorOrAdmin", p => p.RequireRole("doctor", "admin"));
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

app.MapGet("/auth/me", async (HttpContext http, AppDbContext db) =>
{
    var userIdClaim = http.User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userIdClaim))
        return Results.Unauthorized();

    if (!Guid.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();

    var user = await db.AppUsers.FindAsync(userId);
    if (user == null)
        return Results.Unauthorized();

    return Results.Ok(new
    {
        user.Id,
        user.Email,
        user.FirstName,
        user.LastName,
        user.Phone,
        user.Role,
        user.CreatedAt
    });
}).RequireAuthorization();

var adminGroup = app.MapGroup("/admin")
    .RequireAuthorization("AdminOnly");

adminGroup.MapGet("/users", async (AppDbContext db) =>
{
    var users = await db.AppUsers
        .OrderBy(u => u.CreatedAt)
        .Select(u => new
        {
            u.Id,
            u.Email,
            u.FirstName,
            u.LastName,
            u.Phone,
            u.Role,
            u.CreatedAt
        })
        .ToListAsync();

    return Results.Ok(users);
});

var doctorGroup = app.MapGroup("/doctor")
    .RequireAuthorization("DoctorOnly");

doctorGroup.MapGet("/hello", (ClaimsPrincipal user) =>
{
    var email = user.FindFirstValue(ClaimTypes.Email);
    return Results.Ok(new { message = $"Hello Doctor {email}" });
});

var patientGroup = app.MapGroup("/patient")
    .RequireAuthorization("PatientOnly");

patientGroup.MapGet("/appointments", () =>
{
    return Results.Ok(new { message = "Patient appointments placeholder" });
});

app.Run();
