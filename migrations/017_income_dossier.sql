-- A separate manual workflow; existing synthetic attestations remain intact.
CREATE TABLE income_dossiers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid UNIQUE NOT NULL REFERENCES users ON DELETE CASCADE,
 tenants jsonb NOT NULL,
 guarantor jsonb,
 people_permission boolean NOT NULL CHECK(people_permission),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 synthetic boolean NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(CASE WHEN jsonb_typeof(tenants)='array' THEN jsonb_array_length(tenants) BETWEEN 1 AND 12 ELSE false END),
 CHECK(guarantor IS NULL OR jsonb_typeof(guarantor)='object')
);

CREATE TABLE income_documents (
 id uuid PRIMARY KEY,
 dossier_id uuid NOT NULL REFERENCES income_dossiers ON DELETE CASCADE,
 person_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('payslip','pension','tax_return','other')),
 mime text NOT NULL CHECK(mime IN ('application/pdf','image/webp')),
 byte_size integer NOT NULL CHECK(byte_size BETWEEN 1 AND 5242880),
 sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
 object_key text UNIQUE NOT NULL CHECK(object_key ~ '^income-documents/[a-f0-9-]{36}\.(pdf|webp)$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX income_documents_dossier ON income_documents(dossier_id,person_id,created_at,id);
CREATE TRIGGER income_document_deletion AFTER DELETE ON income_documents
 FOR EACH ROW EXECUTE FUNCTION queue_photo_object_deletion();

-- Retired upload tokens cannot recreate removed evidence after a delayed retry.
CREATE TABLE income_document_upload_requests (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 dossier_id uuid NOT NULL REFERENCES income_dossiers ON DELETE CASCADE,
 person_id uuid NOT NULL,
 document_id uuid REFERENCES income_documents ON DELETE SET NULL,
 kind text NOT NULL CHECK(kind IN ('payslip','pension','tax_return','other')),
 mime text NOT NULL CHECK(mime IN ('application/pdf','image/webp')),
 sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE income_dossier_shares (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 dossier_id uuid NOT NULL REFERENCES income_dossiers ON DELETE CASCADE,
 owner_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 recipient_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
 invitation_id uuid NOT NULL REFERENCES invitations ON DELETE CASCADE,
 revision integer NOT NULL CHECK(revision>0),
 consent_version text NOT NULL DEFAULT 'income-dossier-v1' CHECK(consent_version='income-dossier-v1'),
 documents_consent boolean NOT NULL CHECK(documents_consent),
 consented_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz,
 revocation_reason text CHECK(revocation_reason IN ('holder','changed')),
 CHECK(owner_id<>recipient_id),
 CHECK((revoked_at IS NULL AND revocation_reason IS NULL) OR (revoked_at IS NOT NULL AND revocation_reason IS NOT NULL)),
 UNIQUE(id,recipient_id,revision)
);
CREATE UNIQUE INDEX income_dossier_active_share ON income_dossier_shares(invitation_id) WHERE revoked_at IS NULL;
CREATE INDEX income_dossier_share_owner ON income_dossier_shares(owner_id,consented_at,id);

CREATE TABLE income_document_downloads (
 share_id uuid NOT NULL,
 document_id uuid NOT NULL REFERENCES income_documents ON DELETE CASCADE,
 recipient_id uuid NOT NULL,
 revision integer NOT NULL,
 downloaded_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(share_id,document_id,recipient_id,revision),
 FOREIGN KEY(share_id,recipient_id,revision) REFERENCES income_dossier_shares(id,recipient_id,revision) ON DELETE CASCADE
);

CREATE TABLE income_dossier_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 share_id uuid NOT NULL,
 document_id uuid NOT NULL REFERENCES income_documents ON DELETE CASCADE,
 person_id uuid NOT NULL,
 reviewer_id uuid NOT NULL,
 revision integer NOT NULL,
 observed_net_cents integer NOT NULL CHECK(observed_net_cents BETWEEN 0 AND 10000000),
 period_from text NOT NULL CHECK(period_from ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
 period_to text NOT NULL CHECK(period_to ~ '^[0-9]{4}-(0[1-9]|1[0-2])$' AND period_to>=period_from),
 method text NOT NULL DEFAULT 'landlord_document_review' CHECK(method='landlord_document_review'),
 reviewed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(share_id,reviewer_id,revision) REFERENCES income_dossier_shares(id,recipient_id,revision) ON DELETE CASCADE
);
CREATE INDEX income_dossier_review_share ON income_dossier_reviews(share_id,person_id,reviewed_at DESC,id);
