import { Router } from "express";
import passport from "../auth/passport_config.js";
import { createUser } from "../auth/createUser.js";
import { createSignupValidation } from "../middleware/validation.js";

const authRouter = new Router();

authRouter.get("/signup", (req, res) => {
  res.render("signup", { errorMsg: null });
});

authRouter.post("/signup", createSignupValidation(), createUser);

authRouter.get("/login", (req, res) => {
  res.render("login");
});

authRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  })
);

authRouter.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      res.send("something happened during logout");
    } else {
      res.redirect("/");
    }
  });
});
export default authRouter;
