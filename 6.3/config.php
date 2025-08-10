<?php
/* Basic DB config for local dev (XAMPP) */
$host = "127.0.0.1";
$dbname = "test";
$username = "root";
$password = ""; // XAMPP default is empty

/* PDO DSN & options */
$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
