const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("./scheme/admin_scheme");
const product_scheme = require("./scheme/product_scheme");
const Product_api = require("./routes/product_routes");

const secretKey = process.env.JWT_SECRET;

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = "mongodb://localhost:27017/Checkers-db"; // Replace 'yourDatabaseName' with your DB name

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });


app.use("/api/products", Product_api);

// app.get('/api/register', async (req, res) => {
//   const  username  = "admin_checkersc";
//   const password = "!Nashedi069!"

//   try {
//     const saltRounds = 10; // Number of salt rounds for hashing
//     const hashedPassword = await bcrypt.hash(password, 10); // Hash password with 10 salt rounds

//     const newUser = new Admin({
//       username: username,
//       password: hashedPassword,
//     });

//     await newUser.save();
//     res.status(201).json({ message: 'User registered successfully!' });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ error: 'Error registering user' });
//   }
// });

// Example Route
app.post("/api/admin-login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await Admin.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate a JWT token (for authentication)
    const token = jwt.sign(
      { id: user._id, username: user.username },
      secretKey,
      {
        expiresIn: "1h", // Token expires in 1 hour
      }
    );
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.log("Error login!", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
