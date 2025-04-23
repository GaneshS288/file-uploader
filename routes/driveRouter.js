import { Router } from "express";
import multer from "multer";
import fs from "node:fs/promises";
import fsSync from "fs";

const storage = multer.diskStorage({
  destination: async (req, file, done) => {
    console.log(req.body.parentID);
    console.log(file);
    if (!fsSync.existsSync("./storage")) {
      await fs.mkdir("./storage/");
    }
    done(null, "./storage");
  },
  filename: async (req, file, done) => {
    done(null, file.originalname);
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 1024 * 60 } });
const driveRouter = new Router();

driveRouter.get("/", (req, res) => {
  res.render("uploadForm");
});

driveRouter.post("/", upload.array("uploaded-files"), (req, res) => {
  res.send("file recieved");
});

export default driveRouter;
