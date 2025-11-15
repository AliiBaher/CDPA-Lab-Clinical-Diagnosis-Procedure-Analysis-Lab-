namespace Api.Models;

public class AppUser
{
    public Guid Id { get; set; }          // UUID in DB
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string? FullName { get; set; }
    public string Role { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
