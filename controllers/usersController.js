const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@desc Get all users
//@route GET /users
//@access Private

// The lean option tells Mongoose to skip hydrating the result documents. This makes queries faster and less memory intensive, but the result documents are plain old JavaScript objects (POJOs), not Mongoose documents.

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found!!" });
  }
  res.json(users);
});

//@desc Create new user
//@route POST /users
//@access Private

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  //hash password
  const hashedPwd = await bcrypt.hash(password, 10); //salt rounds

  const userObject = { username, password: hashedPwd, roles };

  //create and store new user
  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New User ${username} created.` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

//@desc Update a user
//@route PATCH /users
//@access Private

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, roles, active } = req.body;

  //confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found!!" });
  }

  //check for duplicates

  const duplicate = await User.findOne({ username }).lean().exec();

  //Allow updates to the original user

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    //if someone sends password then update it
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated.` });
});

//@desc Delete a user
//@route DELETE /users
//@access Private

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID Required!!" });
  }

  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found!!" });
  }
  const result = await user.deleteOne();
  const reply = `Username ${result.username} with ID ${result._id} is deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
