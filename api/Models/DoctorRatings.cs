namespace Api.Models
{
    public class DoctorRatings
    {
        public Guid Id { get; set; }  // uuid, PK

        public Guid DoctorId { get; set; }  // uuid, FK to AppUser (doctor)
        public Guid PatientId { get; set; }  // uuid, FK to AppUser (patient)
        public Guid AppointmentId { get; set; }  // uuid, FK to Appointment (one rating per appointment)

        public int Rating { get; set; }  // 1–5 stars
        public string? Comment { get; set; }  // text review

        public DateTime CreatedAt { get; set; }  // timestamp
        public bool IsPublic { get; set; }  // boolean

        // Navigation properties
        public AppUser? Doctor { get; set; }
        public AppUser? Patient { get; set; }
        public Appointments? Appointment { get; set; }
    }
}
