-- Keep existing durations intact. New saves of long contracts have no separate
-- month count; temporary, student and flexible searches still require one.
ALTER TABLE profiles ALTER COLUMN duration DROP NOT NULL;
ALTER TABLE profiles ADD CONSTRAINT profiles_duration_required
 CHECK(duration IS NOT NULL OR contract_preference IN ('four_plus_four','three_plus_two'));

ALTER TABLE profiles
 ADD COLUMN pets text NOT NULL DEFAULT 'unspecified'
 CHECK(pets IN ('unspecified','none','dog','cat','other','multiple')),
 ADD COLUMN pets_details text NOT NULL DEFAULT '' CHECK(char_length(pets_details)<=200),
 ADD COLUMN furnishing_preference text NOT NULL DEFAULT 'any'
 CHECK(furnishing_preference IN ('any','furnished','unfurnished','partly_furnished')),
 ADD COLUMN housing_needs text[] NOT NULL DEFAULT '{}',
 ADD COLUMN about text NOT NULL DEFAULT '' CHECK(char_length(about)<=600),
 ADD CONSTRAINT profiles_housing_needs CHECK (
  housing_needs <@ ARRAY['elevator','outdoor_space','parking']::text[]
  AND cardinality(housing_needs) =
   (CASE WHEN 'elevator'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'outdoor_space'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'parking'=ANY(housing_needs) THEN 1 ELSE 0 END)
 );
