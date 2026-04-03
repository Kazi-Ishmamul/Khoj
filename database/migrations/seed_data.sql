-- Disable foreign key checks to ensure a clean insert
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE user_info;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Populating the 'users' table
-- Note: Passwords should be hashed in production (e.g., using Laravel's Hash::make or Bcrypt)
INSERT INTO users (name, phone, email, address, password, role) VALUES
('Admin', '01711223344', 'admin@gmail.com', 'AUST, Tejgaon, Dhaka', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'), --Admin@2026
('Shoaib Mughdo', '01822334455', 'shoaib@gmail.com', 'Mirpur-10, Dhaka', '$2y$10$5JYFerCOh8bTt6T.TpfHpeFActwdDJLXqT0fpheODU0PB7jF7q/TW', 'user'), --Shoaib@2026
('Faiyaz Fardin', '01933445566', 'fardin@gmail.com', 'Uttara Sector 4, Dhaka', '$2y$10$g08KQKx7MHvPcJMyD6zvDOM.xfORoA.rqZxrbaHdcwCz/9WLElZn.', 'user'), --Faiyaz@2026
('Kazi Ishmam', '01544556677', 'kazi@gmail.com', 'Narsingdi, Dhaka', '$2y$10$u8wMBJkcidcBD2FUdG7FCeTvEU/MDMLKWVT5X.Xr7jm/TN56MCqyq', 'user'), --Kazi@2026

/*
INSERT INTO users (name, phone, email, address, pic_url, password, role) VALUES
('Test Volunteer', '01655667788', 'volunteer@test.com', 'Dhanmondi 27, Dhaka', 'https://res.cloudinary.com/demo/image/upload/v4/profiles/vol_pfp.png', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');
*/

-- 2. Populating the 'user_info' table
-- We map these to the IDs 1, 2, 3 and 4 created above
INSERT INTO user_info (user_id, bio, fb_url, x_url, insta_url, linkedin_url, items_lost_count, items_found_count, report_strikes) VALUES
(1, 'System Administrator for Khoj application.', 'https://facebook.com/khoj_admin', NULL, NULL, 'https://linkedin.com/in/khoj-admin', 0, 0, 0),
(2, 'CSE student and frequent traveler. Always losing my keys.', 'https://facebook.com/shoaib', 'https://x.com/shoaib', 'https://instagram.com/shoaib', 'https://linkedin.com/in/shoaib', 0, 0, 0),
(3, 'Happy to help return lost items to their owners!', 'https://facebook.com/fardin', NULL, 'https://instagram.com/fardin', 'https://linkedin.com/in/fardin', 1, 8, 0),
(4, 'Building things with React and Laravel.', 'https://facebook.com/ishmam', 'https://x.com/ishmam', NULL, 'https://linkedin.com/in/ishmam', 2, 3, 0),
