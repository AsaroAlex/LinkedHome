-- Precise addresses are optional. Existing properties keep zone-only sharing.
ALTER TABLE properties
 ADD COLUMN street text NOT NULL DEFAULT '',
 ADD COLUMN street_number text NOT NULL DEFAULT '',
 ADD COLUMN address_visibility text NOT NULL DEFAULT 'area',
 ADD CONSTRAINT properties_street CHECK (
  street=btrim(street)
  AND (street='' OR char_length(street) BETWEEN 2 AND 120)
  AND street !~ '[[:cntrl:]]'
 ),
 ADD CONSTRAINT properties_street_number CHECK (
  street_number=btrim(street_number)
  AND (street_number='' OR char_length(street_number) BETWEEN 1 AND 20)
  AND street_number !~ '[[:cntrl:]]'
 ),
 ADD CONSTRAINT properties_address_visibility CHECK (
  address_visibility IN ('area','exact')
  AND (address_visibility='area' OR (street<>'' AND street_number<>''))
 );
