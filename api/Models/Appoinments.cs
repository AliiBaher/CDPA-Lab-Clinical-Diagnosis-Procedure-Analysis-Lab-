namespace Api.Models
{
    public class Appointments
    {
        public Guid Id { get; set; }  // uuid, PK

        public Guid DoctorId { get; set; }  // uuid, FK
        public Guid PatientId { get; set; }  // uuid, FK
        public Guid? CaseId { get; set; }  // uuid, FK to AppCase (optional)

        public DateTime StartTime { get; set; }  // timestamp with time zone
        public DateTime? EndTime { get; set; }   // nullable, timestamp with time zone

        public string Status { get; set; } = "";  // varchar(20)

        public DateTime CreatedAt { get; set; }  // timestamp with time zone

        public string? Notes { get; set; }  // optional notes from patient

        // Navigation properties
        public AppUser? Doctor { get; set; }
        public AppUser? Patient { get; set; }
        public AppCases? Case { get; set; }
    }
}
