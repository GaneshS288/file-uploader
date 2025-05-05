import { Router } from "express";
import passport from "../auth/passport_config.js";
import { createUser } from "../auth/createUser.js";
import { createSignupValidation } from "../middleware/validation.js";

const authRouter = new Router();

authRouter.use((req, res, next) => {
  if (req.isAuthenticated() && req.originalUrl !== "/auth/logout") {
    res.redirect("/");
  } else {
    next();
  }
});

authRouter.get("/signup", (req, res) => {
  res.render("signup", { errorMsg: null });
});

authRouter.post("/signup", createSignupValidation(), createUser);

authRouter.get("/login", (req, res) => {
  let failureMessage = req.flash();
  //this is neccessary because calling req.flash once will eject the message
  failureMessage = failureMessage.error ? failureMessage.error[0] : null;
  res.render("login", {errorMsg: failureMessage});
});

authRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
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
