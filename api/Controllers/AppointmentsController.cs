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
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /appointments/available-doctors - Get all doctors (with or without available slots)
        [HttpGet("available-doctors")]
        public async Task<ActionResult<IEnumerable<AvailableDoctorResponse>>> GetAvailableDoctors(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                // Default to today and 30 days from now if not specified
                var start = startDate ?? DateTime.UtcNow.Date;
                var end = endDate ?? start.AddDays(30);
                
                // Ensure dates are UTC
                var utcStartDate = DateTime.SpecifyKind(start.Date, DateTimeKind.Utc);
                var utcEndDate = DateTime.SpecifyKind(end.Date.AddDays(1), DateTimeKind.Utc);

                var doctors = await _context.AppUsers
                    .Where(u => u.Role == "doctor")
                    .ToListAsync();

                var result = new List<AvailableDoctorResponse>();

                foreach (var doctor in doctors)
                {
                    var doctorProfile = await _context.DoctorProfiles
                        .FirstOrDefaultAsync(p => p.UserId == doctor.Id);

                    // Get available slots instead of availability blocks
                    var availableSlots = await _context.DoctorAvailabilitySlots
                        .Where(s => s.Availability.DoctorId == doctor.Id 
                            && s.Date >= utcStartDate 
                            && s.Date < utcEndDate 
                            && !s.IsBooked)
                        .Include(s => s.Availability)
                        .OrderBy(s => s.Date)
                        .ThenBy(s => s.StartTime)
                        .ToListAsync();

                    // Group slots by their parent availability to show each slot separately
                    var slots = availableSlots.Select(s => new AvailableSlotResponse
                    {
                        AvailabilityId = s.AvailabilityId,
                        Date = s.Date.ToString("yyyy-MM-dd"),
                        StartTime = s.StartTime.ToString(@"hh\:mm"),
                        EndTime = s.EndTime.ToString(@"hh\:mm"),
                        SlotDurationMinutes = s.Availability.SlotDurationMinutes
                    }).ToList();

                    // Include doctors regardless of whether they have available slots
                    result.Add(new AvailableDoctorResponse
                    {
                        DoctorId = doctor.Id,
                        Name = $"Dr. {doctor.FirstName} {doctor.LastName}",
                        Email = doctor.Email,
                        Phone = doctor.Phone,
                        Specialty = doctorProfile?.Specialty ?? "General Practice",
                        Hospital = doctorProfile?.Hospital,
                        Bio = doctorProfile?.Bio,
                        AvailableSlots = slots
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAvailableDoctors: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // POST: /appointments/book - Book an appointment
        [HttpPost("book")]
        [Authorize(Policy = "PatientOnly")]
        public async Task<ActionResult<AppointmentResponse>> BookAppointment([FromBody] BookAppointmentRequest request)
        {
            var patientId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            // Find the specific slot instead of the availability block
            DoctorAvailabilitySlot? slot = null;

            if (!string.IsNullOrEmpty(request.SlotStartTime) && 
                !string.IsNullOrEmpty(request.SlotEndTime) && 
                !string.IsNullOrEmpty(request.SlotDate))
            {
                if (!TimeSpan.TryParse(request.SlotStartTime, out var slotStart))
                    return BadRequest(new { message = "Invalid slot start time" });
                if (!TimeSpan.TryParse(request.SlotEndTime, out var slotEnd))
                    return BadRequest(new { message = "Invalid slot end time" });

                var slotDate = DateTime.Parse(request.SlotDate);
                var utcSlotDate = DateTime.SpecifyKind(slotDate.Date, DateTimeKind.Utc);

                slot = await _context.DoctorAvailabilitySlots
                    .Include(s => s.Availability)
                    .FirstOrDefaultAsync(s => s.AvailabilityId == request.AvailabilityId
                        && s.Date == utcSlotDate
                        && s.StartTime == slotStart
                        && s.EndTime == slotEnd
                        && !s.IsBooked);
            }

            if (slot == null)
                return NotFound(new { message = "Slot not found or already booked" });

            // Check if this patient already has an appointment at the same time with the same doctor
            var existingAppointment = await _context.Appointments
                .FirstOrDefaultAsync(a => 
                    a.PatientId == patientId 
                    && a.DoctorId == slot.Availability!.DoctorId
                    && a.StartTime == DateTime.SpecifyKind(slot.Date.Date.Add(slot.StartTime), DateTimeKind.Utc)
                    && a.Status != "cancelled");

            if (existingAppointment != null)
                return BadRequest(new { message = "You have already booked this appointment slot" });

            var appointment = new Appointments
            {
                Id = Guid.NewGuid(),
                DoctorId = slot.Availability!.DoctorId,
                PatientId = patientId,
                StartTime = DateTime.SpecifyKind(slot.Date.Date.Add(slot.StartTime), DateTimeKind.Utc),
                EndTime = DateTime.SpecifyKind(slot.Date.Date.Add(slot.EndTime), DateTimeKind.Utc),
                Status = "scheduled",
                CreatedAt = DateTime.UtcNow
            };

            // Mark only this specific slot as booked
            slot.IsBooked = true;

            _context.Appointments.Add(appointment);
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Handle the case where another patient booked the same slot simultaneously
                return Conflict(new { message = "This slot was just booked by another patient. Please select a different time." });
            }

            return Created($"/appointments/{appointment.Id}", new AppointmentResponse
            {
                Id = appointment.Id,
                DoctorId = appointment.DoctorId,
                PatientId = appointment.PatientId,
                StartTime = appointment.StartTime,
                EndTime = appointment.EndTime,
                Status = appointment.Status,
                CreatedAt = appointment.CreatedAt
            });
        }

        // GET: /appointments/my-appointments - Get current user's appointments
        [HttpGet("my-appointments")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AppointmentDetailResponse>>> GetMyAppointments()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            IQueryable<Appointments> query;

            if (userRole == "patient")
            {
                query = _context.Appointments
                    .Where(a => a.PatientId == userId)
                    .Include(a => a.Doctor);
            }
            else if (userRole == "doctor")
            {
                query = _context.Appointments
                    .Where(a => a.DoctorId == userId)
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor);
            }
            else
            {
                return Forbid();
            }

            var appointments = await query
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();

            var result = new List<AppointmentDetailResponse>();
            foreach (var a in appointments)
            {
                string? doctorSpecialty = null;
                if (a.Doctor != null)
                {
                    var doctorProfile = await _context.DoctorProfiles.FirstOrDefaultAsync(p => p.UserId == a.DoctorId);
                    doctorSpecialty = doctorProfile?.Specialty;
                }

                result.Add(new AppointmentDetailResponse
                {
                    Id = a.Id,
                    DoctorId = a.DoctorId,
                    PatientId = a.PatientId,
                    DoctorName = a.Doctor != null ? $"Dr. {a.Doctor.FirstName} {a.Doctor.LastName}" : "Unknown",
                    DoctorSpecialty = doctorSpecialty,
                    PatientName = a.Patient != null ? $"{a.Patient.FirstName} {a.Patient.LastName}" : "Unknown",
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt
                });
            }

            return Ok(result);
        }

        // DELETE: /appointments/{id} - Cancel appointment
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> CancelAppointment(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            // Only patient or doctor can cancel their own appointment
            if (userRole == "patient" && appointment.PatientId != userId)
                return Forbid();
            if (userRole == "doctor" && appointment.DoctorId != userId)
                return Forbid();

            // Mark availability as not booked
            var availability = await _context.DoctorAvailabilities
                .FirstOrDefaultAsync(a => a.Id == appointment.Id);
            if (availability != null)
            {
                availability.IsBooked = false;
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // Request/Response DTOs
    public class BookAppointmentRequest
    {
        public Guid AvailabilityId { get; set; }
        public string? SlotStartTime { get; set; }
        public string? SlotEndTime { get; set; }
        public string? SlotDate { get; set; }
    }

    public class AvailableDoctorResponse
    {
        public Guid DoctorId { get; set; }
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public string Specialty { get; set; } = "";
        public string? Hospital { get; set; }
        public string? Bio { get; set; }
        public List<AvailableSlotResponse> AvailableSlots { get; set; } = new();
    }

    public class AvailableSlotResponse
    {
        public Guid AvailabilityId { get; set; }
        public string Date { get; set; } = "";
        public string StartTime { get; set; } = "";
        public string EndTime { get; set; } = "";
        public int SlotDurationMinutes { get; set; }
    }

    public class AppointmentResponse
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public Guid PatientId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class AppointmentDetailResponse
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public Guid PatientId { get; set; }
        public string DoctorName { get; set; } = "";
        public string? DoctorSpecialty { get; set; }
        public string PatientName { get; set; } = "";
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}
