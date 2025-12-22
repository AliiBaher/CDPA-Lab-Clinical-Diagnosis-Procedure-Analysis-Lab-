using api.Dtos.Ai;
using api.Services;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace api.Controllers;

[ApiController]
[Route("ai")]
[Authorize(Roles = "doctor")] // IMPORTANT: doctors only
public class AiController : ControllerBase
{
    private readonly IMimicService _mimic;
    private readonly IAdviceService _advice;
    private readonly ILogger<AiController> _logger;

    public AiController(IMimicService mimic, IAdviceService advice, ILogger<AiController> logger)
    {
        _mimic = mimic;
        _advice = advice;
        _logger = logger;
    }

    [HttpPost("assist")]
    public async Task<IActionResult> Assist([FromBody] AiAssistRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
            return BadRequest("Query cannot be empty.");

        var k = request.TopK <= 0 ? 10 : request.TopK;

        _logger.LogInformation("AI assist query received: {Query}", request.Query);

        // 1️⃣ Retrieve similar episodes
        var episodes = await _mimic.SearchEpisodesAsync(request.Query, k, request.Gender, request.Age);

        if (episodes.Count == 0)
        {
            return Ok(new
            {
                retrievedCount = 0,
                episodes = new List<MimicEpisodeDto>(),
                topDiagnoses = new List<DiagnosisFrequencyDto>(),
                topProcedures = new List<ProcedureFrequencyDto>(),
                topDrugs = new List<DrugFrequencyDto>(),
                exampleEpisode = (EpisodeDetailDto?)null,
                summaryText = "No similar cases were found in the MIMIC-III cohort."
            });
        }

        var hadmIds = episodes.Select(e => e.HadmId).ToArray();

        // 2️⃣ Cohort aggregations
        var diagnoses = await _mimic.GetDiagnosisFrequencyAsync(hadmIds);
        var procedures = await _mimic.GetProcedureFrequencyAsync(hadmIds);
        var drugs = await _mimic.GetDrugFrequencyAsync(hadmIds);

        // 3️⃣ Optional single-episode detail (for citation)
        var exampleEpisode = await _mimic.GetEpisodeDetailAsync(hadmIds[0]);

        // 4️⃣ Build response
        var response = new AiAssistResponse
        {
            RetrievedCount = episodes.Count,
            Episodes = episodes,
            TopDiagnoses = diagnoses,
            TopProcedures = procedures,
            TopDrugs = drugs,
            ExampleEpisode = exampleEpisode
        };

        // 5️⃣ Build human-readable summary
        var summaryText = BuildMimicEvidenceSummary(response);

        return Ok(new
        {
            retrievedCount = response.RetrievedCount,
            episodes = response.Episodes,
            topDiagnoses = response.TopDiagnoses,
            topProcedures = response.TopProcedures,
            topDrugs = response.TopDrugs,
            exampleEpisode = response.ExampleEpisode,
            summaryText = summaryText
        });
    }

    private string BuildMimicEvidenceSummary(AiAssistResponse mimic)
    {
        if (mimic.RetrievedCount == 0) 
            return "No similar cases were found in the MIMIC-III cohort.";

        var sb = new StringBuilder();

        sb.AppendLine($"Based on {mimic.RetrievedCount} similar admissions from the MIMIC-III cohort:");
        sb.AppendLine();
        sb.AppendLine("Most frequent diagnoses:");
        foreach (var d in mimic.TopDiagnoses.Take(8))
        {
            sb.AppendLine($"- {d.Description ?? d.Icd9Code} (ICD-9 {d.Icd9Code}) – seen in {d.Count} of the retrieved cases");
        }

        sb.AppendLine();
        sb.AppendLine("Common procedures:");
        foreach (var p in mimic.TopProcedures.Take(5))
        {
            sb.AppendLine($"- {p.Description ?? p.Icd9Code} (ICD-9 {p.Icd9Code}) – {p.Count} occurrences");
        }

        sb.AppendLine();
        sb.AppendLine("Frequently used medications:");
        foreach (var drug in mimic.TopDrugs.Take(10))
        {
            sb.AppendLine($"- {drug.Drug} – {drug.Count} administrations across the cohort");
        }

        if (mimic.ExampleEpisode != null)
        {
            sb.AppendLine();
            sb.AppendLine("Representative case example:");
            sb.AppendLine(
                $"- Admission {mimic.ExampleEpisode.HadmId}: " +
                $"{mimic.ExampleEpisode.Diagnosis ?? "Unknown diagnosis"}, " +
                $"gender {mimic.ExampleEpisode.Gender}, " +
                $"admission type {mimic.ExampleEpisode.AdmissionType}.");
        }

        return sb.ToString();
    }

    [HttpPost("advice")]
    public async Task<ActionResult<AiAdviceResponse>> GetAdvice([FromBody] AiAdviceRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
            return BadRequest("Query is required.");

        var topK = request.TopK <= 0 ? 10 : request.TopK;

        _logger.LogInformation("AI advice query received: {Query}", request.Query);

        // 1) Run the same retrieval + cohort aggregation as /ai/assist
        var episodes = await _mimic.SearchEpisodesAsync(request.Query, topK, request.Gender, request.Age);

        if (episodes.Count == 0)
        {
            return Ok(new AiAdviceResponse
            {
                CohortSummary = "No similar cases were found in the MIMIC-III cohort.",
                AdviceText = "Unable to generate advice without similar cases from the database."
            });
        }

        var hadmIds = episodes.Select(e => e.HadmId).Distinct().ToArray();

        var diagnoses  = await _mimic.GetDiagnosisFrequencyAsync(hadmIds);
        var procedures = await _mimic.GetProcedureFrequencyAsync(hadmIds);
        var drugs      = await _mimic.GetDrugFrequencyAsync(hadmIds);
        var example    = hadmIds.Length > 0
            ? await _mimic.GetEpisodeDetailAsync(hadmIds[0])
            : null;

        var assistPayload = new AiAssistResponse
        {
            RetrievedCount = episodes.Count,
            Episodes       = episodes,
            TopDiagnoses   = diagnoses,
            TopProcedures  = procedures,
            TopDrugs       = drugs,
            ExampleEpisode = example
        };

        // Reuse existing summary builder
        var cohortSummary = BuildMimicEvidenceSummary(assistPayload);

        // 2) Ask the LLM to generate a narrative based on cohortSummary
        var adviceText = await _advice.GenerateAdviceAsync(request.Query, cohortSummary);

        return Ok(new AiAdviceResponse
        {
            CohortSummary = cohortSummary,
            AdviceText    = adviceText
        });
    }
}
