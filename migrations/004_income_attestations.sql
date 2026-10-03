ALTER TABLE verification_checks DROP CONSTRAINT verification_checks_status_check;
ALTER TABLE verification_checks ADD CONSTRAINT verification_checks_status_check
 CHECK(status IN ('UNVERIFIED','PENDING','VERIFIED','INSUFFICIENT','FAILED','EXPIRED','REVOKED','DISPUTED'));
ALTER TABLE verification_checks ADD CONSTRAINT verification_income_states
 CHECK(kind='income' OR status NOT IN ('INSUFFICIENT','REVOKED'));
ALTER TABLE verification_checks ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

-- This local feature records a bounded synthetic observation, never documents,
-- account transactions, employer names, credentials, or a tenant score.
CREATE TABLE income_attestations (
 check_id uuid PRIMARY KEY REFERENCES verification_checks(id) ON DELETE CASCADE,
 synthetic boolean NOT NULL CHECK(synthetic),
 scope text NOT NULL DEFAULT 'observed_net_income' CHECK(scope='observed_net_income'),
 category text NOT NULL CHECK(category IN ('employment','self_employment','variable')),
 period_from date NOT NULL,
 period_to date NOT NULL CHECK(period_to>=period_from),
 monthly_net_min integer CHECK(monthly_net_min>=0),
 monthly_net_max integer CHECK(monthly_net_max>=monthly_net_min),
 currency text NOT NULL DEFAULT 'EUR' CHECK(currency='EUR'),
 source_categories text[] NOT NULL DEFAULT '{}'
  CHECK(source_categories <@ ARRAY['employment','self_employment','pension','other']::text[]),
 CHECK((monthly_net_min IS NULL AND monthly_net_max IS NULL AND cardinality(source_categories)=0)
  OR (monthly_net_min IS NOT NULL AND monthly_net_max IS NOT NULL AND cardinality(source_categories)>0))
);

CREATE TABLE income_shares (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 check_id uuid NOT NULL REFERENCES income_attestations(check_id) ON DELETE CASCADE,
 invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
 subject_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 consent_version text NOT NULL CHECK(consent_version='income-summary-v1'),
 consented_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz,
 revocation_reason text CHECK(revocation_reason IN ('holder','superseded','disputed','attestation_revoked')),
 CHECK(subject_id<>recipient_id),
 CHECK((revoked_at IS NULL AND revocation_reason IS NULL)
  OR (revoked_at IS NOT NULL AND revocation_reason IS NOT NULL))
);
CREATE UNIQUE INDEX income_share_active_invitation ON income_shares(invitation_id) WHERE revoked_at IS NULL;
CREATE INDEX income_share_subject ON income_shares(subject_id,consented_at);

-- Observed facts stay fixed. Revocation/dispute are separate lifecycle states.
CREATE FUNCTION immutable_income_observation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'Income observations are immutable; create a new attestation';
END;
$$;
CREATE TRIGGER income_observation_immutable BEFORE UPDATE ON income_attestations
 FOR EACH ROW EXECUTE FUNCTION immutable_income_observation();

ALTER TABLE events DROP CONSTRAINT events_name_check;
ALTER TABLE events ADD CONSTRAINT events_name_check CHECK(name IN (
 'profile_published','property_published','invitation_sent','invitation_accepted',
 'message_sent','report_submitted','account_deleted','income_demo_created',
 'income_share_created','income_share_revoked','income_disputed','income_revoked'
));
