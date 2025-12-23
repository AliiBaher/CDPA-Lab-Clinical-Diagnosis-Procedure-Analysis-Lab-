using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorRatingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DoctorRatings_app_users_DoctorId",
                schema: "app",
                table: "DoctorRatings");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorRatings_app_users_PatientId",
                schema: "app",
                table: "DoctorRatings");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorRatings_appointments_AppointmentId",
                schema: "app",
                table: "DoctorRatings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DoctorRatings",
                schema: "app",
                table: "DoctorRatings");

            migrationBuilder.DropIndex(
                name: "IX_DoctorRatings_AppointmentId",
                schema: "app",
                table: "DoctorRatings");

            migrationBuilder.RenameTable(
                name: "DoctorRatings",
                schema: "app",
                newName: "doctor_ratings",
                newSchema: "app");

            migrationBuilder.RenameColumn(
                name: "Rating",
                schema: "app",
                table: "doctor_ratings",
                newName: "rating");

            migrationBuilder.RenameColumn(
                name: "Comment",
                schema: "app",
                table: "doctor_ratings",
                newName: "comment");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "app",
                table: "doctor_ratings",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "PatientId",
                schema: "app",
                table: "doctor_ratings",
                newName: "patient_id");

            migrationBuilder.RenameColumn(
                name: "IsPublic",
                schema: "app",
                table: "doctor_ratings",
                newName: "is_public");

            migrationBuilder.RenameColumn(
                name: "DoctorId",
                schema: "app",
                table: "doctor_ratings",
                newName: "doctor_id");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                schema: "app",
                table: "doctor_ratings",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "AppointmentId",
                schema: "app",
                table: "doctor_ratings",
                newName: "appointment_id");

            migrationBuilder.RenameIndex(
                name: "IX_DoctorRatings_PatientId",
                schema: "app",
                table: "doctor_ratings",
                newName: "IX_doctor_ratings_patient_id");

            migrationBuilder.RenameIndex(
                name: "IX_DoctorRatings_DoctorId",
                schema: "app",
                table: "doctor_ratings",
                newName: "IX_doctor_ratings_doctor_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_doctor_ratings",
                schema: "app",
                table: "doctor_ratings",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "IX_doctor_ratings_appointment_id",
                schema: "app",
                table: "doctor_ratings",
                column: "appointment_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_doctor_ratings_app_users_doctor_id",
                schema: "app",
                table: "doctor_ratings",
                column: "doctor_id",
                principalSchema: "app",
                principalTable: "app_users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_doctor_ratings_app_users_patient_id",
                schema: "app",
                table: "doctor_ratings",
                column: "patient_id",
                principalSchema: "app",
                principalTable: "app_users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_doctor_ratings_appointments_appointment_id",
                schema: "app",
                table: "doctor_ratings",
                column: "appointment_id",
                principalSchema: "app",
                principalTable: "appointments",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_doctor_ratings_app_users_doctor_id",
                schema: "app",
                table: "doctor_ratings");

            migrationBuilder.DropForeignKey(
                name: "FK_doctor_ratings_app_users_patient_id",
                schema: "app",
                table: "doctor_ratings");

            migrationBuilder.DropForeignKey(
                name: "FK_doctor_ratings_appointments_appointment_id",
                schema: "app",
                table: "doctor_ratings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_doctor_ratings",
                schema: "app",
                table: "doctor_ratings");

            migrationBuilder.DropIndex(
                name: "IX_doctor_ratings_appointment_id",
                schema: "app",
                table: "doctor_ratings");

            migrationBuilder.RenameTable(
                name: "doctor_ratings",
                schema: "app",
                newName: "DoctorRatings",
                newSchema: "app");

            migrationBuilder.RenameColumn(
                name: "rating",
                schema: "app",
                table: "DoctorRatings",
                newName: "Rating");

            migrationBuilder.RenameColumn(
                name: "comment",
                schema: "app",
                table: "DoctorRatings",
                newName: "Comment");

            migrationBuilder.RenameColumn(
                name: "id",
                schema: "app",
                table: "DoctorRatings",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "patient_id",
                schema: "app",
                table: "DoctorRatings",
                newName: "PatientId");

            migrationBuilder.RenameColumn(
                name: "is_public",
                schema: "app",
                table: "DoctorRatings",
                newName: "IsPublic");

            migrationBuilder.RenameColumn(
                name: "doctor_id",
                schema: "app",
                table: "DoctorRatings",
                newName: "DoctorId");

            migrationBuilder.RenameColumn(
                name: "created_at",
                schema: "app",
                table: "DoctorRatings",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "appointment_id",
                schema: "app",
                table: "DoctorRatings",
                newName: "AppointmentId");

            migrationBuilder.RenameIndex(
                name: "IX_doctor_ratings_patient_id",
                schema: "app",
                table: "DoctorRatings",
                newName: "IX_DoctorRatings_PatientId");

            migrationBuilder.RenameIndex(
                name: "IX_doctor_ratings_doctor_id",
                schema: "app",
                table: "DoctorRatings",
                newName: "IX_DoctorRatings_DoctorId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DoctorRatings",
                schema: "app",
                table: "DoctorRatings",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorRatings_AppointmentId",
                schema: "app",
                table: "DoctorRatings",
                column: "AppointmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorRatings_app_users_DoctorId",
                schema: "app",
                table: "DoctorRatings",
                column: "DoctorId",
                principalSchema: "app",
                principalTable: "app_users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorRatings_app_users_PatientId",
                schema: "app",
                table: "DoctorRatings",
                column: "PatientId",
                principalSchema: "app",
                principalTable: "app_users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorRatings_appointments_AppointmentId",
                schema: "app",
                table: "DoctorRatings",
                column: "AppointmentId",
                principalSchema: "app",
                principalTable: "appointments",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
