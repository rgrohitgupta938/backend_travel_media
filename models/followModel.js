const mongoose = require("mongoose");

const FollowSchema = new mongoose.Schema({
  followerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  followeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Follow", FollowSchema);
