namespace Api.Models;

public class AiAdviceRequest
{
    public string Query { get; set; } = "";      // doctor's free-text question / symptoms
    public int TopK { get; set; } = 10;          // how many similar episodes to use
    public Guid? CaseId { get; set; }            // optional: link to an AppCase
    public string? Gender { get; set; }          // "M" / "F"
    public int? Age { get; set; }                // e.g. 64
}

public class AiAdviceResponse
{
    public string CohortSummary { get; set; } = "";   // your summaryText from /ai/assist
    public string AdviceText { get; set; } = "";      // LLM-generated narrative
}
