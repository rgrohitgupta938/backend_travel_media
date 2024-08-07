const express = require("express");
const authMiddleWare = require("../middleware/authMiddleWare");
const User = require("../models/userModel");
const router = express.Router();

console.log("follow routes");

// Follow a user
router.post("/follow", authMiddleWare, async (req, res) => {
  const { userIdToFollow } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userToFollow = await User.findById(userIdToFollow);
    if (!userToFollow)
      return res.status(404).json({ message: "User to follow not found" });

    // Check if already following
    if (user.following.includes(userIdToFollow)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    user.following.push(userIdToFollow);
    userToFollow.followers.push(req.user);

    await user.save();
    await userToFollow.save();

    res.status(200).json({ message: "Successfully followed the user" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});
// Unfollow a user
router.post("/unfollow", authMiddleWare, async (req, res) => {
  const { userIdToUnfollow } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userToUnfollow = await User.findById(userIdToUnfollow);
    if (!userToUnfollow)
      return res.status(404).json({ message: "User to unfollow not found" });

    // Check if not following
    if (!user.following.includes(userIdToUnfollow)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    user.following = user.following.filter(
      (id) => id.toString() !== userIdToUnfollow
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user
    );

    await user.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "Successfully unfollowed the user" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
