import "dotenv/config";
import express from "express";
import expressSession from "express-session";
import passport from "./auth/passport_config.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prismaClient from "./db/prismaClient.js";
import path from "node:path";
import signupRouter from "./routes/signupRouter.js";
import loginRouter from "./routes/loginRouter.js";

const app = express();

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prismaClient, {
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: false,
      checkPeriod: 2 * 60 * 1000 //120 seconds
    }),
  })
);
app.use(passport.session());

app.use("/auth", signupRouter, loginRouter);

app.get("/", (req, res) => res.send("Hello there obi wan"));

app.listen(8080, () => console.log("Server listening at port 8080"));
