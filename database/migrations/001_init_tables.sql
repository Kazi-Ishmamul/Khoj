CREATE DATABASE IF NOT EXISTS `khoj` 
    DEFAULT CHARACTER SET latin1 
    COLLATE latin1_danish_ci;

USE `khoj`;

Drop  table IF Exists 'users'

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    pic_path VARCHAR(255) DEFAULT 'assets/profile_pictures/default_profile_pic.png',
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

