namespace Api.Models
{
    public class AppCaseDiagnoses
    {
        public Guid Id { get; set; }  // uuid, PK
        public Guid CaseId { get; set; }  // uuid, FK to AppCase
        public string? Icd9Code { get; set; }  // character varying(10)
        public string Diagnosis { get; set; } = "";  // text
        public DateTime CreatedAt { get; set; }  // timestamp without time zone

        // Navigation property
        public AppCases? Case { get; set; }
    }
}
