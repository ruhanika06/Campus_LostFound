// const mysql = require('mysql2');
// require('dotenv').config();

// const db = mysql.createPool({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || '',
//     database: process.env.DB_NAME || 'campus_lost_found',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// db.getConnection((err, connection) => {
//     if (err) {
//         console.error('Database connection failed:', err);
//     } else {
//         console.log('Connected to MySQL database');
//         connection.release();
//     }
// });

// module.exports = db.promise();


const mysql = require('mysql2');
require('dotenv').config();

// Ensure required environment variables exist
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    console.error("Missing required database environment variables");
    process.exit(1);
}

// Create connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // Railway usually provides this
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection on startup
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1); // stop app if DB fails
    } else {
        console.log('Connected to MySQL database');
        connection.release();
    }
});

// Export promise-based pool
module.exports = db.promise();
