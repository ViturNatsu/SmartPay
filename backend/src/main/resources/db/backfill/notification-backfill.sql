UPDATE notifications
SET is_read = FALSE
WHERE is_read IS NULL;

UPDATE notifications
SET tier = 2
WHERE tier IS NULL
  AND type = 'SECURITY'
  AND title = 'New sign-in detected';

UPDATE notifications
SET tier = 2
WHERE tier IS NULL
  AND type = 'WARNING'
  AND title = 'Low wallet balance';

UPDATE notifications
SET tier = 3
WHERE tier IS NULL
  AND type = 'SUCCESS'
  AND title = 'Payment successful';

ALTER TABLE notifications
    DROP COLUMN IF EXISTS priority;