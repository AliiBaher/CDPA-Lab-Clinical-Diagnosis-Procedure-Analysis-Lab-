using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<DoctorProfiles> DoctorProfiles => Set<DoctorProfiles>();
    public DbSet<DoctorRatings> DoctorRatings => Set<DoctorRatings>();
    public DbSet<DoctorAvailability> DoctorAvailabilities => Set<DoctorAvailability>();
    public DbSet<DoctorAvailabilitySlot> DoctorAvailabilitySlots => Set<DoctorAvailabilitySlot>();
    public DbSet<Appointments> Appointments => Set<Appointments>();

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
            entity.Property(e => e.StartTime).HasColumnName("start_time");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.Notes).HasColumnName("notes");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
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

        modelBuilder.Entity<DoctorRatings>(entity =>
        {
            entity.ToTable("doctor_ratings");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DoctorId).HasColumnName("doctor_id");
            entity.Property(e => e.PatientId).HasColumnName("patient_id");
            entity.Property(e => e.AppointmentId).HasColumnName("appointment_id");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.IsPublic).HasColumnName("is_public");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Appointment)
                .WithMany()
                .HasForeignKey(e => e.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: one rating per appointment
            entity.HasIndex(e => e.AppointmentId).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }

}
