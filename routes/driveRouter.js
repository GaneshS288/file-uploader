import { Router } from "express";
import { upload } from "../middleware/multerConfig.js";
import fs from "fs/promises";
import prismaClient from "../db/prismaClient.js";
import {
  createFile,
  getAllUserFiles,
  getUserFileByName,
  getUserFolders,
} from "../db/queries.js";
const driveRouter = new Router();

driveRouter.get("/", async (req, res) => {
  const parentFolderId = req.query.parentFolderId
    ? req.query.parentFolderId
    : null;
  const files = await getAllUserFiles(req.user);
  const folders = await getUserFolders(req.user.id, parentFolderId);

  res.render("drive", { files, folders });
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
  const parentFolderId = req.query.parenFolderId
    ? req.query.parenFolderId
    : null;

  res.render("createFolderForm", { parentFolderId });
});

driveRouter.post("/createFolder", async (req, res) => {
  const newFolderName = req.body.folderName;
  const parentFolderId = req.query.parenFolderId
    ? req.query.parenFolderId
    : null;
  const folderExists = await prismaClient.folders.findFirst({
    where: {
      name: newFolderName,
      owner_id: req.user.id,
      parent_folder_id: parentFolderId,
    },
  });

  if (folderExists) {
    res.send("createFolderForm", {
      parentFolderId,
      error: `This folder ${newFolderName} already exists in current directory`,
    });
  } else {
    const parentStoragePath = parentFolderId
      ? await prismaClient.folders.findFirst({
          where: {
            id: parentFolderId,
          },
        })
      : `storage/${req.user.name}/`;
    const createdFolder = await prismaClient.folders.create({
      data: {
        name: newFolderName,
        parent_folder_id: parentFolderId,
        size: 0,
        storage_path: parentStoragePath + newFolderName,
        owner_id: req.user.id,
      },
    });

    await fs.mkdir(parentStoragePath + newFolderName)
    console.log(createdFolder);

    res.redirect("/myDrive");
  }
});

export default driveRouter;
