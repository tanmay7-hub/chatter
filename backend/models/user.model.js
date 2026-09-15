import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    default: "Hey there! I am using Let's Chat.",
    trim: true,
  },
  lastMessage: {
    type: String,
    default: "",
  },
  lastSeen: {
    type: Date,
    default: null,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String,
    default:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
