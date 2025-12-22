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

            // Parse time strings to TimeSpan
            if (!TimeSpan.TryParse(request.StartTime, out var startTime))
                return BadRequest(new { message = "Invalid start time format. Use HH:mm" });
            
            if (!TimeSpan.TryParse(request.EndTime, out var endTime))
                return BadRequest(new { message = "Invalid end time format. Use HH:mm" });

            if (startTime >= endTime)
                return BadRequest(new { message = "Start time must be before end time" });

            var requestDate = DateTime.SpecifyKind(request.Date.Date, DateTimeKind.Utc);

            // Get all existing slots for this doctor on this date to avoid duplicates
            var existingSlots = await _context.DoctorAvailabilitySlots
                .Include(s => s.Availability)
                .Where(s => s.Availability.DoctorId == doctorId && s.Date == requestDate)
                .ToListAsync();

            var availability = new DoctorAvailability
            {
                Id = Guid.NewGuid(),
                DoctorId = doctorId,
                Date = requestDate,
                StartTime = startTime,
                EndTime = endTime,
                SlotDurationMinutes = request.SlotDurationMinutes,
                CreatedAt = DateTime.UtcNow
            };

            // Generate individual time slots, skipping those that already exist
            var slots = new List<DoctorAvailabilitySlot>();
            var startTotalMinutes = (int)startTime.TotalMinutes;
            var endTotalMinutes = (int)endTime.TotalMinutes;

            for (int time = startTotalMinutes; time < endTotalMinutes; time += request.SlotDurationMinutes)
            {
                var slotEndTime = time + request.SlotDurationMinutes;
                
                if (slotEndTime <= endTotalMinutes)
                {
                    var slotStartTimeSpan = TimeSpan.FromMinutes(time);
                    var slotEndTimeSpan = TimeSpan.FromMinutes(slotEndTime);

                    // Check if this exact slot already exists
                    var slotExists = existingSlots.Any(s => 
                        s.StartTime == slotStartTimeSpan && 
                        s.EndTime == slotEndTimeSpan);

                    if (!slotExists)
                    {
                        slots.Add(new DoctorAvailabilitySlot
                        {
                            Id = Guid.NewGuid(),
                            AvailabilityId = availability.Id,
                            Date = availability.Date,
                            StartTime = slotStartTimeSpan,
                            EndTime = slotEndTimeSpan,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            // Only create availability if we have new slots to add
            if (slots.Count == 0)
            {
                return BadRequest(new { message = "All time slots in this range already exist. Please select a different time frame." });
            }

            // Add availability and explicitly add each slot to context
            _context.DoctorAvailabilities.Add(availability);
            foreach (var slot in slots)
            {
                _context.DoctorAvailabilitySlots.Add(slot);
            }
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

        // DELETE: /availability/{id} - Remove availability block (all slots)
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

        // DELETE: /availability/slot/{slotId} - Remove a single time slot
        [HttpDelete("slot/{slotId}")]
        [Authorize(Policy = "DoctorOnly")]
        public async Task<IActionResult> DeleteSlot(Guid slotId)
        {
            var slot = await _context.DoctorAvailabilitySlots
                .Include(s => s.Availability)
                .FirstOrDefaultAsync(s => s.Id == slotId);

            if (slot == null)
                return NotFound(new { message = "Slot not found" });

            // Verify doctor owns this slot
            var doctorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            if (slot.Availability.DoctorId != doctorId)
                return Forbid();

            // Prevent deletion of booked slots
            if (slot.IsBooked)
                return BadRequest(new { message = "Cannot delete a booked slot" });

            _context.DoctorAvailabilitySlots.Remove(slot);
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

            // Parse time strings to TimeSpan
            if (!TimeSpan.TryParse(request.StartTime, out var startTime))
                return BadRequest(new { message = "Invalid start time format. Use HH:mm" });
            
            if (!TimeSpan.TryParse(request.EndTime, out var endTime))
                return BadRequest(new { message = "Invalid end time format. Use HH:mm" });

            if (startTime >= endTime)
                return BadRequest(new { message = "Start time must be before end time" });

            availability.Date = request.Date.Date;
            availability.StartTime = startTime;
            availability.EndTime = endTime;
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

        // GET: /availability/my-schedule - Get current doctor's available slots
        [HttpGet("my-schedule")]
        [Authorize(Policy = "DoctorOnly")]
        public async Task<ActionResult<IEnumerable<object>>> GetMySchedule(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var doctorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            
            // Ensure dates are UTC
            var utcStartDate = DateTime.SpecifyKind(startDate.Date, DateTimeKind.Utc);
            var utcEndDate = DateTime.SpecifyKind(endDate.Date.AddDays(1), DateTimeKind.Utc);

            // Return individual slots, not availability blocks
            var slots = await _context.DoctorAvailabilitySlots
                .Include(s => s.Availability)
                .Where(s => s.Availability.DoctorId == doctorId 
                         && s.Date >= utcStartDate 
                         && s.Date < utcEndDate
                         && !s.IsBooked)  // Only return unbooked slots
                .OrderBy(s => s.Date)
                .ThenBy(s => s.StartTime)
                .Select(s => new
                {
                    Id = s.Id,
                    AvailabilityId = s.AvailabilityId,
                    Date = s.Date,
                    StartTime = s.StartTime.ToString(@"hh\:mm"),
                    EndTime = s.EndTime.ToString(@"hh\:mm"),
                    IsBooked = s.IsBooked,
                    SlotDurationMinutes = s.Availability.SlotDurationMinutes
                })
                .ToListAsync();

            return Ok(slots);
        }
    }
}
