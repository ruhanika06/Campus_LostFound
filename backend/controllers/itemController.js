const db = require('../db');
const jwt = require('jsonwebtoken');

exports.getAllItems = async (req, res) => {
    try {
        const { category, status, date, user_id } = req.query;
        let query = `
            SELECT i.*, u.name as reporter_name, u.email as reporter_email, u.phone as reporter_phone
            FROM items i
            JOIN users u ON i.user_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (category) {
            query += ' AND i.category = ?';
            params.push(category);
        }
        if (status) {
            query += ' AND i.status = ?';
            params.push(status);
        }
        if (date) {
            query += ' AND i.date_reported = ?';
            params.push(date);
        }
        if (user_id) {
            query += ' AND i.user_id = ?';
            params.push(user_id);
        }

        const [items] = await db.query(query, params);

        let isAdmin = false;
        const token = req.headers['authorization'];
        if (token) {
            try {
                const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret_key');
                if (decoded.role === 'Admin') isAdmin = true;
            } catch (e) {}
        }

        const safeItems = items.map(item => {
            if (!isAdmin) {
                delete item.reporter_email;
                delete item.reporter_phone;
            }
            return item;
        });

        res.json(safeItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const [items] = await db.query('SELECT * FROM items WHERE item_id = ?', [req.params.id]);
        if (items.length === 0) return res.status(404).json({ message: 'Item not found' });
        res.json(items[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Helper for Similarity Score
const calculateSimilarity = (item1, item2) => {
    let score = 0;
    if (item1.category === item2.category) score += 0.4;
    // Simple substring match for location
    if (item1.location && item2.location && (item1.location.toLowerCase().includes(item2.location.toLowerCase()) || item2.location.toLowerCase().includes(item1.location.toLowerCase()))) {
        score += 0.3;
    }
    // Simple substring match for name
    if (item1.item_name && item2.item_name && (item1.item_name.toLowerCase().includes(item2.item_name.toLowerCase()) || item2.item_name.toLowerCase().includes(item1.item_name.toLowerCase()))) {
        score += 0.3;
    }
    return score;
};

exports.createItem = async (req, res) => {
    const { item_name, category, description, location, date_reported, status, image_url } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO items (item_name, category, description, location, date_reported, status, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [item_name, category, description, location, date_reported, status, image_url, req.userId]
        );
        const newItemId = result.insertId;

        // --- MATCHING ALGORITHM ---
        const oppositeStatus = status === 'Lost' ? 'Found' : 'Lost';
        // Only match against items still actively Lost or Found (not Returned/Claimed)
        const [potentialMatches] = await db.query(
            'SELECT * FROM items WHERE status = ? AND item_id != ?',
            [oppositeStatus, newItemId]
        );

        const newItem = { item_name, category, location };
        for (let otherItem of potentialMatches) {
            const score = calculateSimilarity(newItem, otherItem);
            if (score >= 0.6) { // Threshold for a match
                const lostItemId = status === 'Lost' ? newItemId : otherItem.item_id;
                const foundItemId = status === 'Found' ? newItemId : otherItem.item_id;

                // Guard: don't insert duplicate match rows
                const [existingMatch] = await db.query(
                    'SELECT match_id FROM matches WHERE lost_item_id = ? AND found_item_id = ?',
                    [lostItemId, foundItemId]
                );
                if (existingMatch.length > 0) continue;

                // Insert into matches table
                await db.query(
                    'INSERT INTO matches (lost_item_id, found_item_id, similarity_score) VALUES (?, ?, ?)',
                    [lostItemId, foundItemId, score]
                );

                // Notify both users
                const msgNewUser = `A potential match was found for your ${status} item: ${item_name}.`;
                await db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [req.userId, msgNewUser]);

                const msgOtherUser = `A potential match was found for your ${otherItem.status} item: ${otherItem.item_name}.`;
                await db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [otherItem.user_id, msgOtherUser]);
            }
        }

        res.status(201).json({ id: newItemId, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


exports.claimItem = async (req, res) => {
    const { item_id } = req.body;
    try {
        // Check if the item exists and is still claimable
        const [items] = await db.query('SELECT * FROM items WHERE item_id = ?', [item_id]);
        if (items.length === 0) return res.status(404).json({ message: 'Item not found' });
        const item = items[0];

        // Only 'Found' items can be claimed
        if (item.status !== 'Found') {
            return res.status(400).json({ message: 'This item is not available to be claimed.' });
        }

        // Prevent the reporter from claiming their own item
        if (item.user_id === req.userId) {
            return res.status(403).json({ message: 'You cannot claim your own reported item.' });
        }

        // Prevent duplicate pending claims from the same user
        const [existingClaims] = await db.query(
            'SELECT * FROM claims WHERE item_id = ? AND claimed_by = ? AND verification_status = "Pending"',
            [item_id, req.userId]
        );
        if (existingClaims.length > 0) {
            return res.status(400).json({ message: 'You have already submitted a pending claim for this item.' });
        }

        // Insert the claim — do NOT change item status yet; admin will approve/reject
        await db.query('INSERT INTO claims (item_id, claimed_by) VALUES (?, ?)', [item_id, req.userId]);
        res.json({ message: 'Claim submitted for approval' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getClaims = async (req, res) => {
    try {
        const [claims] = await db.query(`
            SELECT c.*, i.item_name, i.image_url, i.category, i.location, i.description, i.date_reported, i.status as item_status,
                   u.name as claimant_name, u.email as claimant_email, u.phone as claimant_phone
            FROM claims c 
            JOIN items i ON c.item_id = i.item_id 
            JOIN users u ON c.claimed_by = u.user_id
            ORDER BY c.claim_date DESC
        `);
        res.json(claims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get claims submitted by the currently logged-in user
exports.getMyClaims = async (req, res) => {
    try {
        const [claims] = await db.query(`
            SELECT c.claim_id, c.item_id, c.claim_date, c.verification_status,
                   i.item_name, i.category, i.location, i.status as item_status
            FROM claims c
            JOIN items i ON c.item_id = i.item_id
            WHERE c.claimed_by = ?
            ORDER BY c.claim_date DESC
        `, [req.userId]);
        res.json(claims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE items SET status = ? WHERE item_id = ?', [status, req.params.id]);
        res.json({ message: 'Item status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateClaimStatus = async (req, res) => {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const { id } = req.params;
    try {
        // Fetch the claim to know which item it belongs to
        const [claims] = await db.query('SELECT * FROM claims WHERE claim_id = ?', [id]);
        if (claims.length === 0) return res.status(404).json({ message: 'Claim not found' });
        const claim = claims[0];

        // Update the claim verification status
        await db.query('UPDATE claims SET verification_status = ? WHERE claim_id = ?', [status, id]);

        if (status === 'Approved') {
            // Mark item as Returned
            await db.query('UPDATE items SET status = "Returned" WHERE item_id = ?', [claim.item_id]);
            // Reject all other pending claims for the same item
            await db.query(
                'UPDATE claims SET verification_status = "Rejected" WHERE item_id = ? AND claim_id != ? AND verification_status = "Pending"',
                [claim.item_id, id]
            );
            // Notify the claimant
            await db.query(
                'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
                [claim.claimed_by, `Your claim has been approved! Please collect your item.`]
            );
        } else if (status === 'Rejected') {
            // Revert item status back to 'Found' so others can still claim it
            const [otherPending] = await db.query(
                'SELECT COUNT(*) as cnt FROM claims WHERE item_id = ? AND verification_status = "Pending"',
                [claim.item_id]
            );
            if (otherPending[0].cnt === 0) {
                await db.query('UPDATE items SET status = "Found" WHERE item_id = ?', [claim.item_id]);
            }
            // Notify the claimant of rejection
            await db.query(
                'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
                [claim.claimed_by, `Your claim was rejected. Please contact the admin for more details.`]
            );
        }

        res.json({ message: `Claim ${status} successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        // 'user_id' is the correct column name in the items table (was wrongly 'reported_by')
        const [rows] = await db.query('SELECT user_id FROM items WHERE item_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Item not found' });
        
        const item = rows[0];
        if (req.userRole !== 'Admin' && item.user_id !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this item' });
        }

        await db.query('DELETE FROM items WHERE item_id = ?', [req.params.id]);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
