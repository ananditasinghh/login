const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware to parse URL-encoded bodies (from HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Setup session middleware
app.use(session({
  secret: 'mySecretKey', // Use a secure value in production
  resave: false,
  saveUninitialized: false
}));

// In-memory user storage (for demonstration purposes)
const users = [];

// Middleware to protect routes
function checkAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// GET /register - Serve the registration form
app.get('/register', (req, res) => {
  res.send(`
    <h2>Register</h2>
    <form action="/register" method="post">
      <label>Username:</label>
      <input type="text" name="username" required /><br /><br />
      <label>Password:</label>
      <input type="password" name="password" required /><br /><br />
      <button type="submit">Register</button>
    </form>
    <p>Already have an account? <a href="/login">Login here</a></p>
  `);
});

// POST /register - Process the registration form
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  // Check if user already exists
  if (users.find(user => user.username === username)) {
    return res.send('User already exists. Please choose a different username.');
  }
  
  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create a new user object
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword
  };
  
  users.push(newUser);
  res.send('Registration successful! <a href="/login">Login</a>');
});

// GET /login - Serve the login form
app.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form action="/login" method="post">
      <label>Username:</label>
      <input type="text" name="username" required /><br /><br />
      <label>Password:</label>
      <input type="password" name="password" required /><br /><br />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <a href="/register">Register here</a></p>
  `);
});

// POST /login - Process login data
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Find the user by username
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.send('Invalid username or password. <a href="/login">Try again</a>');
  }
  
  // Compare the hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.send('Invalid username or password. <a href="/login">Try again</a>');
  }
  
  // Save user id in the session
  req.session.userId = user.id;
  res.redirect('/dashboard');
});

// GET /dashboard - A protected route that only logged in users can access
app.get('/dashboard', checkAuthenticated, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  res.send(`
    <h2>Dashboard</h2>
    <p>Welcome, ${user.username}!</p>
    <a href="/logout">Logout</a>
  `);
});

// GET /logout - Logout the user
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Error logging out.');
    }
    res.redirect('/login');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
