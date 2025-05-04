import { body } from "express-validator";
import { getUserByName } from "../db/queries.js";

function createSignupValidation() {
  const invalidUsernameMessage =
    "Username is invalid it must have at least 4 characters and must not contain any special characters (eg: $#@)";
  const invalidPasswordMessage =
    "password is invalid it must have at least 4 characters";
  return [
    body("username")
      .trim()
      .escape()
      .notEmpty()
      .isAlphanumeric()
      .isLength({ min: 4 })
      .withMessage(invalidUsernameMessage),
    body("username").custom(async (value) => {
      const userExists = await getUserByName(value);
      if (userExists) {
        throw Error(`The username '${value}' is already taken`);
      }
    }),
    body("password")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 4 })
      .withMessage(invalidPasswordMessage),
    body("password-confirm")
      .custom((value, { req }) => {
        return value === req.body["password"];
      })
      .withMessage("Password doesn't match!"),
  ];
}

function createFolderNameValidation() {
  return [body("folderName").notEmpty().isAlphanumeric().withMessage("folder name cannot contain any special characters(eg @$#), spaces or be empty")]
}

export { createSignupValidation, createFolderNameValidation };
