using System;
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
            migrationBuilder.AddColumn<DateTime>(
                name: "birthdate",
                schema: "app",
                table: "app_users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gender",
                schema: "app",
                table: "app_users",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "doctor_id",
                schema: "app",
                table: "app_cases",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "birthdate",
                schema: "app",
                table: "app_users");

            migrationBuilder.DropColumn(
                name: "gender",
                schema: "app",
                table: "app_users");

            migrationBuilder.AlterColumn<Guid>(
                name: "doctor_id",
                schema: "app",
                table: "app_cases",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
