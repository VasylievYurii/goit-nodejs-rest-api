const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");
const HttpError = require("../helpers/HttpError.js");
const ctrlWrapper = require("../decorators/ctrlWrapper.js");

require("dotenv").config();
const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, `${email} in use`);
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });
  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: { email: user.email, subscription: user.subscription },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).send();
};

const updateSubscription = async (req, res) => {
  const optionsForSubscriptions = ["starter", "pro", "business"];
  const { subscription } = req.body;
  const { token } = req.user;

  if (!optionsForSubscriptions.includes(subscription)) {
    throw HttpError(
      400,
      "Invalid subscription type. You can chose `starter`, `pro` or `business`"
    );
  }
  const updatedUser = await User.findOneAndUpdate(
    { token },
    { subscription },
    { new: true }
  );

  if (!updatedUser) {
    throw HttpError(404, "User not found");
  }

  res.json({
    email: updatedUser.email,
    subscription: updatedUser.subscription,
  });
};

module.exports = {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
};
