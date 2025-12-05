namespace Api.Models
{
    public class AppUsers
    {
        public Guid Id { get; set; }  // uuid
        public string Email { get; set; } = "";  // character varying(255)
        public string FirstName { get; set; } = ""; // character varying(100)
        public string LastName { get; set; } = "";  // character varying(100)
        public string Role { get; set; } = "";  // character varying(20)
        public string? Phone { get; set; }  // character varying(20)
        public string PasswordHash { get; set; } = ""; // text
        public DateTime CreatedAt { get; set; } // timestamp without time zone
    }
}
