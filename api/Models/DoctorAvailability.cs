namespace Api.Models
{
    public class DoctorAvailability
    {
        public Guid Id { get; set; }  // uuid, PK
        
        public Guid DoctorId { get; set; }  // uuid, FK
        
        public DateTime Date { get; set; }  // Date when doctor is available
        
        public TimeSpan StartTime { get; set; }  // Start hour (e.g., 09:00)
        
        public TimeSpan EndTime { get; set; }  // End hour (e.g., 17:00)
        
        public int SlotDurationMinutes { get; set; } = 5;  // Duration of each appointment slot (default 5 minutes)
        
        public bool IsBooked { get; set; } = false;  // Mark if all slots are booked
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public AppUser? Doctor { get; set; }
        public ICollection<DoctorAvailabilitySlot> Slots { get; set; } = new List<DoctorAvailabilitySlot>();
    }
}
