namespace Api.Models
{
    public class DoctorProfiles
    {
        public Guid UserId { get; set; }  // Foreign key to AppUser, PK

        public string Specialty { get; set; } = "";  // character varying(100)
        public string? Hospital { get; set; }  // character varying(200)
        public string? Bio { get; set; }  // text
        public string? ClinicPhone { get; set; }  // character varying(20)
        public bool IsActive { get; set; }  // boolean

        // Navigation property
        public AppUser? User { get; set; }
    }
}
