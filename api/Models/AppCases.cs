namespace Api.Models
{
    public class AppCases
    {
        public Guid CaseId { get; set; }  // uuid, PK

        public string SubjectCode { get; set; } = "";  // patient identifier
        public Guid? DoctorId { get; set; }  // uuid, assigned doctor (nullable)

        public DateTime EpisodeStart { get; set; }  // timestamp
        public DateTime? EpisodeEnd { get; set; }   // nullable timestamp

        public DateTime CreatedAt { get; set; }  // timestamp

        // Navigation properties
        public AppUser? Doctor { get; set; }
    }
}
