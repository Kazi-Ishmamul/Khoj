-- Reference SQL for Khoj admin analytics (MySQL-oriented).
-- Replace date range placeholders for filtered queries.

-- Lost / found counts (last 30 days, valid items only)
SELECT
    SUM(status = 'lost') AS lost_count,
    SUM(status = 'found') AS found_count
FROM items
WHERE valid = 1
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Top categories from items.category (string column)
SELECT
    COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized') AS category_label,
    COUNT(*) AS cnt
FROM items
WHERE valid = 1
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized')
ORDER BY cnt DESC
LIMIT 12;

-- Active users: users with role "user" who posted at least one valid item in range
SELECT COUNT(*) AS active_users
FROM users u
WHERE u.role = 'user'
  AND EXISTS (
      SELECT 1 FROM items i
      WHERE i.user_id = u.id
        AND i.valid = 1
        AND i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  );

-- Total registered end-users (all time)
SELECT COUNT(*) FROM users WHERE role = 'user';
