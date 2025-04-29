import { Router } from "express";
import { upload } from "../middleware/multerConfig.js";
import fs from "fs/promises";
import fsSync from "fs";
import prismaClient from "../db/prismaClient.js";
import {
  createFile,
  getUserFiles,
  getUserFileByName,
  getUserFolders,
  getUserFolderByName,
  getUserFolderById,
  createUserFolder,
} from "../db/queries.js";

const driveRouter = new Router();

driveRouter.get("/", async (req, res) => {
  const parentFolderId = req.query.folderId ? req.query.folderId : null;
  const files = await getUserFiles(req.user.id, parentFolderId);
  const folders = await getUserFolders(req.user.id, parentFolderId);
  console.log(folders);

  res.render("drive", { files, folders, folderId: parentFolderId });
});

driveRouter.get("/upload", (req, res) => {
  res.render("uploadForm");
});

driveRouter.post(
  "/upload",
  upload.array("uploaded-files", 5),
  async (req, res) => {
    console.log(req.body);
    console.log(req.files);
    for (let i = 0; i < req.files.length; i++) {
      await createFile(req.user, req.files[i]);
    }
    res.send("file recieved");
  }
);

driveRouter.get("/createFolder", (req, res) => {
  const parentFolderId = req.query.folderId ? req.query.folderId : null;

  res.render("createFolderForm", { folderId: parentFolderId });
});

driveRouter.post("/createFolder", async (req, res) => {
  const newFolderName = req.body.folderName;
  const parentFolderId = req.body.folderId ? req.body.folderId : null;
  const folderExists = await getUserFolderByName(
    req.user.id,
    newFolderName,
    parentFolderId
  );

  if (folderExists) {
    res.send("createFolderForm", {
      parentFolderId,
      error: `This folder ${newFolderName} already exists in current directory`,
    });
  } else {
    const parentStoragePath = parentFolderId
      ? (await getUserFolderById(req.user.id, parentFolderId)).storage_path
      : `storage/${req.user.name}`;

    const newFolderStoragePath = parentStoragePath + "/" + newFolderName;

    const createdFolder = await createUserFolder(
      req.user.id,
      newFolderName,
      newFolderStoragePath,
      parentFolderId
    );

    fsSync.existsSync(parentStoragePath)
      ? null
      : await fs.mkdir(parentStoragePath);
    await fs.mkdir(newFolderStoragePath);
    console.log(createdFolder);

    res.redirect("/myDrive");
  }
});

export default driveRouter;
