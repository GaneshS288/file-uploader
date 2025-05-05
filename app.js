import "dotenv/config";
import express from "express";
import expressSession from "express-session";
import flash from "connect-flash"
import passport from "./auth/passport_config.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prismaClient from "./db/prismaClient.js";
import path from "node:path";
import authRouter from "./routes/authRouter.js";
import driveRouter from "./routes/driveRouter.js";

const app = express();

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prismaClient, {
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: false,
      checkPeriod: 2 * 60 * 1000, //120 seconds
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //1 day
    },
  })
);
app.use(flash());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/myDrive", driveRouter);

app.get("/", (req, res) => {
  const authenticated = req.isAuthenticated();
  console.log(req.user);

  res.render("home", { authenticated });
});

app.use("/*splat", (req, res) => {
  const error = {};
  error.code = error.code || 404;
  error.message = error.message || "This resource does not exist";

  res.render("errorPage", { error });
});

app.use((err, req, res, next) => {
  const error = err;
  error.code = error.code || 404;
  error.message = error.message || "This resource does not exist";

  res.status(error.code).render("errorPage", { error });
});

app.listen(8080, () => console.log("Server listening at port 8080"));
