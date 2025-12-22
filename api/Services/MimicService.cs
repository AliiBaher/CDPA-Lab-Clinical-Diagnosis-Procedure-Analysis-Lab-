using Npgsql;

namespace api.Services;

// DTOs for clean, typed responses
public class MimicEpisodeDto
{
    public int HadmId { get; set; }
    public string DocText { get; set; } = "";
}

public class DiagnosisFrequencyDto
{
    public string Icd9Code { get; set; } = "";
    public string? Description { get; set; }
    public int Count { get; set; }
}

public class ProcedureFrequencyDto
{
    public string Icd9Code { get; set; } = "";
    public string? Description { get; set; }
    public int Count { get; set; }
}

public class DrugFrequencyDto
{
    public string Drug { get; set; } = "";
    public int Count { get; set; }
}

public class EpisodeDetailDto
{
    public int HadmId { get; set; }
    public int SubjectId { get; set; }
    public DateTime AdmitTime { get; set; }
    public DateTime? DischTime { get; set; }
    public string? AdmissionType { get; set; }
    public string? Diagnosis { get; set; }
    public string? Gender { get; set; }
}

public interface IMimicService
{
    // PRIMARY: Document retrieval from v_episode_document
    Task<List<MimicEpisodeDto>> SearchEpisodesAsync(string query, int k = 10, string? gender = null, int? age = null);
    
    // SECONDARY: Cohort aggregations (for retrieved hadm_ids)
    Task<List<DiagnosisFrequencyDto>> GetDiagnosisFrequencyAsync(int[] hadmIds);
    Task<List<ProcedureFrequencyDto>> GetProcedureFrequencyAsync(int[] hadmIds);
    Task<List<DrugFrequencyDto>> GetDrugFrequencyAsync(int[] hadmIds);
    
    // OPTIONAL: ICD-based refinement
    Task<List<MimicEpisodeDto>> RefineByIcdCodesAsync(string[] icdCodes, int k = 10);
    
    // LAST: Individual case details (for citations)
    Task<EpisodeDetailDto?> GetEpisodeDetailAsync(int hadmId);
}

public class MimicService : IMimicService
{
    private readonly string _mimicConnectionString;
    private readonly ILogger<MimicService> _logger;

    public MimicService(IConfiguration configuration, ILogger<MimicService> logger)
    {
        _mimicConnectionString = configuration.GetConnectionString("MimicDatabase") 
            ?? throw new InvalidOperationException("MimicDatabase connection string not found");
        _logger = logger;
    }

    // PRIMARY: Search episodes using the v_episode_document view
    public async Task<List<MimicEpisodeDto>> SearchEpisodesAsync(string query, int k = 10, string? gender = null, int? age = null)
    {
        // 1) Split query into terms
        var terms = query
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(t => t.Length > 2)   // skip very short words like "of"
            .ToArray();

        if (terms.Length == 0)
            return new List<MimicEpisodeDto>();

        // 2) Build LIKE patterns for ANY()
        var patterns = terms
            .Select(t => "%" + t.ToLowerInvariant() + "%")
            .ToArray();

        // 3) Build SQL with optional gender/age filters
        var sql = @"
            SELECT v.hadm_id, v.doc_text
            FROM (
                SELECT v.hadm_id, v.doc_text, p.gender, 
                       EXTRACT(YEAR FROM AGE(a.admittime, p.dob))::int AS age
                FROM mimic.v_episode_document v
                INNER JOIN mimic.admissions a ON v.hadm_id = a.hadm_id
                INNER JOIN mimic.patients p ON a.subject_id = p.subject_id
                WHERE (@gender IS NULL OR p.gender = @gender)
                  AND (@age IS NULL OR EXTRACT(YEAR FROM AGE(a.admittime, p.dob)) BETWEEN @age - 5 AND @age + 5)
                LIMIT 5000
            ) v
            WHERE lower(v.doc_text) LIKE ANY (@patterns)
            LIMIT @k;";

        var episodes = new List<MimicEpisodeDto>();

        await using var connection = new NpgsqlConnection(_mimicConnectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(sql, connection);
        command.CommandTimeout = 60;
        command.Parameters.Add(new NpgsqlParameter("patterns", NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Text) { Value = patterns });
        command.Parameters.AddWithValue("k", k);
        command.Parameters.AddWithValue("gender", (object?)gender ?? DBNull.Value);
        command.Parameters.AddWithValue("age", (object?)age ?? DBNull.Value);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            episodes.Add(new MimicEpisodeDto
            {
                HadmId = reader.GetInt32(0),
                DocText = reader.GetString(1)
            });
        }

        return episodes;
    }

