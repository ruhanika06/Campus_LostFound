const bcrypt = require('bcryptjs');
const db = require('./db');

const command = process.argv[2];

const run = async () => {
    try {
        if (command === 'wipe-users') {
            console.log('⚠️ WARNING: Deleting all users will also delete ALL items, claims, and notifications due to CASCADE rules.');
            await db.query('SET FOREIGN_KEY_CHECKS = 0');
            await db.query('TRUNCATE TABLE users');
            await db.query('TRUNCATE TABLE items');
            await db.query('TRUNCATE TABLE matches');
            await db.query('TRUNCATE TABLE claims');
            await db.query('TRUNCATE TABLE notifications');
            await db.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log('✅ Database successfully wiped clean.');
            
        } else if (command === 'add-admin') {
            const name = process.argv[3];
            const email = process.argv[4];
            const password = process.argv[5];
            
            if (!name || !email || !password) {
                console.log('Usage: node manage_db.js add-admin "Name" "email" "password"');
                process.exit(1);
            }
            
            const hash = await bcrypt.hash(password, 10);
            await db.query(
                'INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, "Admin", ?)',
                [name, email, hash]
            );
            console.log(`✅ Admin account created for ${email}`);
            
        } else if (command === 'reset-password') {
            const email = process.argv[3];
            const newPassword = process.argv[4];
            
            if (!email || !newPassword) {
                console.log('Usage: node manage_db.js reset-password "email" "new_password"');
                process.exit(1);
            }
            
            const hash = await bcrypt.hash(newPassword, 10);
            const [result] = await db.query(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                [hash, email]
            );
            
            if (result.affectedRows > 0) {
                console.log(`✅ Password successfully updated for ${email}`);
            } else {
                console.log(`❌ No user found with email ${email}`);
            }
        } else {
            console.log(`
🛠️ Lost & Found Database Manager 🛠️

Available Commands:
1. Wipe entire database (clears all users, items, and claims):
   node manage_db.js wipe-users

2. Add a new Admin account:
   node manage_db.js add-admin "Admin Name" "admin@email.com" "password123"

3. Reset any user/admin's password:
   node manage_db.js reset-password "user@email.com" "newpassword123"
            `);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
    process.exit();
};

run();
