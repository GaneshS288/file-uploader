import { Router } from "express";

const signupRouter = new Router();

signupRouter.get("/signup", (req, res) => {
  res.render("signup");
});

export default signupRouter;