-- A profile photo is optional and independent of saved search preferences.
CREATE TABLE profile_photos (
 id uuid PRIMARY KEY,
 user_id uuid UNIQUE NOT NULL REFERENCES users ON DELETE CASCADE,
 object_key text UNIQUE NOT NULL,
 width integer NOT NULL CHECK(width BETWEEN 1 AND 1600),
 height integer NOT NULL CHECK(height BETWEEN 1 AND 1600),
 byte_size integer NOT NULL CHECK(byte_size BETWEEN 1 AND 5242880),
 created_at timestamptz NOT NULL DEFAULT now()
);

-- Retain used upload tokens after replacement/removal so a delayed retry cannot
-- restore an old photo. Failed uploads roll back their token with the photo.
CREATE TABLE profile_photo_upload_requests (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_photo_upload_requests_user ON profile_photo_upload_requests(user_id);

CREATE TRIGGER profile_photo_deletion AFTER DELETE ON profile_photos
 FOR EACH ROW EXECUTE FUNCTION queue_photo_object_deletion();
CREATE TRIGGER profile_photo_replacement AFTER UPDATE OF object_key ON profile_photos
 FOR EACH ROW WHEN (OLD.object_key IS DISTINCT FROM NEW.object_key)
 EXECUTE FUNCTION queue_photo_object_deletion();
