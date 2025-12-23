-- Create doctor_ratings table
CREATE TABLE IF NOT EXISTS app.doctor_ratings (
    id UUID PRIMARY KEY,
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    appointment_id UUID NOT NULL UNIQUE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT fk_doctor_ratings_doctor 
        FOREIGN KEY (doctor_id) REFERENCES app.app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_ratings_patient 
        FOREIGN KEY (patient_id) REFERENCES app.app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_ratings_appointment 
        FOREIGN KEY (appointment_id) REFERENCES app.appointments(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_doctor_id ON app.doctor_ratings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_patient_id ON app.doctor_ratings(patient_id);
