USE `khoj`;

-- Add coordinates to items for the Global Map feature
ALTER TABLE items ADD COLUMN lat DECIMAL(10, 8) DEFAULT NULL;
ALTER TABLE items ADD COLUMN lng DECIMAL(11, 8) DEFAULT NULL;

-- Add wallet balance to user_info for the Reward System
ALTER TABLE user_info ADD COLUMN wallet_balance DECIMAL(15, 2) DEFAULT 0.00;

-- Create tables for the Real-Time Chatting feature
CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT UNSIGNED NOT NULL,
    user_one INT NOT NULL,
    user_two INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conv_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_one FOREIGN KEY (user_one) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_two FOREIGN KEY (user_two) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
