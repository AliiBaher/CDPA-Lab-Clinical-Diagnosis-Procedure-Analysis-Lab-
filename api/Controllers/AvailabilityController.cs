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
    [Authorize]
    public class AvailabilityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AvailabilityController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /availability/{doctorId} - Get doctor's availability for a date range
        [HttpGet("{doctorId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<AvailabilityResponse>>> GetDoctorAvailability(
            Guid doctorId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var availabilities = await _context.DoctorAvailabilities
                .Where(a => a.DoctorId == doctorId && a.Date >= startDate && a.Date <= endDate)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.StartTime)
                .Select(a => new AvailabilityResponse
                {
                    Id = a.Id,
                    DoctorId = a.DoctorId,
                    Date = a.Date,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    SlotDurationMinutes = a.SlotDurationMinutes,
                    IsBooked = a.IsBooked,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return Ok(availabilities);
        }

        // POST: /availability - Add availability slot
        [HttpPost]
        [Authorize(Policy = "DoctorOnly")]
        public async Task<ActionResult<AvailabilityResponse>> AddAvailability([FromBody] AvailabilityRequest request)
        {
            var doctorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            if (request.StartTime >= request.EndTime)
                return BadRequest(new { message = "Start time must be before end time" });

            var availability = new DoctorAvailability
            {
                Id = Guid.NewGuid(),
                DoctorId = doctorId,
                Date = request.Date.Date,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                SlotDurationMinutes = request.SlotDurationMinutes,
                CreatedAt = DateTime.UtcNow
            };

            _context.DoctorAvailabilities.Add(availability);
            await _context.SaveChangesAsync();

            return Created($"/availability/{availability.Id}", new AvailabilityResponse
            {
                Id = availability.Id,
                DoctorId = availability.DoctorId,
                Date = availability.Date,
                StartTime = availability.StartTime,
                EndTime = availability.EndTime,
                SlotDurationMinutes = availability.SlotDurationMinutes,
                IsBooked = availability.IsBooked,
                CreatedAt = availability.CreatedAt
            });
        }

        // DELETE: /availability/{id} - Remove availability slot
        [HttpDelete("{id}")]
        [Authorize(Policy = "DoctorOnly")]
        public async Task<IActionResult> DeleteAvailability(Guid id)
        {
            var availability = await _context.DoctorAvailabilities.FindAsync(id);
            if (availability == null)
                return NotFound();

            // Verify doctor owns this availability
            var doctorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            if (availability.DoctorId != doctorId)
                return Forbid();

            _context.DoctorAvailabilities.Remove(availability);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: /availability/{id} - Update availability slot
        [HttpPut("{id}")]
        [Authorize(Policy = "DoctorOnly")]
        public async Task<ActionResult<AvailabilityResponse>> UpdateAvailability(Guid id, [FromBody] AvailabilityRequest request)
        {
            var availability = await _context.DoctorAvailabilities.FindAsync(id);
            if (availability == null)
                return NotFound();

            var doctorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            if (availability.DoctorId != doctorId)
                return Forbid();

            if (request.StartTime >= request.EndTime)
                return BadRequest(new { message = "Start time must be before end time" });

            availability.Date = request.Date.Date;
            availability.StartTime = request.StartTime;
            availability.EndTime = request.EndTime;
            availability.SlotDurationMinutes = request.SlotDurationMinutes;
            availability.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new AvailabilityResponse
            {
                Id = availability.Id,
                DoctorId = availability.DoctorId,
                Date = availability.Date,
                StartTime = availability.StartTime,
                EndTime = availability.EndTime,
                SlotDurationMinutes = availability.SlotDurationMinutes,
                IsBooked = availability.IsBooked,
                CreatedAt = availability.CreatedAt
            });
        }

        // GET: /availability/my-schedule - Get current doctor's availability
        [HttpGet("my-schedule")]
        [Authorize(Policy = "DoctorOnly")]
        public async Task<ActionResult<IEnumerable<AvailabilityResponse>>> GetMySchedule(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var doctorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var availabilities = await _context.DoctorAvailabilities
                .Where(a => a.DoctorId == doctorId && a.Date >= startDate && a.Date <= endDate)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.StartTime)
                .Select(a => new AvailabilityResponse
                {
                    Id = a.Id,
                    DoctorId = a.DoctorId,
                    Date = a.Date,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    SlotDurationMinutes = a.SlotDurationMinutes,
                    IsBooked = a.IsBooked,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return Ok(availabilities);
        }
    }
}
