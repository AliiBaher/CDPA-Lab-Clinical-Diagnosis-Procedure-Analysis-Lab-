namespace Api.Models
{
    public class AvailabilityRequest
    {
        public DateTime Date { get; set; }
        public string StartTime { get; set; } = "";
        public string EndTime { get; set; } = "";
        public int SlotDurationMinutes { get; set; } = 5;
    }

    public class AvailabilityResponse
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int SlotDurationMinutes { get; set; }
        public bool IsBooked { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AvailabilitySlot
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsAvailable { get; set; }
    }
}
