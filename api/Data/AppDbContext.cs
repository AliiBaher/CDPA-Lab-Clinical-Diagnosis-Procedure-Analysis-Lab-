using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<DoctorProfiles> DoctorProfiles => Set<DoctorProfiles>();
    public DbSet<DoctorAvailability> DoctorAvailabilities => Set<DoctorAvailability>();
    public DbSet<DoctorAvailabilitySlot> DoctorAvailabilitySlots => Set<DoctorAvailabilitySlot>();
    public DbSet<Appointments> Appointments => Set<Appointments>();
    public DbSet<AppCases> AppCases => Set<AppCases>();
    public DbSet<AppCaseDiagnoses> AppCaseDiagnoses => Set<AppCaseDiagnoses>();
    public DbSet<AppCaseProcedures> AppCaseProcedures => Set<AppCaseProcedures>();
    public DbSet<AppCasePrescriptions> AppCasePrescriptions => Set<AppCasePrescriptions>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("app");

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable("app_users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.FirstName).HasColumnName("first_name");
            entity.Property(e => e.LastName).HasColumnName("last_name");
            entity.Property(e => e.Role).HasColumnName("role");
            entity.Property(e => e.Phone).HasColumnName("phone");
            entity.Property(e => e.Gender).HasColumnName("gender");
            entity.Property(e => e.Birthdate).HasColumnName("birthdate");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            
        });

        modelBuilder.Entity<DoctorProfiles>(entity =>
        {
            entity.ToTable("doctor_profiles");
            entity.HasKey(e => e.UserId);

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Specialty).HasColumnName("specialty");
            entity.Property(e => e.Hospital).HasColumnName("hospital");
            entity.Property(e => e.Bio).HasColumnName("bio");
            entity.Property(e => e.ClinicPhone).HasColumnName("clinic_phone");
            entity.Property(e => e.IsActive).HasColumnName("is_active");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DoctorAvailability>(entity =>
        {
            entity.ToTable("doctor_availability");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DoctorId).HasColumnName("doctor_id");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.StartTime).HasColumnName("start_time");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.SlotDurationMinutes).HasColumnName("slot_duration_minutes");
            entity.Property(e => e.IsBooked).HasColumnName("is_booked");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Appointments>(entity =>
        {
            entity.ToTable("appointments");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DoctorId).HasColumnName("doctor_id");
            entity.Property(e => e.PatientId).HasColumnName("patient_id");
            entity.Property(e => e.CaseId).HasColumnName("case_id");
            entity.Property(e => e.StartTime).HasColumnName("start_time");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<DoctorAvailabilitySlot>(entity =>
        {
            entity.ToTable("doctor_availability_slots");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AvailabilityId).HasColumnName("availability_id");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.StartTime).HasColumnName("start_time");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.IsBooked).HasColumnName("is_booked");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(e => e.Availability)
                .WithMany(a => a.Slots)
                .HasForeignKey(e => e.AvailabilityId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AppCases>(entity =>
        {
            entity.ToTable("app_cases");
            entity.HasKey(e => e.CaseId);

            entity.Property(e => e.CaseId).HasColumnName("case_id");
            entity.Property(e => e.SubjectCode).HasColumnName("subject_code");
            entity.Property(e => e.DoctorId).HasColumnName("doctor_id");
            entity.Property(e => e.EpisodeStart).HasColumnName("episode_start");
            entity.Property(e => e.EpisodeEnd).HasColumnName("episode_end");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AppCaseDiagnoses>(entity =>
        {
            entity.ToTable("app_case_diagnoses");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CaseId).HasColumnName("case_id");
            entity.Property(e => e.Icd9Code).HasColumnName("icd9_code");
            entity.Property(e => e.Diagnosis).HasColumnName("diagnosis");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AppCaseProcedures>(entity =>
        {
            entity.ToTable("app_case_procedures");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CaseId).HasColumnName("case_id");
            entity.Property(e => e.Icd9Code).HasColumnName("icd9_code");
            entity.Property(e => e.ProcedureDescription).HasColumnName("procedure_description");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AppCasePrescriptions>(entity =>
        {
            entity.ToTable("app_case_prescriptions");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CaseId).HasColumnName("case_id");
            entity.Property(e => e.DrugName).HasColumnName("drug_name");
            entity.Property(e => e.DoseValue).HasColumnName("dose_value");
            entity.Property(e => e.DoseUnit).HasColumnName("dose_unit");
            entity.Property(e => e.Route).HasColumnName("route");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(e => e.Case)
                .WithMany()
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        base.OnModelCreating(modelBuilder);
    }

}
