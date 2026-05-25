-- Clean up duplicate device sessions and enforce unique device_identifier per user
DELETE FROM device_sessions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, device_name, browser) id
  FROM device_sessions
  ORDER BY user_id, device_name, browser, last_active DESC
);

ALTER TABLE device_sessions 
ADD CONSTRAINT unique_device 
UNIQUE (user_id, device_name, browser);
