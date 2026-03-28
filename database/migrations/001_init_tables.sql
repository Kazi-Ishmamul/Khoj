CREATE DATABASE IF NOT EXISTS `khoj` 
    DEFAULT CHARACTER SET latin1 
    COLLATE latin1_danish_ci

USE `khoj`

Drop table IF Exists 'user_info'
Drop table IF Exists 'users'


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

    CONSTRAINT fk_user_stats FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
)
