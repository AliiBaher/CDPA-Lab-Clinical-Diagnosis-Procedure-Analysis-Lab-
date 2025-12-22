namespace api.Dtos.Ai;

public class AiAssistRequest
{
    public string Query { get; set; } = "";
    public int TopK { get; set; } = 10;
    public string? Gender { get; set; }   // "M" / "F"
    public int? Age { get; set; }         // e.g. 64
}
