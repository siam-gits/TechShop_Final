indexedDB.js; // index.js
require("./server"); // This will start the server from server.js
// Serve the signup page (render signup.html when user visits /signup route)
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

// Handle the signup form submission (POST request)
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Create and save the new user (this is just an example, make sure to hash the password in a real app)
    const newUser = new User({ name: username, password });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});
