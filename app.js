import "dotenv/config";
import express from "express";
import path from "node:path"
import signupRouter from "./routes/signupRouter.js";
import loginRouter from "./routes/loginRouter.js";

const app = express();

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));

app.use(signupRouter, loginRouter);

app.get("/", (req, res) => res.send("Hello there obi wan"));

app.listen(8080, () => console.log("Server listening at port 8080"));
