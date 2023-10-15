const express = require("express");
const authController = require("../../controllers/auth-controller.js");
const isEmptyBody = require("../../middlewares/isEmptyBody.js");
const authenticate = require("../../middlewares/authenticate.js");
const validateBody = require("../../decorators/validateBody.js");
const { userSignUpSchema, userSignInSchema } = require("../../models/User.js");

const userSignUpValidate = validateBody(userSignUpSchema);
const userSignInValidate = validateBody(userSignInSchema);

const authRouter = express.Router();

authRouter.post(
  "/register",
  isEmptyBody,
  userSignUpValidate,
  authController.signup
);

authRouter.post(
  "/login",
  isEmptyBody,
  userSignInValidate,
  authController.signin
);

authRouter.post("/logout", authenticate, authController.logout);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.patch("/", authenticate, authController.updateSubscription);

module.exports = authRouter;