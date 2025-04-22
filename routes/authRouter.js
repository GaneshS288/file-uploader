import { Router } from "express";
import passport from "../auth/passport_config.js";
import { createUser } from "../auth/createUser.js";

const authRouter = new Router();

authRouter.get("/signup", (req, res) => {
  res.render("signup");
});

authRouter.post("/signup", createUser);

authRouter.get("/login", (req, res) => {
  res.render("login");
});

authRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);
export default authRouter;
