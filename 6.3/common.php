<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function escape($html) {
    return htmlspecialchars($html, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
}

if (empty($_SESSION["csrf"])) {
    $_SESSION["csrf"] = bin2hex(random_bytes(32));
}

function valid_csrf() {
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        return isset($_POST["csrf"]) && hash_equals($_SESSION["csrf"], $_POST["csrf"]);
    }
    return true; // not a POST
}
