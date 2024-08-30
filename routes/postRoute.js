const express = require("express");
const multer = require("multer");
const Post = require("../models/postModel");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const authMiddleWare = require("../middleware/authMiddleWare");
const User = require("../models/userModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/postImages");
  },
  filename: function (req, file, cb) {
    console.log("hi");
    cb(
      null,
      req.body.userId +
        "-" +
        new Date().toISOString().replace(/:/g, "-") +
        "-" +
        file.originalname
    );
  },
});
const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    const data = await Post.find();
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
});
router.get("/:id", authMiddleWare, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });
    const data = await Post.findById(id);
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
});

router.post(
  "/",
  authMiddleWare,
  upload.single("postImage"),
  async (req, res) => {
    console.log(req.body);
    const path = req.file ? req.file.path.replace(/\\/g, "/") : null;
    const newPost = new Post({
      userId: req.user, //updated req.body.userId to req.user from middleware auth req.user
      content: req.body.content,
      image: path,
    });
    try {
      const user = await User.findById(req.user);
      if (!user) return res.status(404).json({ message: "User not found" });
      const updatedPost = await newPost.save();
      console.log(updatedPost);
      res.status(201).json(updatedPost);
    } catch (error) {
      console.log(error, error.content, error._message, "post mesg");
      res.sendStatus(400).json({ message: error._message });
    }
  }
);

router.put(
  "/:id",
  authMiddleWare,
  upload.single("postImage"),
  async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const path = req.file ? req.file.path.replace(/\\/g, "/") : null;

    try {
      const user = await User.findById(req.user);
      if (!user) return res.status(404).json({ message: "User not found" });
      const post = await Post.findById(id);
      const imagePath = post.image;

      if (post) {
        const updatedPost = await Post.findByIdAndUpdate(
          id,
          { ...req.body, image: path, userId: req.user }, //updated req.body.userId to req.user from middleware auth req.user
          {
            runValidators: true,
            new: true,
          }
        );
        res.json(updatedPost);
        console.log(updatedPost);
        fs.unlink(path.resolve(imagePath), (err) => {
          if (err) {
            console.log("Error Deleting image", err);
          } else {
            console.log("Deleted Image", imagePath);
          }
        });
      } else {
        res.status(404).send("Post not Found");
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Erro updating post" });
    }
  }
);

router.delete("/:id", authMiddleWare, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });
    const post = await Post.findById(id);
    const imagePath = post.image;
    if (post) {
      await Post.findByIdAndDelete(id);
      res.send("Post deleted successfully");
      if (imagePath) {
        fs.unlink(path.resolve(imagePath), (err) => {
          if (err) {
            console.log("Errro Deleeting Image :", err);
          } else {
            console.log("Image Deleteing Succesfully:", imagePath);
          }
        });
      }
    } else {
      res.status(404).send("Post not Found");
    }
  } catch (error) {
    res.status(400).json({ message: "Error deleteing Post" });
  }
});

module.exports = router;
