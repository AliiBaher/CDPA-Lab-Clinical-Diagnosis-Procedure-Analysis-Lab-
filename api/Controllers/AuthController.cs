using Api.Data;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly JwtService _jwtService;

        public AuthController(
            AppDbContext context,
            PasswordService passwordService,
            JwtService jwtService)
        {
            _context = context;
            _passwordService = passwordService;
            _jwtService = jwtService;
        }

        // =========================
        // REGISTER
        // =========================
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            if (await _context.AppUsers.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email already taken");

            var user = new AppUser
            {
                Email = request.Email,
                PasswordHash = _passwordService.HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                Role = string.IsNullOrWhiteSpace(request.Role) ? "patient" : request.Role!,
                CreatedAt = DateTime.UtcNow
            };

            _context.AppUsers.Add(user);
            await _context.SaveChangesAsync();

            if (user.Role.ToLower() == "doctor")
            {
                var doctorProfile = new DoctorProfiles
                {
                    UserId = user.Id,
                    Specialty = request.Specialty ?? "",
                    IsActive = true
                };

                _context.DoctorProfiles.Add(doctorProfile);
                await _context.SaveChangesAsync();
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,
                Role = user.Role
            });
        }

        // =========================
        // LOGIN
        // =========================
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _context.AppUsers
                .SingleOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return BadRequest(new { message = "Invalid email or password" });

            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
                return BadRequest(new { message = "Invalid email or password" });

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,
                Role = user.Role
            });
        }

        // =========================
        // UPDATE PROFILE
        // =========================
        [Authorize]
        [HttpPut("profile")]
        public async Task<ActionResult<UpdateProfileResponse>> UpdateProfile(UpdateProfileRequest request)
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized();

            var user = await _context.AppUsers
                .SingleOrDefaultAsync(u => u.Email == userEmail);

            if (user == null)
                return NotFound("User not found");

            if (request.Email != user.Email)
            {
                if (await _context.AppUsers.AnyAsync(u => u.Email == request.Email && u.Id != user.Id))
                    return BadRequest("Email already taken");
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Email = request.Email;
            user.Phone = request.Phone;

            await _context.SaveChangesAsync();

            string? specialty = null;
            if (user.Role.ToLower() == "doctor")
            {
                var doctorProfile = await _context.DoctorProfiles
                    .FirstOrDefaultAsync(dp => dp.UserId == user.Id);

                if (doctorProfile != null && !string.IsNullOrEmpty(request.Specialty))
                {
                    doctorProfile.Specialty = request.Specialty;
                    await _context.SaveChangesAsync();
                    specialty = doctorProfile.Specialty;
                }
            }

            return Ok(new UpdateProfileResponse
            {
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Phone = user.Phone,
                Specialty = specialty
            });
        }
    }
}
