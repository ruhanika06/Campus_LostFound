-- Database Schema for Campus Lost & Found Management System

CREATE DATABASE IF NOT EXISTS campus_lost_found;
USE campus_lost_found;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role ENUM('Student', 'Staff', 'Admin') NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- For authentication
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Items Table
CREATE TABLE IF NOT EXISTS items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category ENUM('Electronics', 'Books', 'ID Card', 'Accessories', 'Others') NOT NULL,
    description TEXT,
    location VARCHAR(100),
    date_reported DATE NOT NULL,
    status ENUM('Lost', 'Found', 'Returned', 'Claimed') NOT NULL,
    user_id INT NOT NULL,
    image_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Lost_Reports Table
CREATE TABLE IF NOT EXISTS lost_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT UNIQUE NOT NULL,
    lost_date DATE NOT NULL,
    lost_location VARCHAR(100),
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 4. Found_Reports Table
CREATE TABLE IF NOT EXISTS found_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT UNIQUE NOT NULL,
    found_date DATE NOT NULL,
    found_location VARCHAR(100),
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 5. Claims Table
CREATE TABLE IF NOT EXISTS claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    claimed_by INT NOT NULL,
    claim_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (claimed_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. Matches Table
CREATE TABLE IF NOT EXISTS matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    lost_item_id INT NOT NULL,
    found_item_id INT NOT NULL,
    similarity_score FLOAT,
    status ENUM('Pending', 'Resolved', 'Dismissed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lost_item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (found_item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- Sample Data

-- Users
INSERT INTO users (name, email, phone, role, password_hash) VALUES 
('Admin User', 'admin@college.edu', '1234567890', 'Admin', 'hashed_password_1'),
('John Doe', 'john.doe@student.college.edu', '9876543210', 'Student', 'hashed_password_2'),
('Jane Smith', 'jane.smith@staff.college.edu', '5555555555', 'Staff', 'hashed_password_3');

-- Items
INSERT INTO items (item_name, category, description, location, date_reported, status, user_id) VALUES 
('Blue Backpack', 'Others', 'Nike backpack with books inside', 'Library', '2023-10-25', 'Lost', 2),
('iPhone 13', 'Electronics', 'Black iPhone with clear case', 'Cafeteria', '2023-10-26', 'Found', 3);

-- Reports
INSERT INTO lost_reports (item_id, lost_date, lost_location) VALUES (1, '2023-10-25', 'Library');
INSERT INTO found_reports (item_id, found_date, found_location) VALUES (2, '2023-10-26', 'Cafeteria');

-- Notifications
INSERT INTO notifications (user_id, message) VALUES (2, 'A matching item for your Blue Backpack might have been found!');
