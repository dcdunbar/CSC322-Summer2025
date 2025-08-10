/* Create database and users table per tutorial */
CREATE DATABASE IF NOT EXISTS test;
USE test;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(30) NOT NULL,
  lastname  VARCHAR(30) NOT NULL,
  email     VARCHAR(50) NOT NULL,
  age       INT,
  location  VARCHAR(50) NOT NULL,
  date      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
