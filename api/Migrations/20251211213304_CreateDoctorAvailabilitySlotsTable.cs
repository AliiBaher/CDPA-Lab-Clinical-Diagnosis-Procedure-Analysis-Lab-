using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class CreateDoctorAvailabilitySlotsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create the doctor_availability_slots table in app schema
            migrationBuilder.CreateTable(
                name: "doctor_availability_slots",
                schema: "app",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    availability_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    is_booked = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_doctor_availability_slots", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_doctor_availability_slots_availability_id",
                schema: "app",
                table: "doctor_availability_slots",
                column: "availability_id");
            
            // Add foreign key to doctor_availability table
            migrationBuilder.AddForeignKey(
                name: "FK_doctor_availability_slots_doctor_availability_availability_id",
                schema: "app",
                table: "doctor_availability_slots",
                column: "availability_id",
                principalSchema: "app",
                principalTable: "doctor_availability",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "doctor_availability_slots",
                schema: "app");
        }
    }
}
