import prismaClient from "../db/prismaClient.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";

async function createUser(req, res) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    try {
      const { username, password } = req.body;
      const hash = await bcrypt.hash(password, 10);

      await prismaClient.users.create({
        data: {
          name: username,
          passwordHash: hash,
        },
      });

      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.status(504).send("Something went wrong on our end");
    }
  } else {
    res.send("validation failed please submit proper username and password");
  }
}

export { createUser };
