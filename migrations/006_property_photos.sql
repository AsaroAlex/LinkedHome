CREATE TABLE property_photos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 property_id uuid NOT NULL REFERENCES properties ON DELETE CASCADE,
 object_key text UNIQUE NOT NULL,
 width integer NOT NULL CHECK(width BETWEEN 1 AND 1600),
 height integer NOT NULL CHECK(height BETWEEN 1 AND 1600),
 byte_size integer NOT NULL CHECK(byte_size BETWEEN 1 AND 5242880),
 position integer NOT NULL CHECK(position>=0),
 created_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz
);
CREATE INDEX property_photos_property ON property_photos(property_id,position) WHERE deleted_at IS NULL;

-- Object deletion survives cascading account/property deletion and can retry.
CREATE TABLE photo_object_deletions (
 object_key text PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE FUNCTION queue_photo_object_deletion() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO photo_object_deletions(object_key) VALUES(OLD.object_key) ON CONFLICT DO NOTHING;
 RETURN OLD;
END;
$$;
CREATE TRIGGER property_photo_deletion AFTER DELETE ON property_photos
 FOR EACH ROW EXECUTE FUNCTION queue_photo_object_deletion();
