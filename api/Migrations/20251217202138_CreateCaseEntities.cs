using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class CreateCaseEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "app_cases",
                schema: "app",
                columns: table => new
                {
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_code = table.Column<string>(type: "character varying(255)", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    gender = table.Column<string>(type: "character varying(10)", nullable: false),
                    dob = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    episode_start = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    episode_end = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_app_cases", x => x.case_id);
                    table.ForeignKey(
                        name: "fk_app_cases_app_users_doctor_id",
                        column: x => x.doctor_id,
                        principalSchema: "app",
                        principalTable: "app_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "app_case_diagnoses",
                schema: "app",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    icd9_code = table.Column<string>(type: "character varying(10)", nullable: true),
                    diagnosis = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_app_case_diagnoses", x => x.id);
                    table.ForeignKey(
                        name: "fk_app_case_diagnoses_app_cases_case_id",
                        column: x => x.case_id,
                        principalSchema: "app",
                        principalTable: "app_cases",
                        principalColumn: "case_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "app_case_procedures",
                schema: "app",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    icd9_code = table.Column<string>(type: "character varying(10)", nullable: true),
                    procedure = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_app_case_procedures", x => x.id);
                    table.ForeignKey(
                        name: "fk_app_case_procedures_app_cases_case_id",
                        column: x => x.case_id,
                        principalSchema: "app",
                        principalTable: "app_cases",
                        principalColumn: "case_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "app_case_prescriptions",
                schema: "app",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    medication = table.Column<string>(type: "character varying(255)", nullable: false),
                    dosage = table.Column<string>(type: "character varying(255)", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_app_case_prescriptions", x => x.id);
                    table.ForeignKey(
                        name: "fk_app_case_prescriptions_app_cases_case_id",
                        column: x => x.case_id,
                        principalSchema: "app",
                        principalTable: "app_cases",
                        principalColumn: "case_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_app_case_diagnoses_case_id",
                schema: "app",
                table: "app_case_diagnoses",
                column: "case_id");

            migrationBuilder.CreateIndex(
                name: "ix_app_case_procedures_case_id",
                schema: "app",
                table: "app_case_procedures",
                column: "case_id");

            migrationBuilder.CreateIndex(
                name: "ix_app_case_prescriptions_case_id",
                schema: "app",
                table: "app_case_prescriptions",
                column: "case_id");

            migrationBuilder.CreateIndex(
                name: "ix_app_cases_doctor_id",
                schema: "app",
                table: "app_cases",
                column: "doctor_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "app_case_diagnoses",
                schema: "app");

            migrationBuilder.DropTable(
                name: "app_case_procedures",
                schema: "app");

            migrationBuilder.DropTable(
                name: "app_case_prescriptions",
                schema: "app");

            migrationBuilder.DropTable(
                name: "app_cases",
                schema: "app");
        }
    }
}
