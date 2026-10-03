CREATE TABLE users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE NOT NULL,
 password_hash text NOT NULL, display_name text NOT NULL CHECK(length(display_name) BETWEEN 2 AND 60),
 role text NOT NULL CHECK(role IN ('tenant','landlord','both')),
 staff_role text CHECK(staff_role IN ('admin','moderator')),
 email_verified boolean NOT NULL DEFAULT false, suspended boolean NOT NULL DEFAULT false,
 suspension_reason text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX sessions_user ON sessions(user_id);
CREATE TABLE auth_tokens (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE, purpose text NOT NULL CHECK(purpose IN ('verify','reset')), expires_at timestamptz NOT NULL);
CREATE INDEX auth_tokens_user ON auth_tokens(user_id);
CREATE TABLE profiles (
 user_id uuid PRIMARY KEY REFERENCES users ON DELETE CASCADE,
 city text NOT NULL, budget integer NOT NULL CHECK(budget BETWEEN 100 AND 20000),
 move_in date NOT NULL, duration integer NOT NULL CHECK(duration BETWEEN 1 AND 120),
 occupants integer NOT NULL CHECK(occupants BETWEEN 1 AND 12),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','paused')),
 revision integer NOT NULL DEFAULT 1, published_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profiles_discovery ON profiles(city,status);
CREATE TABLE properties (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 title text NOT NULL CHECK(length(title) BETWEEN 5 AND 100), city text NOT NULL, area text NOT NULL CHECK(length(area) BETWEEN 2 AND 60),
 description text NOT NULL CHECK(length(description) BETWEEN 10 AND 1500),
 rent integer NOT NULL CHECK(rent BETWEEN 100 AND 20000), available_from date NOT NULL,
 min_months integer NOT NULL CHECK(min_months BETWEEN 1 AND 120), max_months integer NOT NULL CHECK(max_months BETWEEN min_months AND 120),
 capacity integer NOT NULL CHECK(capacity BETWEEN 1 AND 12), sqm integer NOT NULL CHECK(sqm BETWEEN 10 AND 2000),
 rooms integer NOT NULL CHECK(rooms BETWEEN 1 AND 20), furnished boolean NOT NULL DEFAULT false,
 authority_attested boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','paused')),
 revision integer NOT NULL DEFAULT 1, published_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX properties_owner ON properties(owner_id);
CREATE TABLE invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), property_id uuid NOT NULL REFERENCES properties ON DELETE CASCADE,
 tenant_id uuid NOT NULL REFERENCES users ON DELETE CASCADE, landlord_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined','withdrawn','cancelled','closed')),
 property_revision integer NOT NULL, profile_revision integer NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT(now()+interval '14 days'), accepted_at timestamptz,
 UNIQUE(property_id,tenant_id), CHECK(tenant_id<>landlord_id)
);
CREATE INDEX invitations_tenant ON invitations(tenant_id,created_at);
CREATE INDEX invitations_landlord ON invitations(landlord_id,created_at);
CREATE TABLE messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), invitation_id uuid NOT NULL REFERENCES invitations ON DELETE CASCADE,
 sender_id uuid NOT NULL REFERENCES users ON DELETE CASCADE, body text NOT NULL CHECK(length(body) BETWEEN 1 AND 2000), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_thread ON messages(invitation_id,created_at);
CREATE TABLE blocks (blocker_id uuid NOT NULL REFERENCES users ON DELETE CASCADE, blocked_id uuid NOT NULL REFERENCES users ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(blocker_id,blocked_id), CHECK(blocker_id<>blocked_id));
CREATE TABLE reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 invitation_id uuid NOT NULL REFERENCES invitations ON DELETE CASCADE, message_id uuid REFERENCES messages ON DELETE SET NULL,
 reason text NOT NULL CHECK(reason IN ('scam','harassment','discrimination','other')), details text NOT NULL CHECK(length(details) BETWEEN 5 AND 500),
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')), resolution text, resolved_by uuid REFERENCES users ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz
);
CREATE INDEX reports_queue ON reports(status,created_at);
CREATE TABLE verification_checks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('identity','income')),
 status text NOT NULL CHECK(status IN ('UNVERIFIED','PENDING','VERIFIED','FAILED','EXPIRED','DISPUTED')),
 provider text, provider_reference text, checked_at timestamptz, expires_at timestamptz, dispute_reason text,
 CHECK(status<>'VERIFIED' OR (provider IS NOT NULL AND provider_reference IS NOT NULL AND checked_at IS NOT NULL AND expires_at>checked_at))
);
CREATE TABLE audit_log (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id uuid REFERENCES users ON DELETE SET NULL, subject_id uuid REFERENCES users ON DELETE SET NULL, action text NOT NULL, reason_code text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE events (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL CHECK(name IN ('profile_published','property_published','invitation_sent','invitation_accepted','message_sent','report_submitted','account_deleted')), created_at timestamptz NOT NULL DEFAULT now());
