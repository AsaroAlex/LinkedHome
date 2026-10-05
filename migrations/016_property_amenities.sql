-- Property amenities are public facts about the home. Keep old properties and
-- offer snapshots unchanged until the owner explicitly saves these fields.
ALTER TABLE properties
 ADD COLUMN amenities text[] NOT NULL DEFAULT '{}',
 ADD COLUMN amenities_details text NOT NULL DEFAULT '',
 ADD CONSTRAINT properties_amenities CHECK (
  amenities <@ ARRAY[
   'elevator','parking','balcony','terrace','private_garden','shared_garden',
   'garage','bicycle_space','air_conditioning','independent_heating','double_glazing',
   'fiber_internet','cellar','storage_room','separate_kitchen','workspace',
   'washing_machine','dishwasher','security_door','video_intercom','built_in_wardrobes',
   'step_free_entry','step_free_home','wheelchair_lift','wide_doorways',
   'accessible_bathroom','step_free_shower'
  ]::text[]
  AND cardinality(amenities) =
   (CASE WHEN 'elevator'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'parking'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'balcony'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'terrace'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'private_garden'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'shared_garden'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'garage'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'bicycle_space'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'air_conditioning'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'independent_heating'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'double_glazing'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'fiber_internet'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'cellar'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'storage_room'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'separate_kitchen'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'workspace'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'washing_machine'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'dishwasher'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'security_door'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'video_intercom'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'built_in_wardrobes'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'step_free_entry'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'step_free_home'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'wheelchair_lift'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'wide_doorways'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'accessible_bathroom'=ANY(amenities) THEN 1 ELSE 0 END
    + CASE WHEN 'step_free_shower'=ANY(amenities) THEN 1 ELSE 0 END)
 ),
 ADD CONSTRAINT properties_amenities_details CHECK (
  amenities_details=btrim(amenities_details, E' \t\n\r')
  AND char_length(amenities_details)<=600
  AND translate(amenities_details, E'\t\n\r','') !~ '[[:cntrl:]]'
 );
