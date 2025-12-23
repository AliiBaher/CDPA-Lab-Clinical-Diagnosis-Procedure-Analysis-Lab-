namespace Api.Models
{
    public class PasswordResetTokens
    {
        public Guid Id { get; set; }  // uuid, PK

        public Guid UserId { get; set; }  // uuid, FK to AppUser

        public string Token { get; set; } = "";  // varchar(255)
        public DateTime ExpiresAt { get; set; }  // timestamp with time zone
        public DateTime CreatedAt { get; set; }  // timestamp with time zone

        // Navigation property
        public AppUser? User { get; set; }
    }
}
