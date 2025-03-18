const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); 

// Handle login form submission
app.post("/login", (req, res) => {
    const { username, email, password } = req.body;
    console.log(`User: ${username}, Email: ${email}, Password: ${password}`);
    
    if (username === "admin" && password === "1234") {
        res.send("Login successful! ✅");
    } else {
        res.send("Invalid username or password ❌");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
