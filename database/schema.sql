-- database/schema.sql

CREATE DATABASE IF NOT EXISTS crop_price_system;
USE crop_price_system;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('farmer', 'admin') DEFAULT 'farmer',
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Farmers table
CREATE TABLE farmers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    district VARCHAR(100),
    village VARCHAR(100),
    phone VARCHAR(20),
    preferred_language ENUM('en', 'sw') DEFAULT 'en',
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admins table
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crops table
CREATE TABLE crops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    name_sw VARCHAR(100),
    category VARCHAR(50),
    unit VARCHAR(20) DEFAULT 'kg',
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Markets table
CREATE TABLE markets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    name_sw VARCHAR(255),
    region VARCHAR(100),
    district VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prices table
CREATE TABLE prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crop_id INT NOT NULL,
    market_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    price_high DECIMAL(10, 2),
    price_low DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'TZS',
    unit VARCHAR(20) DEFAULT 'kg',
    recorded_by INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(id),
    FOREIGN KEY (market_id) REFERENCES markets(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Price history table
CREATE TABLE price_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    price_id INT,
    crop_id INT NOT NULL,
    market_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (price_id) REFERENCES prices(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id),
    FOREIGN KEY (market_id) REFERENCES markets(id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    crop_id INT NOT NULL,
    market_id INT,
    notification_type ENUM('sms', 'email', 'in_app') DEFAULT 'sms',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id),
    FOREIGN KEY (market_id) REFERENCES markets(id),
    UNIQUE KEY unique_subscription (farmer_id, crop_id, market_id)
);

-- SMS alerts table
CREATE TABLE sms_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    crop_id INT,
    market_id INT,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id),
    FOREIGN KEY (market_id) REFERENCES markets(id)
);

-- USSD sessions table
CREATE TABLE ussd_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    current_menu VARCHAR(100),
    selected_crop_id INT,
    selected_market_id INT,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('price_change', 'new_market', 'new_crop', 'system') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit logs table
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reports table
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    data JSON,
    generated_by INT,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_prices_crop_market ON prices(crop_id, market_id);
CREATE INDEX idx_prices_recorded_at ON prices(recorded_at);
CREATE INDEX idx_subscriptions_farmer ON subscriptions(farmer_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
