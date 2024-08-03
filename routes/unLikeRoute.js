const express = require("express");
const authMiddleWare = require("../middleware/authMiddleWare");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const router = express.Router();

console.log("unlike routes");

// unLike a post
router.post("/unLike", authMiddleWare, async (req, res) => {
  const { postId } = req.body;
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if user has already liked the post
    if (post.unLikes.includes(req.user)) {
      return res.status(400).json({ message: "User already liked this post" });
    }

    post.unLikes.push(req.user);
    const updatedPost = await post.save();

    console.log(updatedPost);
    res.status(200).json(updatedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unlikes for a post
router.get("/getUnLikes", authMiddleWare, async (req, res) => {
  const { postId } = req.body;
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    console.log(post.likes);
    res.status(200).json(post.unLikes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
