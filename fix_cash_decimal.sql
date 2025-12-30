-- Allow decimal values for point_to_cash conversion rate
ALTER TABLE families ALTER COLUMN point_to_cash TYPE numeric USING point_to_cash::numeric;
