import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import prismaClient from "../db/prismaClient.js";

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        const user = await prismaClient.users.findUnique({
          where: {
            name: username,
          },
        });

        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        const match = await bcrypt.compare(password, user.passwordHash);

        if (!match) {
          done(null, false, { message: "incorrect password" });
        } else done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prismaClient.users.findUniqueOrThrow({
      where: { id: id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
