const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.register = async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    try {
        if (!email.toLowerCase().endsWith('@thapar.edu')) {
            return res.status(400).json({ message: 'Only @thapar.edu email addresses are allowed.' });
        }

        const rawPhone = phone.replace(/\D/g, '');
        if (rawPhone.length < 10 || rawPhone.length > 15) {
            return res.status(400).json({ message: 'Invalid phone number length.' });
        }

        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)', [name, email, hashedPassword, role, phone]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body; // 'email' payload might hold a username
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ? OR name = ?', [email, email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { user_id: user.user_id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT user_id, name, email, role, phone FROM users WHERE user_id = ?', [req.userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
