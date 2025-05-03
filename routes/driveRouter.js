import { Router } from "express";
import { upload } from "../middleware/multerConfig.js";
import fs from "fs/promises";
import fsSync from "fs";
import prismaClient from "../db/prismaClient.js";
import supabaseClient from "../supabase/supabaseConfig.js";
import {
  createFile,
  getUserFiles,
  getUserFolders,
  getUserFolderByName,
  getUserFolderById,
  createUserFolder,
  deleteUserFileById,
  deleteUserFolderById,
} from "../db/queries.js";
import { getAllFilePathsInAFolder } from "../supabase/supabaseHelpers.js";

const driveRouter = new Router();

driveRouter.get("/", async (req, res) => {
  const parentFolderId = req.query.folderId ? req.query.folderId : null;
  const files = await getUserFiles(req.user.id, parentFolderId);
  const folders = await getUserFolders(req.user.id, parentFolderId);
  console.log(folders);

  res.render("drive", { files, folders, folderId: parentFolderId });
});

//Routes for uploading files

driveRouter.get("/upload", (req, res) => {
  const parentFolderId = req.query.folderId ? req.query.folderId : null;

  res.render("uploadForm", { folderId: parentFolderId });
});

driveRouter.post(
  "/upload",
  upload.array("uploaded-files", 5),
  async (req, res) => {
    const parentFolderId = req.body.folderId ? req.body.folderId : null;
    console.log(req.body);
    console.log(req.files);
    for (let i = 0; i < req.files.length; i++) {
      const currentFile = await fs.readFile(req.files[i].path);
      const { data, error } = await supabaseClient.storage
        .from("file-storage")
        .upload(req.files[i].path, currentFile);
      await createFile(req.user, req.files[i], parentFolderId);
    }
    res.send("file recieved");
  }
);

//routes for creating folders

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

//routes for deleting files

driveRouter.get("/delete/file", async (req, res) => {
  const parentFolderId = req.query.folderId ? req.query.folderId : null;
  const fileId = req.query.fileId;

  if (!fileId) {
    res.send("file id not sent");
    return;
  }

  try {
    const deletedFile = await deleteUserFileById(
      req.user.id,
      fileId,
      parentFolderId
    );
    await fs.rm(deletedFile.storage_path);
    const { data, error } = await supabaseClient.storage
      .from("file-storage")
      .remove([deletedFile.storage_path]);
    res.send(`file name - ${deletedFile.name}, deleted`);
  } catch (err) {
    console.log(err);
  }
});

//routes for deleting folders

driveRouter.get("/delete/folder", async (req, res) => {
  const parentFolderId = req.query.folderId ? req.query.folderId : null;
  const currentFolderId = req.query.currentFolderId;

  if (!currentFolderId) {
    res.send("folder id not sent");
    return;
  }

  try {
    const deletedFolder = await deleteUserFolderById(
      req.user.id,
      currentFolderId,
      parentFolderId
    );
    await fs.rm(deletedFolder.storage_path, { recursive: true });

    const filePaths = await getAllFilePathsInAFolder(deletedFolder.storage_path);
    await supabaseClient.storage.from("file-storage").remove(filePaths);
    res.send(`folder name - ${deletedFolder.name}, deleted`);
  } catch (err) {
    console.log(err);
  }
});

export default driveRouter;
