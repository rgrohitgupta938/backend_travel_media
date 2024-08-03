const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/userImages");
  },
  filename: function (req, file, cb) {
    console.log(req.body, "hi");
    cb(
      null,

      req.body.username +
        "-" +
        new Date().toISOString().replace(/:/g, "-") +
        "-" +
        file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter: fileFilter,
});

console.log("Initializing userRoutes");


router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("Handling GET request for user with ID:", userId);
  try {
    const user = await User.findById(userId);
    if (user) {
      res.json(user);
      console.log("User retrieved:", user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Error retrieving user" });
  }
});

router.post("/register", upload.single("userImage"), async (req, res) => {
  console.log("Handling POST request to create user");
  console.log("Request body:", req.body, "Uploaded file:", req.file);
  const userImagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

  try {
    const find = await User.findOne({ email: req.body.email });
    if (find) {
      return res.status(400).json({ message: "User already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(req.body.password, salt);
    const user = new User({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      passwordHash: passwordHash,
      userImage: userImagePath,
    });
    console.log("User object to be saved:", user);
    const newUser = await user.save();
    console.log("Newly saved user:", newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(400).json({ message: "Error saving user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, userExist.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: userExist._id }, JWT_SECRET, {
      expiresIn: "6h",
    });
    res.status(200).json({ token, userId: userExist._id });
  } catch (error) {
    res.status(500).json({ message: "Error loging user" });
  }
});

router.put("/:userId", upload.single("userImage"), async (req, res) => {
  const { userId } = req.params;
  console.log("Handling PUT request to update user with ID:", userId);
  const userImagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;
  try {
    const user = await User.findById(id);
    const imagePath = user.userImage;
    if (user) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { ...req.body, userImage: userImagePath },
        {
          new: true,
          runValidators: true,
        }
      );
      res.json(updatedUser);
      console.log("Updated user:", updatedUser);
      fs.unlink(path.resolve(imagePath), (err) => {
        if (err) {
          console.log("Error Updating Image", err);
        } else {
          console.log("Image Updated");
        }
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ message: "Error updating user" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Handling DELETE request for user with ID:", id);
  try {
    const user = await User.findById(id);
    const imagePath = user.userImage;
    if (user) {
      const deletedUser = await User.findByIdAndDelete(id);
      res.send("User deleted successfully");
      console.log("Deleted user:", deletedUser);
      fs.unlink(path.resolve(imagePath), (err) => {
        if (err) {
          console.log("Error Deleting Image", err);
        } else {
          console.log("Image Deleted", imagePath);
        }
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(400).json({ message: "Error deleting user" });
  }
});

module.exports = router;
