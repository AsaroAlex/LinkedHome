-- The existing primary profile photo remains unchanged. Individual member
-- photos are optional and hidden from contacts when group mode is selected.
CREATE TABLE profile_households (
 user_id uuid PRIMARY KEY REFERENCES users ON DELETE CASCADE,
 mode text NOT NULL DEFAULT 'group' CHECK(mode IN ('group','individual'))
);

CREATE TABLE profile_household_members (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 display_name text NOT NULL CHECK(char_length(display_name) BETWEEN 1 AND 80 AND display_name=btrim(display_name)),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_household_members_user ON profile_household_members(user_id,created_at,id);

-- Retain a used client ID after deleting a member so a delayed create retry
-- cannot recreate a person the user removed. No names or photos are retained.
CREATE TABLE profile_household_member_requests (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_household_member_requests_user ON profile_household_member_requests(user_id);

CREATE TABLE profile_member_photos (
 id uuid PRIMARY KEY,
 member_id uuid UNIQUE NOT NULL REFERENCES profile_household_members ON DELETE CASCADE,
 object_key text UNIQUE NOT NULL,
 width integer NOT NULL CHECK(width BETWEEN 1 AND 1600),
 height integer NOT NULL CHECK(height BETWEEN 1 AND 1600),
 byte_size integer NOT NULL CHECK(byte_size BETWEEN 1 AND 5242880),
 created_at timestamptz NOT NULL DEFAULT now()
);

-- One token namespace covers primary and member uploads. A removed member's
-- tokens remain retired for the account lifetime, without retaining its name.
ALTER TABLE profile_photo_upload_requests
 ADD COLUMN member_id uuid REFERENCES profile_household_members ON DELETE SET NULL;

CREATE TRIGGER profile_member_photo_deletion AFTER DELETE ON profile_member_photos
 FOR EACH ROW EXECUTE FUNCTION queue_photo_object_deletion();
CREATE TRIGGER profile_member_photo_replacement AFTER UPDATE OF object_key ON profile_member_photos
 FOR EACH ROW WHEN (OLD.object_key IS DISTINCT FROM NEW.object_key)
 EXECUTE FUNCTION queue_photo_object_deletion();
