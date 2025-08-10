<?php
/* Installer to initialize DB and users table */
require "config.php";

try {
    $connection = new PDO("mysql:host=$host", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $sql = file_get_contents(__DIR__ . "/data/init.sql");
    $connection->exec($sql);

    echo "<p>Database and table created successfully. You can now visit <code>public/</code>.</p>";
} catch (PDOException $error) {
    echo $error->getMessage();
}
