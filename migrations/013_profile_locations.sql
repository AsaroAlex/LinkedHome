-- Old profiles and seed data keep their single-city search until explicitly
-- saved with locations. Empty areas in an entry mean the whole city.
ALTER TABLE profiles ADD COLUMN locations jsonb,
 ADD CONSTRAINT profiles_locations CHECK (
  locations IS NULL OR CASE WHEN jsonb_typeof(locations)='array'
   THEN jsonb_array_length(locations) BETWEEN 1 AND 6 ELSE false END
 );
