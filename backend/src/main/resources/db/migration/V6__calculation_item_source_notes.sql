-- Preserve user-entered provenance on sourced cost lines in saved calculations.
-- Existing calculation items remain valid and receive a NULL note.
ALTER TABLE calculation_items ADD COLUMN source_note TEXT;
