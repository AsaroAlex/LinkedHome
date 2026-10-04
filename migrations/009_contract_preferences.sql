-- A contract type and an intended stay are separate preferences. Existing
-- durations remain unchanged and do not imply a particular legal contract.
ALTER TABLE profiles
 ADD COLUMN contract_preference text NOT NULL DEFAULT 'any'
 CHECK(contract_preference IN ('any','four_plus_four','three_plus_two','student','transitory'));

ALTER TABLE properties
 ADD COLUMN contract_type text NOT NULL DEFAULT 'unspecified'
 CHECK(contract_type IN ('unspecified','four_plus_four','three_plus_two','student','transitory'));
