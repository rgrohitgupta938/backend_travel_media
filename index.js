const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const likeRoute = require("./routes/likeRoute");
const unLikeRoute = require("./routes/unLikeRoute");

dotenv.config();
const app = express();
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-Response-Time"
  );
  next();
});
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
