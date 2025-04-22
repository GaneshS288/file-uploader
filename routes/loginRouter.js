import { Router } from "express";
import passport from "../auth/passport_config.js";

const loginRouter = new Router();

loginRouter.get("/login", (req, res) => {
  res.render("login");
});

loginRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);
export default loginRouter;
