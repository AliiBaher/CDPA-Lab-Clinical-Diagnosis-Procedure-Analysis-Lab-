using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/users - Get all users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
        {
            var users = await _context.AppUsers
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Phone = u.Phone ?? "",
                    Role = u.Role,
                    CreatedAt = u.CreatedAt,
                    Specialty = _context.DoctorProfiles
                        .Where(dp => dp.UserId == u.Id)
                        .Select(dp => dp.Specialty)
                        .FirstOrDefault(),
                    IsApproved = u.Role.ToLower() == "doctor" 
                        ? _context.DoctorProfiles
                            .Where(dp => dp.UserId == u.Id)
                            .Select(dp => (bool?)dp.IsActive)
                            .FirstOrDefault()
                        : null
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/admin/statistics - Get system statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<StatisticsDto>> GetStatistics()
        {
            var totalUsers = await _context.AppUsers.CountAsync();
            var totalDoctors = await _context.AppUsers.CountAsync(u => u.Role.ToLower() == "doctor");
            var totalPatients = await _context.AppUsers.CountAsync(u => u.Role.ToLower() == "patient");
            var totalAppointments = await _context.Appointments.CountAsync();
            var pendingAppointments = await _context.Appointments.CountAsync(a => a.Status.ToLower() == "pending");
            var approvedAppointments = await _context.Appointments.CountAsync(a => a.Status.ToLower() == "approved");
            var totalCases = 0; // Cases are in MIMIC-II database, not tracked here

            return Ok(new StatisticsDto
            {
                TotalUsers = totalUsers,
                TotalDoctors = totalDoctors,
                TotalPatients = totalPatients,
                TotalAppointments = totalAppointments,
                PendingAppointments = pendingAppointments,
                ApprovedAppointments = approvedAppointments,
                TotalCases = totalCases
            });
        }

        // GET: api/admin/appointments - Get all appointments overview
        [HttpGet("appointments")]
        public async Task<ActionResult<IEnumerable<AppointmentOverviewDto>>> GetAppointmentsOverview()
        {
            var now = DateTime.UtcNow;
            
            // Note: Auto-deletion disabled to prevent accidentally removing active appointments
            // Admins can manually delete appointments if needed
            
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            var result = appointments.Select(a => new AppointmentOverviewDto
            {
                AppointmentId = a.Id,
                PatientName = (a.Patient?.FirstName ?? "") + " " + (a.Patient?.LastName ?? ""),
                DoctorName = (a.Doctor?.FirstName ?? "") + " " + (a.Doctor?.LastName ?? ""),
                AppointmentDate = a.StartTime,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            }).ToList();

            return Ok(result);
        }

        // PUT: api/admin/users/{id}/role - Update user role
        [HttpPut("users/{id}/role")]
        public async Task<ActionResult> UpdateUserRole(Guid id, [FromBody] UpdateRoleRequest request)
        {
            var user = await _context.AppUsers.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            var validRoles = new[] { "admin", "doctor", "patient" };
            if (!validRoles.Contains(request.Role?.ToLower()))
                return BadRequest("Invalid role. Must be admin, doctor, or patient");

            var oldRole = user.Role;
            user.Role = request.Role!;

            // If changing to doctor, create doctor profile
            if (request.Role?.ToLower() == "doctor" && oldRole.ToLower() != "doctor")
            {
                var existingProfile = await _context.DoctorProfiles.FirstOrDefaultAsync(dp => dp.UserId == user.Id);
                if (existingProfile == null)
                {
                    _context.DoctorProfiles.Add(new DoctorProfiles
                    {
                        UserId = user.Id,
                        Specialty = "General",
                        IsActive = true
                    });
                }
            }

            // If changing from doctor, deactivate doctor profile
            if (oldRole.ToLower() == "doctor" && request.Role?.ToLower() != "doctor")
            {
                var profile = await _context.DoctorProfiles.FirstOrDefaultAsync(dp => dp.UserId == user.Id);
                if (profile != null)
                {
                    profile.IsActive = false;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Role updated successfully" });
        }

        // DELETE: api/admin/users/{id} - Delete user
        [HttpDelete("users/{id}")]
        public async Task<ActionResult> DeleteUser(Guid id)
        {
            var user = await _context.AppUsers.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            // Don't allow deleting yourself
            var currentUserEmail = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            if (user.Email == currentUserEmail)
                return BadRequest("Cannot delete your own account");

            // Delete related records first
            var doctorProfile = await _context.DoctorProfiles.FirstOrDefaultAsync(dp => dp.UserId == id);
            if (doctorProfile != null)
            {
                _context.DoctorProfiles.Remove(doctorProfile);
            }

            var appointments = await _context.Appointments
                .Where(a => a.PatientId == id || a.DoctorId == id)
                .ToListAsync();
            _context.Appointments.RemoveRange(appointments);

            _context.AppUsers.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully" });
        }

        // PUT: api/admin/users/{id}/status - Toggle user status
        [HttpPut("users/{id}/status")]
        public async Task<ActionResult> ToggleUserStatus(Guid id, [FromBody] UpdateStatusRequest request)
        {
            var user = await _context.AppUsers.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            // If it's a doctor, update the doctor profile
            if (user.Role.ToLower() == "doctor")
            {
                var profile = await _context.DoctorProfiles.FirstOrDefaultAsync(dp => dp.UserId == user.Id);
                if (profile != null)
                {
                    profile.IsActive = request.IsActive;
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Status updated successfully" });
        }

        // PUT: api/admin/doctors/{id}/approve - Approve or reject doctor
        [HttpPut("doctors/{id}/approve")]
        public async Task<ActionResult> ApproveDoctorRegistration(Guid id, [FromBody] ApproveDoctorRequest request)
        {
            var user = await _context.AppUsers.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            if (user.Role.ToLower() != "doctor")
                return BadRequest("User is not a doctor");

            var profile = await _context.DoctorProfiles.FirstOrDefaultAsync(dp => dp.UserId == user.Id);
            if (profile == null)
                return NotFound("Doctor profile not found");

            profile.IsActive = request.IsApproved;
            await _context.SaveChangesAsync();

            return Ok(new { message = request.IsApproved ? "Doctor approved successfully" : "Doctor rejected successfully" });
        }

        // PUT: api/admin/appointments/{id}/cancel - Cancel appointment (emergency management)
        [HttpPut("appointments/{id}/cancel")]
        public async Task<ActionResult> CancelAppointment(Guid id, [FromBody] CancelAppointmentRequest request)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound("Appointment not found");

            if (appointment.Status.ToLower() == "cancelled")
                return BadRequest("Appointment is already cancelled");

            appointment.Status = "cancelled";
            
            // Store the cancellation reason in notes
            var currentNotes = appointment.Notes ?? "";
            var cancellationNote = $"[ADMIN CANCELLED] Reason: {request.Reason}";
            appointment.Notes = string.IsNullOrEmpty(currentNotes) 
                ? cancellationNote 
                : $"{currentNotes}\n{cancellationNote}";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment cancelled successfully" });
        }
    }

    // DTOs
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Role { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public string? Specialty { get; set; }
        public bool? IsApproved { get; set; }  // For doctors
    }

    public class StatisticsDto
    {
        public int TotalUsers { get; set; }
        public int TotalDoctors { get; set; }
        public int TotalPatients { get; set; }
        public int TotalAppointments { get; set; }
        public int PendingAppointments { get; set; }
        public int ApprovedAppointments { get; set; }
        public int TotalCases { get; set; }
    }

    public class AppointmentOverviewDto
    {
        public Guid AppointmentId { get; set; }
        public string PatientName { get; set; } = "";
        public string DoctorName { get; set; } = "";
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateRoleRequest
    {
        public string? Role { get; set; }
    }

    public class UpdateStatusRequest
    {
        public bool IsActive { get; set; }
    }

    public class ApproveDoctorRequest
    {
        public bool IsApproved { get; set; }
    }

    public class CancelAppointmentRequest
    {
        public string Reason { get; set; } = "";
    }
}
