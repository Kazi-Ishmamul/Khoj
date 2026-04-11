<?php
$dbPath = __DIR__ . '/database.sqlite';

// Create a new SQLite database
$pdo = new PDO('sqlite:' . $dbPath);

// Enable foreign keys
$pdo->exec('PRAGMA foreign_keys = ON');

echo "Database created at: " . $dbPath . "\n";
$pdo = null;
