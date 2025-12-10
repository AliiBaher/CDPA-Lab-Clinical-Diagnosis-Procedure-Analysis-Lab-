using Api.Data;
using Api.Models;
using Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Seeds
{
    public static class AdminSeeder
    {
        public static async Task SeedAdminAsync(AppDbContext context, PasswordService passwordService)
        {
            // Check if admin already exists
            if (await context.AppUsers.AnyAsync(u => u.Email == "admin@example.com"))
                return;

            var adminUser = new AppUser
            {
                Id = Guid.NewGuid(),
                Email = "admin@example.com",
                FirstName = "Admin",
                LastName = "User",
                Phone = "+1234567890",
                Role = "admin",
                PasswordHash = passwordService.HashPassword("Admin@123456"), // Change this password!
                CreatedAt = DateTime.UtcNow
            };

            context.AppUsers.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}
