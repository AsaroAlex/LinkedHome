-- Keep the original migration immutable. Compute calendar-month boundaries
-- without converting dates to timestamps in the database session's time zone.
ALTER TABLE profiles DROP CONSTRAINT profiles_move_in_period;
ALTER TABLE profiles ADD CONSTRAINT profiles_move_in_period CHECK (
 (move_in_precision = 'day' AND (move_in_end IS NULL OR move_in_end = move_in))
 OR
 (move_in_precision = 'month' AND move_in_end IS NOT NULL
  AND EXTRACT(DAY FROM move_in) = 1
  AND move_in_end = (move_in + interval '1 month - 1 day')::date)
 OR
 (move_in_precision = 'range' AND move_in_end IS NOT NULL
  AND EXTRACT(DAY FROM move_in) = 1
  AND move_in_end >= move_in
  AND move_in_end = (date_trunc('month', move_in_end::timestamp) + interval '1 month - 1 day')::date)
);
