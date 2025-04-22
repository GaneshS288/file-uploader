import { Router } from "express";
import { createUser } from "../auth/createUser.js";

const signupRouter = new Router();

signupRouter.get("/signup", (req, res) => {
  res.render("signup");
});

signupRouter.post("/signup", createUser);

export default signupRouter;