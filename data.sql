CREATE DATABASE user_database;
USE user_database;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DESC users;
INSERT INTO users (name, email, password)
VALUES ('Anandita Singh', 'ananditasingh.com', 'hashed_password_here');


