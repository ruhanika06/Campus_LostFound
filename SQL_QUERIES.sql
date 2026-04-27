-- Database Queries for Campus Lost & Found System

-- 1. Get all lost items reported by a specific user
SELECT i.item_name, i.category, i.status, u.name as reported_by
FROM items i
JOIN users u ON i.user_id = u.user_id
WHERE i.status = 'Lost' AND u.user_id = 1;

-- 2. Find all items found in a specific location
SELECT item_name, description, location
FROM items
WHERE location LIKE '%Library%'; 

-- 3. List all pending claims for admin
SELECT c.claim_id, i.item_name, u.name as claimed_by, c.verification_status
FROM claims c
JOIN items i ON c.item_id = i.item_id
JOIN users u ON c.claimed_by = u.user_id
WHERE c.verification_status = 'Pending';

-- 4. Get item details along with founder/owner details
SELECT i.item_name, u.name as reported_by, u.phone, i.status
FROM items i
JOIN users u ON i.user_id = u.user_id;

-- 5. Count of items per category
SELECT category, COUNT(*) as count
FROM items
GROUP BY category;

-- 6. Count of items per status
SELECT status, COUNT(*) as status_count
FROM items
GROUP BY status;

-- 7. Find items reported within a date range
SELECT * 
FROM items
WHERE date_reported BETWEEN '2023-10-01' AND '2023-11-01';

-- 8. Get most active users (who report the most items)
SELECT u.name, COUNT(i.item_id) as reports_count
FROM users u
JOIN items i ON u.user_id = i.user_id
GROUP BY u.user_id
ORDER BY reports_count DESC
LIMIT 5;

-- 9. Get claimed items and who approved them (Assuming 'admin_id' logic, simplified here)
SELECT i.item_name, u.name as claimant, c.verification_status
FROM claims c
JOIN items i ON c.item_id = i.item_id
JOIN users u ON c.claimed_by = u.user_id
WHERE c.verification_status = 'Approved';
