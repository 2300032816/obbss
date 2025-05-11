const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "your_mysql_username",
  password: "your_mysql_password",
  database: "banking_app",
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database.");
});

// Signup route
app.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";
  db.query(query, [name, email, phone, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") return res.status(400).send("Email already exists.");
      return res.status(500).send("Signup failed.");
    }
    res.status(201).send("User registered successfully.");
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).send("Invalid credentials.");

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).send("Invalid credentials.");
    res.status(200).send("Login successful.");
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