    // Cohort aggregation: Diagnosis frequency across retrieved episodes
    public async Task<List<DiagnosisFrequencyDto>> GetDiagnosisFrequencyAsync(int[] hadmIds)
    {
        if (hadmIds.Length == 0) return new List<DiagnosisFrequencyDto>();

        var sql = @"
            SELECT d.icd9_code,
                   COALESCE(di.long_title, di.short_title, '') AS description,
                   COUNT(*) AS count
            FROM mimic.diagnoses_icd d
            LEFT JOIN mimic.d_icd_diagnoses di
                   ON d.icd9_code = di.icd9_code
            WHERE d.hadm_id = ANY(@hadmIds)
            GROUP BY d.icd9_code, di.long_title, di.short_title
            ORDER BY count DESC;
        ";

        var result = new List<DiagnosisFrequencyDto>();

        await using var connection = new NpgsqlConnection(_mimicConnectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(sql, connection);
        command.CommandTimeout = 60;
        command.Parameters.Add(new NpgsqlParameter("hadmIds", NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Integer) { Value = hadmIds });

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            result.Add(new DiagnosisFrequencyDto
            {
                Icd9Code    = reader.GetString(0),
                Description = reader.IsDBNull(1) ? null : reader.GetString(1),
                Count       = reader.GetInt32(2)
            });
        }

        return result;
    }

    // Cohort aggregation: Procedure frequency across retrieved episodes
    public async Task<List<ProcedureFrequencyDto>> GetProcedureFrequencyAsync(int[] hadmIds)
    {
        if (hadmIds.Length == 0) return new List<ProcedureFrequencyDto>();

        var sql = @"
            SELECT p.icd9_code,
                   COALESCE(pi.long_title, pi.short_title, '') AS description,
                   COUNT(*) AS count
            FROM mimic.procedures_icd p
            LEFT JOIN mimic.d_icd_procedures pi
                   ON p.icd9_code = pi.icd9_code
            WHERE p.hadm_id = ANY(@hadmIds)
            GROUP BY p.icd9_code, pi.long_title, pi.short_title
            ORDER BY count DESC;
        ";

        var result = new List<ProcedureFrequencyDto>();

        await using var connection = new NpgsqlConnection(_mimicConnectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(sql, connection);
        command.CommandTimeout = 60;
        command.Parameters.Add(new NpgsqlParameter("hadmIds", NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Integer) { Value = hadmIds });

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            result.Add(new ProcedureFrequencyDto
            {
                Icd9Code    = reader.GetString(0),
                Description = reader.IsDBNull(1) ? null : reader.GetString(1),
                Count       = reader.GetInt32(2)
            });
        }

        return result;
    }

    // Cohort aggregation: Drug frequency across retrieved episodes
    public async Task<List<DrugFrequencyDto>> GetDrugFrequencyAsync(int[] hadmIds)
    {
        if (hadmIds.Length == 0) return new List<DrugFrequencyDto>();

        var sql = @"
            SELECT drug, COUNT(*) as count
            FROM mimic.prescriptions
            WHERE hadm_id = ANY(@hadmIds)
            GROUP BY drug
            ORDER BY count DESC
            LIMIT 50";

        var frequencies = new List<DrugFrequencyDto>();

        await using var connection = new NpgsqlConnection(_mimicConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        command.CommandTimeout = 60;
        command.Parameters.AddWithValue("hadmIds", hadmIds);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            frequencies.Add(new DrugFrequencyDto
            {
                Drug = reader.GetString(0),
                Count = reader.GetInt32(1)
            });
        }

        return frequencies;
    }

    // OPTIONAL: Refine search by ICD codes (use after LLM extracts codes)
    public async Task<List<MimicEpisodeDto>> RefineByIcdCodesAsync(string[] icdCodes, int k = 10)
    {
        var sql = @"
            SELECT DISTINCT v.hadm_id, v.doc_text
            FROM mimic.v_episode_document v
            INNER JOIN mimic.diagnoses_icd d ON v.hadm_id = d.hadm_id
            WHERE d.icd9_code = ANY(@icdCodes)
            LIMIT @k";

        var episodes = new List<MimicEpisodeDto>();

        await using var connection = new NpgsqlConnection(_mimicConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        command.CommandTimeout = 60;
        command.Parameters.AddWithValue("icdCodes", icdCodes);
        command.Parameters.AddWithValue("k", k);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            episodes.Add(new MimicEpisodeDto
            {
                HadmId = reader.GetInt32(0),
                DocText = reader.GetString(1)
            });
        }

        return episodes;
    }

    // LAST: Get individual episode details (for citations/context)
    public async Task<EpisodeDetailDto?> GetEpisodeDetailAsync(int hadmId)
    {
        var sql = @"
            SELECT a.hadm_id, a.subject_id, a.admittime, a.dischtime,
                   a.admission_type, a.diagnosis, p.gender
            FROM mimic.admissions a
            INNER JOIN mimic.patients p ON a.subject_id = p.subject_id
            WHERE a.hadm_id = @hadmId";

        await using var connection = new NpgsqlConnection(_mimicConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        command.CommandTimeout = 60;
        command.Parameters.AddWithValue("hadmId", hadmId);

        await using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new EpisodeDetailDto
            {
                HadmId = reader.GetInt32(0),
                SubjectId = reader.GetInt32(1),
                AdmitTime = reader.GetDateTime(2),
                DischTime = reader.IsDBNull(3) ? null : reader.GetDateTime(3),
                AdmissionType = reader.IsDBNull(4) ? null : reader.GetString(4),
                Diagnosis = reader.IsDBNull(5) ? null : reader.GetString(5),
                Gender = reader.IsDBNull(6) ? null : reader.GetString(6)
            };
        }

        return null;
    }
}
