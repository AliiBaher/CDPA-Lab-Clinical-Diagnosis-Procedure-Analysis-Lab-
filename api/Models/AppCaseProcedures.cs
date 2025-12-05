namespace Api.Models
{
    public class AppCaseProcedures
    {
        public Guid Id { get; set; }  // uuid, PK

        public Guid CaseId { get; set; }  // uuid, FK to AppCase

        public string? Icd9Code { get; set; }  // varchar(10)
        public string ProcedureDescription { get; set; } = "";  // text

        public DateTime CreatedAt { get; set; }  // timestamp

        // Navigation property
        public AppCases? Case { get; set; }
    }
}
