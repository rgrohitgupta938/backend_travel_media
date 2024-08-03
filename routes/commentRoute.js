const express = require("express");
const authMiddleWare = require("../middleware/authMiddleWare");
const router = express.Router();
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const User = require("../models/userModel");

console.log("initializing commentRoutes");

///Route For Posting comments
router.post("/postComment", authMiddleWare, async (req, res) => {
  const { postId, content } = req.body;
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "user not found" });
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post doesnot exist" });
    }
    const comment = new Comment({
      postId,
      content,
      userId: user,
    });
    const savedComment = await comment.save();

    post.comments.push(savedComment._id);
    await post.save();
    res.status(201).json(savedComment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error posting comment" });
  }
});

// Routes for getting Comments

router.get("/getComments", authMiddleWare, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching comments" });
  }
});

module.exports = router;
