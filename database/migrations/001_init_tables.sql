CREATE DATABASE IF NOT EXISTS `khoj` 
    DEFAULT CHARACTER SET utf8mb4;

USE `khoj`;


DROP TABLE IF EXISTS `user_info`;
DROP TABLE IF EXISTS `items`;
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `migrations`;
DROP TABLE IF EXISTS `users`;



CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    pic_url VARCHAR(512) DEFAULT 'https://res.cloudinary.com/dait0sacc/image/upload/v1774704629/k7ygnoel72ychr8ico6n.png',
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)






CREATE TABLE user_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bio TEXT,
    fb_url VARCHAR(255),
    x_url VARCHAR(255),
    insta_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    items_lost_count INT DEFAULT 0,
    items_found_count INT DEFAULT 0,
    report_strikes INT DEFAULT 0,
    CONSTRAINT fk_user_stats FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)


CREATE TABLE items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT NOT NULL,
    date_time DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('lost', 'found') NOT NULL,
    contact_info VARCHAR(255) NOT NULL,
    item_image_url VARCHAR(512) DEFAULT 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
    resolution_status ENUM('not_claimed', 'claimed', 'resolved') DEFAULT 'not_claimed',
    valid TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

CREATE TABLE claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT UNSIGNED NOT NULL,
    claimed_by_id INT NOT NULL,
    validity TINYINT DEFAULT 0,   -- -1: declined, 0: pending, 1: accepted/resolved
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_claim_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    CONSTRAINT fk_claim_user FOREIGN KEY (claimed_by_id) REFERENCES users(id) ON DELETE CASCADE
)

