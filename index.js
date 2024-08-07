const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const likeRoute = require("./routes/likeRoute");
const unLikeRoute = require("./routes/unLikeRoute");
const followUnfollowROute = require("./routes/followUnfollowRoute");
const cors = require("cors");
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*", // Allow your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/upload/userImages", express.static("upload/userImages"));
app.use("/upload/postImages", express.static("upload/postImages"));
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Succeess"))
  .catch((err) => console.log(err));

app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/comment", commentRoute);
app.use("/likes", likeRoute);
app.use("/unLikes", unLikeRoute);
app.use("/fn", followUnfollowROute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
