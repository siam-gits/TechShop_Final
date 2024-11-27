const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/TechShop", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

// Connect to the database
connectDB();

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session to manage sessions
app.use(
  session({
    secret: "your-secret-key", // Change this to a more secure secret
    resave: false,
    saveUninitialized: true,
  })
);

// Define the User schema and model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Serve static files from the root
app.use(express.static(path.join(__dirname)));

// Routes
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

// Serve the signup success page after successful signup
app.get("/signup-success", (req, res) => {
  res.sendFile(path.join(__dirname, "signup-success.html"));
});

// Handle signup form submission
app.post("/api/signup", async (req, res) => {
  const { name, password } = req.body;

  try {
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, password: hashedPassword });
    await newUser.save();

    // Send success response with a redirect to the signup success page
    res.status(201).json({
      message: "User registered successfully! You can now log in.",
      redirect: "/signup-success", // Add this redirect field
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle login form submission
app.post("/api/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Store user information in session
      req.session.user = user; // This saves the user object in the session
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Serve the dashboard page after login
app.get("/dashboard", (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not logged in
  }
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out");
    }
    res.redirect("/login"); // Redirect to login after logout
  });
});

// Profile Routes

// Get Profile
app.get("/api/profile", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(req.session.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    name: user.name,
    joinedAt: user._id.getTimestamp(),
  });
});

// Update Profile
app.post("/api/update-profile", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, password } = req.body;
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

// Delete Profile
app.delete("/api/delete-profile", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await User.findByIdAndDelete(req.session.user._id);

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Profile deleted successfully" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting profile", error: error.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
