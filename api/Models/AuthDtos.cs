namespace Api.Models
{
    public class RegisterRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public DateTime? Birthdate { get; set; }
        public string? Role { get; set; } // optional — default "patient" in logic
        public string? Specialty { get; set; } // optional — for doctors only
    }

    public class LoginRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class AuthResponse
    {
        public string Token { get; set; } = "";
        public string Email { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Role { get; set; } = "";
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public DateTime? Birthdate { get; set; }
        public string? Specialty { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public string? Specialty { get; set; } // for doctors
    }

    public class UpdateProfileResponse
    {
        public string Email { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Role { get; set; } = "";
        public string? Phone { get; set; }
        public string? Specialty { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = "";
    }

    public class ForgotPasswordResponse
    {
        public string Message { get; set; } = "";
        public string? ResetLink { get; set; }  // Only in development mode
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }

    public class ResetPasswordResponse
    {
        public string Message { get; set; } = "";
    }
}
