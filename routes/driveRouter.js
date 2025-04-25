import { Router } from "express";
import { upload } from "../middleware/multerConfig.js";
import {
  createFile,
  getAllUserFiles,
  getUserFileByName,
} from "../db/queries.js";
const driveRouter = new Router();

driveRouter.get("/", async (req, res) => {
  res.render("uploadForm");
});

driveRouter.post("/", upload.array("uploaded-files", 5), async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  for (let i = 0; i < req.files.length; i++) {
    await createFile(req.user, req.files[i]);
  }
  res.send("file recieved");
});

export default driveRouter;
