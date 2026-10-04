-- A preview browser owns an isolated pair of synthetic accounts. Only the
-- digest of its opaque HttpOnly cookie is stored; ordinary sessions stay in
-- the existing sessions table.
CREATE TABLE preview_workspaces (
 token_hash text PRIMARY KEY CHECK(token_hash ~ '^[a-f0-9]{64}$'),
 tenant_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 landlord_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(tenant_id<>landlord_id)
);
CREATE INDEX preview_workspaces_expiry ON preview_workspaces(expires_at);
