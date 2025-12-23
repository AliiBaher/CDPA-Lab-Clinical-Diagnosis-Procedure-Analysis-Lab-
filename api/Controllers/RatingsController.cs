using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RatingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RatingsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: /ratings - Submit a rating for a doctor
        [HttpPost]
        [Authorize(Policy = "PatientOnly")]
        public async Task<ActionResult<RatingResponse>> SubmitRating([FromBody] SubmitRatingRequest request)
        {
            var patientId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            // Verify the appointment exists and belongs to this patient
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId && a.PatientId == patientId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            // Check if appointment has ended
            if (appointment.EndTime > DateTime.UtcNow)
                return BadRequest(new { message = "Cannot rate an appointment that hasn't ended yet" });

            // Check if rating already exists for this appointment
            var existingRating = await _context.DoctorRatings
                .FirstOrDefaultAsync(r => r.AppointmentId == request.AppointmentId);

            if (existingRating != null)
                return BadRequest(new { message = "You have already rated this appointment" });

            // Validate rating
            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest(new { message = "Rating must be between 1 and 5" });

            var rating = new DoctorRatings
            {
                Id = Guid.NewGuid(),
                DoctorId = appointment.DoctorId,
                PatientId = patientId,
                AppointmentId = request.AppointmentId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow,
                IsPublic = true
            };

            _context.DoctorRatings.Add(rating);
            await _context.SaveChangesAsync();

            return Created($"/ratings/{rating.Id}", new RatingResponse
            {
                Id = rating.Id,
                DoctorId = rating.DoctorId,
                PatientId = rating.PatientId,
                AppointmentId = rating.AppointmentId,
                Rating = rating.Rating,
                Comment = rating.Comment,
                CreatedAt = rating.CreatedAt
            });
        }

        // GET: /ratings/appointment/{appointmentId} - Check if rating exists for an appointment
        [HttpGet("appointment/{appointmentId}")]
        [Authorize]
        public async Task<ActionResult<RatingResponse?>> GetRatingByAppointment(Guid appointmentId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var rating = await _context.DoctorRatings
                .FirstOrDefaultAsync(r => r.AppointmentId == appointmentId && r.PatientId == userId);

            if (rating == null)
                return Ok(null);

            return Ok(new RatingResponse
            {
                Id = rating.Id,
                DoctorId = rating.DoctorId,
                PatientId = rating.PatientId,
                AppointmentId = rating.AppointmentId,
                Rating = rating.Rating,
                Comment = rating.Comment,
                CreatedAt = rating.CreatedAt
            });
        }

        // GET: /ratings/doctor/{doctorId} - Get all ratings for a doctor
        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<DoctorRatingSummary>> GetDoctorRatings(Guid doctorId)
        {
            var ratings = await _context.DoctorRatings
                .Where(r => r.DoctorId == doctorId && r.IsPublic)
                .Include(r => r.Patient)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var averageRating = ratings.Any() ? ratings.Average(r => r.Rating) : 0;

            return Ok(new DoctorRatingSummary
            {
                DoctorId = doctorId,
                AverageRating = Math.Round(averageRating, 1),
                TotalRatings = ratings.Count,
                Ratings = ratings.Select(r => new RatingDetailResponse
                {
                    Id = r.Id,
                    PatientName = $"{r.Patient?.FirstName} {r.Patient?.LastName}",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList()
            });
        }

        // GET: /ratings/doctor/me - Get ratings for the logged-in doctor
        [HttpGet("doctor/me")]
        [Authorize(Policy = "DoctorOnly")]
        public async Task<ActionResult<DoctorRatingSummary>> GetMyRatings()
        {
            var doctorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var ratings = await _context.DoctorRatings
                .Where(r => r.DoctorId == doctorId && r.IsPublic)
                .Include(r => r.Patient)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var averageRating = ratings.Any() ? ratings.Average(r => r.Rating) : 0;

            return Ok(new DoctorRatingSummary
            {
                DoctorId = doctorId,
                AverageRating = Math.Round(averageRating, 1),
                TotalRatings = ratings.Count,
                Ratings = ratings.Select(r => new RatingDetailResponse
                {
                    Id = r.Id,
                    PatientName = $"{r.Patient?.FirstName} {r.Patient?.LastName}",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList()
            });
        }
    }

    // DTOs
    public class SubmitRatingRequest
    {
        public Guid AppointmentId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class RatingResponse
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public Guid PatientId { get; set; }
        public Guid AppointmentId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RatingDetailResponse
    {
        public Guid Id { get; set; }
        public string PatientName { get; set; } = "";
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DoctorRatingSummary
    {
        public Guid DoctorId { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public List<RatingDetailResponse> Ratings { get; set; } = new();
    }
}
