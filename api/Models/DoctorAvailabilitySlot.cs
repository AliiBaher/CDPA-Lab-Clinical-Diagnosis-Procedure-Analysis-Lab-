namespace Api.Models
{
    public class DoctorAvailabilitySlot
    {
        public Guid Id { get; set; }

        public Guid AvailabilityId { get; set; }  // Foreign key to DoctorAvailability

        public DateTime Date { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public bool IsBooked { get; set; } = false;

        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public DoctorAvailability? Availability { get; set; }
    }
}
