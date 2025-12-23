using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorRatings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "dob",
                schema: "app",
                table: "app_cases");

            migrationBuilder.DropColumn(
                name: "gender",
                schema: "app",
                table: "app_cases");

            migrationBuilder.AddColumn<string>(
                name: "notes",
                schema: "app",
                table: "appointments",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DoctorRatings",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorRatings_app_users_DoctorId",
                        column: x => x.DoctorId,
                        principalSchema: "app",
                        principalTable: "app_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DoctorRatings_app_users_PatientId",
                        column: x => x.PatientId,
                        principalSchema: "app",
                        principalTable: "app_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DoctorRatings_appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalSchema: "app",
                        principalTable: "appointments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DoctorRatings_AppointmentId",
                schema: "app",
                table: "DoctorRatings",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorRatings_DoctorId",
                schema: "app",
                table: "DoctorRatings",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorRatings_PatientId",
                schema: "app",
                table: "DoctorRatings",
                column: "PatientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DoctorRatings",
                schema: "app");

            migrationBuilder.DropColumn(
                name: "notes",
                schema: "app",
                table: "appointments");

            migrationBuilder.AddColumn<DateTime>(
                name: "dob",
                schema: "app",
                table: "app_cases",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "gender",
                schema: "app",
                table: "app_cases",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
