using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddForeignKeyToSlots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
            migrationBuilder.DropForeignKey(
                name: "FK_doctor_availability_slots_doctor_availability_availability_id",
                schema: "app",
                table: "doctor_availability_slots");
        }
    }
}
