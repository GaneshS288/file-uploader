import { Router } from "express";

const loginRouter = new Router();

loginRouter.get("/login", (req, res) => {
  res.render("login");
});

export default loginRouter;
