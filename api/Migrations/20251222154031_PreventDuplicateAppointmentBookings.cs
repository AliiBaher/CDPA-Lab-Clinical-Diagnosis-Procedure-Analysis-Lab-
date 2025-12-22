using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class PreventDuplicateAppointmentBookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add unique index to prevent same patient from booking the same slot twice
            migrationBuilder.CreateIndex(
                name: "ix_appointments_patient_start_time_doctor",
                schema: "app",
                table: "appointments",
                columns: new[] { "patient_id", "start_time", "doctor_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_appointments_patient_start_time_doctor",
                schema: "app",
                table: "appointments");
        }
    }
}
