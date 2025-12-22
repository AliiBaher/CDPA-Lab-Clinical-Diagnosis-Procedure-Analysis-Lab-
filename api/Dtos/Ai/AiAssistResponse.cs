using api.Services;

namespace api.Dtos.Ai;

public class AiAssistResponse
{
    public int RetrievedCount { get; set; }

    public List<MimicEpisodeDto> Episodes { get; set; } = new();

    public List<DiagnosisFrequencyDto> TopDiagnoses { get; set; } = new();
    public List<ProcedureFrequencyDto> TopProcedures { get; set; } = new();
    public List<DrugFrequencyDto> TopDrugs { get; set; } = new();

    // Optional: one episode for citation
    public EpisodeDetailDto? ExampleEpisode { get; set; }
}
