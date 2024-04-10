const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_CONNECT_URI;

const connect = mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check database connected or not
connect
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

// Create Schema
const Loginschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Collection Model
const UserModel = mongoose.model("User", Loginschema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// Register User
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password,
  };

  try {
    // Check if the username already exists in the database
    const existingUser = await UserModel.findOne({ name: data.name });

    if (existingUser) {
      res.send("User already exists. Please choose a different username.");
    } else {
      // Hash the password using bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      data.password = hashedPassword;
      const newUser = new UserModel(data);
      await newUser.save();
      console.log("New user registered:", newUser);
      res.render("login");
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("An error occurred during registration.");
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const check = await UserModel.findOne({ name: req.body.username });

    if (!check) {
      //   res.send("User name cannot found");/
      res.render("notf");
    } else {
      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        check.password
      );

      if (!isPasswordMatch) {
        res.send("Wrong Password");
      } else {
        res.render("successPage");
      }
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("An error occurred during login.");
  }
});

// Define Port for Application
const port = 5050;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
