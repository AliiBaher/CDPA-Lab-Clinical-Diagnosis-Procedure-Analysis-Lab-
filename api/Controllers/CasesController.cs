using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CasesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CasesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/cases - Get all cases for the current user
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CaseDetailResponse>>> GetMyCases()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            IQueryable<AppCases> query;

            if (userRole == "patient")
            {
                // Patient sees cases where they are the patient (SubjectCode links to their ID)
                query = _context.AppCases
                    .Where(c => c.SubjectCode == userId.ToString());
            }
            else if (userRole == "doctor")
            {
                // Doctor sees cases assigned to them
                query = _context.AppCases
                    .Where(c => c.DoctorId.HasValue && c.DoctorId == userId);
            }
            else if (userRole == "admin")
            {
                // Admin sees all cases
                query = _context.AppCases;
            }
            else
            {
                return Forbid();
            }

            var cases = await query
                .Include(c => c.Doctor)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var result = new List<CaseDetailResponse>();
            foreach (var c in cases)
            {
                var diagnoses = await _context.AppCaseDiagnoses
                    .Where(d => d.CaseId == c.CaseId)
                    .ToListAsync();
                var procedures = await _context.AppCaseProcedures
                    .Where(p => p.CaseId == c.CaseId)
                    .ToListAsync();
                var prescriptions = await _context.AppCasePrescriptions
                    .Where(pr => pr.CaseId == c.CaseId)
                    .ToListAsync();

                result.Add(MapToCaseDetail(c, diagnoses, procedures, prescriptions));
            }

            return Ok(result);
        }

        // GET: api/cases/{id} - Get specific case details
        [HttpGet("{id}")]
        public async Task<ActionResult<CaseDetailResponse>> GetCase(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var appCase = await _context.AppCases
                .Include(c => c.Doctor)
                .FirstOrDefaultAsync(c => c.CaseId == id);

            if (appCase == null)
                return NotFound(new { message = "Case not found" });

            // Verify access
            if (userRole == "patient" && appCase.SubjectCode != userId.ToString())
                return Forbid();
            if (userRole == "doctor" && (!appCase.DoctorId.HasValue || appCase.DoctorId != userId))
                return Forbid();

            var diagnoses = await _context.AppCaseDiagnoses
                .Where(d => d.CaseId == id)
                .ToListAsync();
            var procedures = await _context.AppCaseProcedures
                .Where(p => p.CaseId == id)
                .ToListAsync();
            var prescriptions = await _context.AppCasePrescriptions
                .Where(pr => pr.CaseId == id)
                .ToListAsync();

            return Ok(MapToCaseDetail(appCase, diagnoses, procedures, prescriptions));
        }

        // POST: api/cases - Create new case (Patient only)
        [HttpPost]
        [Authorize(Roles = "patient")]
        public async Task<ActionResult<CaseDetailResponse>> CreateCase([FromBody] CreateCaseRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Request body is required" });

                if (string.IsNullOrEmpty(request.Gender))
                    return BadRequest(new { message = "Gender is required" });

                var patientId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

                var appCase = new AppCases
                {
                    CaseId = Guid.NewGuid(),
                    SubjectCode = patientId.ToString(),
                    DoctorId = null, // Will be assigned when appointment is booked
                    Gender = request.Gender,
                    Dob = request.Dob,
                    EpisodeStart = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _context.AppCases.Add(appCase);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCase), new { id = appCase.CaseId }, 
                    MapToCaseDetail(appCase, new List<AppCaseDiagnoses>(), 
                        new List<AppCaseProcedures>(), new List<AppCasePrescriptions>()));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create case", error = ex.Message });
            }
        }

        // PUT: api/cases/{id} - Update case (Doctor only)
        [HttpPut("{id}")]
        [Authorize(Roles = "doctor")]
        public async Task<IActionResult> UpdateCase(Guid id, [FromBody] UpdateCaseRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var appCase = await _context.AppCases.FindAsync(id);
            if (appCase == null)
                return NotFound(new { message = "Case not found" });

            if (appCase.DoctorId != userId)
                return Forbid();

            if (request.EpisodeEnd.HasValue)
                appCase.EpisodeEnd = request.EpisodeEnd.Value;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Case updated successfully" });
        }

        // POST: api/cases/{caseId}/diagnoses - Add diagnosis
        [HttpPost("{caseId}/diagnoses")]
        [Authorize(Roles = "doctor")]
        public async Task<ActionResult<DiagnosisResponse>> AddDiagnosis(Guid caseId, [FromBody] AddDiagnosisRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var appCase = await _context.AppCases.FindAsync(caseId);
            if (appCase == null)
                return NotFound(new { message = "Case not found" });

            if (!appCase.DoctorId.HasValue || appCase.DoctorId != userId)
                return Forbid();

            var diagnosis = new AppCaseDiagnoses
            {
                Id = Guid.NewGuid(),
                CaseId = caseId,
                Icd9Code = request.Icd9Code,
                Diagnosis = request.Diagnosis,
                CreatedAt = DateTime.UtcNow
            };

            _context.AppCaseDiagnoses.Add(diagnosis);
            await _context.SaveChangesAsync();

            return Created($"/api/cases/{caseId}/diagnoses", MapToDiagnosisResponse(diagnosis));
        }

        // GET: api/cases/{caseId}/diagnoses - Get all diagnoses for a case
        [HttpGet("{caseId}/diagnoses")]
        public async Task<ActionResult<IEnumerable<DiagnosisResponse>>> GetDiagnoses(Guid caseId)
        {
            var diagnoses = await _context.AppCaseDiagnoses
                .Where(d => d.CaseId == caseId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return Ok(diagnoses.Select(MapToDiagnosisResponse).ToList());
        }

        // DELETE: api/cases/{caseId}/diagnoses/{id} - Remove diagnosis
        [HttpDelete("{caseId}/diagnoses/{id}")]
        [Authorize(Roles = "doctor")]
        public async Task<IActionResult> RemoveDiagnosis(Guid caseId, Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var appCase = await _context.AppCases.FindAsync(caseId);
            if (appCase == null)
                return NotFound(new { message = "Case not found" });

            if (!appCase.DoctorId.HasValue || appCase.DoctorId != userId)
                return Forbid();

            var diagnosis = await _context.AppCaseDiagnoses.FindAsync(id);
            if (diagnosis == null || diagnosis.CaseId != caseId)
                return NotFound(new { message = "Diagnosis not found" });

            _context.AppCaseDiagnoses.Remove(diagnosis);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/cases/{caseId}/procedures - Add procedure
        [HttpPost("{caseId}/procedures")]
        [Authorize(Roles = "doctor")]
        public async Task<ActionResult<ProcedureResponse>> AddProcedure(Guid caseId, [FromBody] AddProcedureRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var appCase = await _context.AppCases.FindAsync(caseId);
            if (appCase == null)
                return NotFound(new { message = "Case not found" });

            if (!appCase.DoctorId.HasValue || appCase.DoctorId != userId)
                return Forbid();

            var procedure = new AppCaseProcedures
            {
                Id = Guid.NewGuid(),
                CaseId = caseId,
                Icd9Code = request.Icd9Code,
                ProcedureDescription = request.ProcedureDescription,
                CreatedAt = DateTime.UtcNow
            };

            _context.AppCaseProcedures.Add(procedure);
            await _context.SaveChangesAsync();

            return Created($"/api/cases/{caseId}/procedures", MapToProcedureResponse(procedure));
        }

        // GET: api/cases/{caseId}/procedures - Get all procedures for a case
        [HttpGet("{caseId}/procedures")]
        public async Task<ActionResult<IEnumerable<ProcedureResponse>>> GetProcedures(Guid caseId)
        {
            var procedures = await _context.AppCaseProcedures
                .Where(p => p.CaseId == caseId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(procedures.Select(MapToProcedureResponse).ToList());
        }

        // DELETE: api/cases/{caseId}/procedures/{id} - Remove procedure
        [HttpDelete("{caseId}/procedures/{id}")]
        [Authorize(Roles = "doctor")]
        public async Task<IActionResult> RemoveProcedure(Guid caseId, Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var appCase = await _context.AppCases.FindAsync(caseId);
            if (appCase == null)
                return NotFound(new { message = "Case not found" });

            if (!appCase.DoctorId.HasValue || appCase.DoctorId != userId)
                return Forbid();

            var procedure = await _context.AppCaseProcedures.FindAsync(id);
            if (procedure == null || procedure.CaseId != caseId)
                return NotFound(new { message = "Procedure not found" });

            _context.AppCaseProcedures.Remove(procedure);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/cases/{caseId}/prescriptions - Add prescription
        [HttpPost("{caseId}/prescriptions")]
        [Authorize(Roles = "doctor")]
        public async Task<ActionResult<PrescriptionResponse>> AddPrescription(Guid caseId, [FromBody] AddPrescriptionRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var appCase = await _context.AppCases.FindAsync(caseId);
            if (appCase == null)
                return NotFound(new { message = "Case not found" });

            if (!appCase.DoctorId.HasValue || appCase.DoctorId != userId)
                return Forbid();

            var prescription = new AppCasePrescriptions
            {
                Id = Guid.NewGuid(),
                CaseId = caseId,
                DrugName = request.DrugName,
                DoseValue = request.DoseValue,
                DoseUnit = request.DoseUnit,
                Route = request.Route,
                CreatedAt = DateTime.UtcNow
            };

            _context.AppCasePrescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            return Created($"/api/cases/{caseId}/prescriptions", MapToPrescriptionResponse(prescription));
        }

        // GET: api/cases/{caseId}/prescriptions - Get all prescriptions for a case
        [HttpGet("{caseId}/prescriptions")]
        public async Task<ActionResult<IEnumerable<PrescriptionResponse>>> GetPrescriptions(Guid caseId)
        {
            var prescriptions = await _context.AppCasePrescriptions
                .Where(p => p.CaseId == caseId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(prescriptions.Select(MapToPrescriptionResponse).ToList());
        }

        // DELETE: api/cases/{caseId}/prescriptions/{id} - Remove prescription
        [HttpDelete("{caseId}/prescriptions/{id}")]
        [Authorize(Roles = "doctor")]
        public async Task<IActionResult> RemovePrescription(Guid caseId, Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

            var appCase = await _context.AppCases.FindAsync(caseId);
            if (appCase == null)
                return NotFound(new { message = "Case not found" });

            if (!appCase.DoctorId.HasValue || appCase.DoctorId != userId)
                return Forbid();

            var prescription = await _context.AppCasePrescriptions.FindAsync(id);
            if (prescription == null || prescription.CaseId != caseId)
                return NotFound(new { message = "Prescription not found" });

            _context.AppCasePrescriptions.Remove(prescription);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Helper methods
        private CaseDetailResponse MapToCaseDetail(AppCases appCase, 
            List<AppCaseDiagnoses> diagnoses, List<AppCaseProcedures> procedures, 
            List<AppCasePrescriptions> prescriptions)
        {
            return new CaseDetailResponse
            {
                CaseId = appCase.CaseId,
                SubjectCode = appCase.SubjectCode,
                DoctorId = appCase.DoctorId,
                DoctorName = appCase.Doctor != null ? $"Dr. {appCase.Doctor.FirstName} {appCase.Doctor.LastName}" : null,
                Gender = appCase.Gender,
                Dob = appCase.Dob,
                EpisodeStart = appCase.EpisodeStart,
                EpisodeEnd = appCase.EpisodeEnd,
                CreatedAt = appCase.CreatedAt,
                Diagnoses = diagnoses.Select(MapToDiagnosisResponse).ToList(),
                Procedures = procedures.Select(MapToProcedureResponse).ToList(),
                Prescriptions = prescriptions.Select(MapToPrescriptionResponse).ToList()
            };
        }

        private DiagnosisResponse MapToDiagnosisResponse(AppCaseDiagnoses diagnosis)
        {
            return new DiagnosisResponse
            {
                Id = diagnosis.Id,
                Icd9Code = diagnosis.Icd9Code,
                Diagnosis = diagnosis.Diagnosis,
                CreatedAt = diagnosis.CreatedAt
            };
        }

        private ProcedureResponse MapToProcedureResponse(AppCaseProcedures procedure)
        {
            return new ProcedureResponse
            {
                Id = procedure.Id,
                Icd9Code = procedure.Icd9Code,
                ProcedureDescription = procedure.ProcedureDescription,
                CreatedAt = procedure.CreatedAt
            };
        }

        private PrescriptionResponse MapToPrescriptionResponse(AppCasePrescriptions prescription)
        {
            return new PrescriptionResponse
            {
                Id = prescription.Id,
                DrugName = prescription.DrugName,
                DoseValue = prescription.DoseValue,
                DoseUnit = prescription.DoseUnit,
                Route = prescription.Route,
                CreatedAt = prescription.CreatedAt
            };
        }
    }

    // Request DTOs
    public class CreateCaseRequest
    {
        public string Gender { get; set; } = "";
        public DateTime Dob { get; set; }
    }

    public class UpdateCaseRequest
    {
        public DateTime? EpisodeEnd { get; set; }
    }

    public class AddDiagnosisRequest
    {
        public string? Icd9Code { get; set; }
        public string Diagnosis { get; set; } = "";
    }

    public class AddProcedureRequest
    {
        public string? Icd9Code { get; set; }
        public string ProcedureDescription { get; set; } = "";
    }

    public class AddPrescriptionRequest
    {
        public string DrugName { get; set; } = "";
        public string DoseValue { get; set; } = "";
        public string DoseUnit { get; set; } = "";
        public string Route { get; set; } = "";
    }

    // Response DTOs
    public class CaseDetailResponse
    {
        public Guid CaseId { get; set; }
        public string SubjectCode { get; set; } = "";
        public Guid? DoctorId { get; set; }
        public string? DoctorName { get; set; }
        public string Gender { get; set; } = "";
        public DateTime Dob { get; set; }
        public DateTime EpisodeStart { get; set; }
        public DateTime? EpisodeEnd { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<DiagnosisResponse> Diagnoses { get; set; } = new();
        public List<ProcedureResponse> Procedures { get; set; } = new();
        public List<PrescriptionResponse> Prescriptions { get; set; } = new();
    }

    public class DiagnosisResponse
    {
        public Guid Id { get; set; }
        public string? Icd9Code { get; set; }
        public string Diagnosis { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class ProcedureResponse
    {
        public Guid Id { get; set; }
        public string? Icd9Code { get; set; }
        public string ProcedureDescription { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class PrescriptionResponse
    {
        public Guid Id { get; set; }
        public string DrugName { get; set; } = "";
        public string DoseValue { get; set; } = "";
        public string DoseUnit { get; set; } = "";
        public string Route { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}
