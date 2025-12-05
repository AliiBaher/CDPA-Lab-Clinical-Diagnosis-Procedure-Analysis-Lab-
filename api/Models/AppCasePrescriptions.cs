namespace Api.Models
{
    public class AppCasePrescriptions
    {
        public Guid Id { get; set; }  // uuid, PK

        public Guid CaseId { get; set; }  // uuid, FK to AppCase

        public string DrugName { get; set; } = "";  // text
        public string DoseValue { get; set; } = "";  // text
        public string DoseUnit { get; set; } = "";  // text
        public string Route { get; set; } = "";  // text

        public DateTime CreatedAt { get; set; }  // timestamp

        // Navigation property
        public AppCases? Case { get; set; }
    }
}
