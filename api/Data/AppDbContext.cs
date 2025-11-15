using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<AppUser> AppUsers => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.HasDefaultSchema("app");

    modelBuilder.Entity<AppUser>(entity =>
    {
        entity.ToTable("app_users");

        entity.HasKey(e => e.Id);

        // 👇 add this line
        entity.Property(e => e.Id).HasColumnName("id");

        entity.Property(e => e.Email).HasColumnName("email");
        entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
        entity.Property(e => e.FullName).HasColumnName("full_name");
        entity.Property(e => e.Role).HasColumnName("role");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
    });

    base.OnModelCreating(modelBuilder);
}

}
