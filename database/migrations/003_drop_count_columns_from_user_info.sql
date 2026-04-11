-- Migration: Drop count columns from user_info table
-- Reason: These counts are now calculated dynamically from the items and reports tables

USE `khoj`;

ALTER TABLE `user_info` 
DROP COLUMN IF EXISTS `items_lost_count`,
DROP COLUMN IF EXISTS `items_found_count`,
DROP COLUMN IF EXISTS `report_strikes`;
