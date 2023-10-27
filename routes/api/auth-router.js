const express = require("express");
const authController = require("../../controllers/auth-controller.js");
const isEmptyBody = require("../../middlewares/isEmptyBody.js");
const authenticate = require("../../middlewares/authenticate.js");
const validateBody = require("../../decorators/validateBody.js");
const {
  userSignUpSchema,
  userSignInSchema,
  userEmailSchema,
} = require("../../models/User.js");
const upload = require("../../middlewares/upload.js");
const resizeAvatar = require("../../middlewares/resizeAvatar.js");

const userSignUpValidate = validateBody(userSignUpSchema);
const userSignInValidate = validateBody(userSignInSchema);
const userEmailValidate = validateBody(userEmailSchema);

const authRouter = express.Router();

authRouter.post(
  "/register",
  upload.single("avatarURL"),
  resizeAvatar,
  isEmptyBody,
  userSignUpValidate,
  authController.signup
);

authRouter.get("/verify/:verificationToken", authController.verify);
authRouter.post("/verify", userEmailValidate, authController.resendVerifyEmail);

authRouter.post(
  "/login",
  isEmptyBody,
  userSignInValidate,
  authController.signin
);

authRouter.post("/logout", authenticate, authController.logout);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.patch("/", authenticate, authController.updateSubscription);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatarURL"),
  resizeAvatar,
  authController.updateAvatar
);

module.exports = authRouter;
