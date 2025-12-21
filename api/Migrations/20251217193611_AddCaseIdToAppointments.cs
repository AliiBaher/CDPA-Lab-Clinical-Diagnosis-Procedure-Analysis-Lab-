using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseIdToAppointments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check if column already exists before adding
            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'app' 
                        AND table_name = 'appointments' 
                        AND column_name = 'case_id'
                    ) THEN
                        ALTER TABLE app.appointments ADD COLUMN case_id uuid;
                        CREATE INDEX IX_appointments_case_id ON app.appointments(case_id);
                    END IF;
                END $$;
            ");

            // Only add foreign key if case table exists (it should)
            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_schema = 'app' 
                        AND table_name = 'app_cases'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM information_schema.table_constraints 
                        WHERE constraint_name = 'FK_appointments_app_cases_case_id'
                    ) THEN
                        ALTER TABLE app.appointments 
                        ADD CONSTRAINT FK_appointments_app_cases_case_id 
                        FOREIGN KEY (case_id) REFERENCES app.app_cases(case_id) ON DELETE SET NULL;
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.table_constraints 
                        WHERE constraint_name = 'FK_appointments_app_cases_case_id'
                    ) THEN
                        ALTER TABLE app.appointments 
                        DROP CONSTRAINT FK_appointments_app_cases_case_id;
                    END IF;
                    
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'app' 
                        AND table_name = 'appointments' 
                        AND column_name = 'case_id'
                    ) THEN
                        DROP INDEX IF EXISTS app.IX_appointments_case_id;
                        ALTER TABLE app.appointments DROP COLUMN case_id;
                    END IF;
                END $$;
            ");
        }
    }
}
