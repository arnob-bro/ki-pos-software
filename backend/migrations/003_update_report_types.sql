-- Migration: Update generated_reports table to support x_report and z_report types
-- This migration adds support for the new report type constraints

-- Update the CHECK constraint to include new report types
PRAGMA foreign_keys=off;

-- Create a new table with the updated schema
CREATE TABLE generated_reports_new (
  id TEXT PRIMARY KEY,
  type VARCHAR NOT NULL CHECK (type IN ('x_report', 'z_report', 'daily', 'monthly', 'tax', 'employee')),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_blob TEXT,
  user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Copy data from the old table to the new table
INSERT INTO generated_reports_new 
SELECT * FROM generated_reports;

-- Drop the old table
DROP TABLE generated_reports;

-- Rename the new table to the original name
ALTER TABLE generated_reports_new RENAME TO generated_reports;

PRAGMA foreign_keys=on;

-- Create index for better performance on report type queries
CREATE INDEX IF NOT EXISTS idx_generated_reports_type_date ON generated_reports(type, DATE(generated_at));
CREATE INDEX IF NOT EXISTS idx_generated_reports_user_date ON generated_reports(user_id, DATE(generated_at)); 