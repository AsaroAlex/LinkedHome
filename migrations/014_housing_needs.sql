-- Keep the three original housing choices valid and leave existing profiles
-- untouched. Access requirements describe a home, without collecting a diagnosis.
ALTER TABLE profiles DROP CONSTRAINT profiles_housing_needs;
ALTER TABLE profiles
 ADD CONSTRAINT profiles_housing_needs CHECK (
  housing_needs <@ ARRAY[
   'elevator','outdoor_space','parking','balcony','terrace','private_garden',
   'shared_garden','garage','bicycle_space','air_conditioning','independent_heating',
   'double_glazing','fiber_internet','cellar','storage_room','separate_kitchen',
   'workspace','washing_machine','dishwasher','security_door','video_intercom',
   'built_in_wardrobes'
  ]::text[]
  AND cardinality(housing_needs) =
   (CASE WHEN 'elevator'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'outdoor_space'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'parking'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'balcony'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'terrace'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'private_garden'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'shared_garden'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'garage'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'bicycle_space'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'air_conditioning'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'independent_heating'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'double_glazing'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'fiber_internet'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'cellar'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'storage_room'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'separate_kitchen'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'workspace'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'washing_machine'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'dishwasher'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'security_door'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'video_intercom'=ANY(housing_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'built_in_wardrobes'=ANY(housing_needs) THEN 1 ELSE 0 END)
 ),
 ADD COLUMN accessibility_needs text[] NOT NULL DEFAULT '{}',
 ADD CONSTRAINT profiles_accessibility_needs CHECK (
  accessibility_needs <@ ARRAY[
   'step_free_entry','step_free_home','wheelchair_lift','wide_doorways',
   'accessible_bathroom','step_free_shower'
  ]::text[]
  AND cardinality(accessibility_needs) =
   (CASE WHEN 'step_free_entry'=ANY(accessibility_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'step_free_home'=ANY(accessibility_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'wheelchair_lift'=ANY(accessibility_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'wide_doorways'=ANY(accessibility_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'accessible_bathroom'=ANY(accessibility_needs) THEN 1 ELSE 0 END
    + CASE WHEN 'step_free_shower'=ANY(accessibility_needs) THEN 1 ELSE 0 END)
 );
