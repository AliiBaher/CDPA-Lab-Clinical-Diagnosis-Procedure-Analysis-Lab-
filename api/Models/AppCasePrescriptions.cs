namespace Api.Models
{
    public class AppCasePrescriptions
    {
        public Guid Id { get; set; }  // uuid, PK

        public Guid CaseId { get; set; }  // uuid, FK to AppCase

        public string DrugName { get; set; } = "";  // drug_name column
        public string DoseValue { get; set; } = "";  // dose_value column
        public string DoseUnit { get; set; } = "";  // dose_unit column
        public string Route { get; set; } = "";  // route column

        public DateTime CreatedAt { get; set; }  // timestamp

        // Navigation property
        public AppCases? Case { get; set; }
    }
}
