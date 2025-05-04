import { Router } from "express";
import { upload } from "../middleware/multerConfig.js";
import fs from "fs/promises";
import fsSync from "fs";
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
  let currentFolderId, Folder, folderStoragePath, parentFolderId;
  if (!req.query.folderId) {
    currentFolderId = null;
    Folder = null;
    folderStoragePath = null;
    parentFolderId = null;
  } else {
    currentFolderId = req.query.folderId;
    Folder = await getUserFolderById(req.user.id, currentFolderId);
    folderStoragePath = Folder.storage_path;
    parentFolderId = Folder.parent_folder_id ? Folder.parent_folder_id : "root";
  }

  const files = await getUserFiles(req.user.id, currentFolderId);
  const folders = await getUserFolders(req.user.id, currentFolderId);

  res.render("drive", {
    files,
    folders,
    folderId: currentFolderId,
    path: folderStoragePath,
    parentFolderId,
  });
});

//Routes for uploading files

driveRouter.get("/upload", (req, res) => {
  const currentFolderId = req.query.folderId ? req.query.folderId : null;

  res.render("uploadForm", { folderId: currentFolderId });
});

driveRouter.post(
  "/upload",
  upload.array("uploaded-files", 5),
  async (req, res) => {
    const currentFolderId = req.body.folderId ? req.body.folderId : null;
    console.log(req.body);

    for (let i = 0; i < req.files.length; i++) {
      const currentFile = await fs.readFile(req.files[i].path);
      const { data, error } = await supabaseClient.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .upload(req.files[i].path, currentFile, {
          contentType: req.files[i].mimetype,
        });

      await createFile(req.user, req.files[i], currentFolderId);
      await fs.rm(req.files[i].path);
    }
    res.send("file recieved");
  }
);

//routes for creating folders

driveRouter.get("/createFolder", (req, res) => {
  const currentFolderId = req.query.folderId ? req.query.folderId : null;

  res.render("createFolderForm", { folderId: currentFolderId });
});

driveRouter.post("/createFolder", async (req, res) => {
  const newFolderName = req.body.folderName;
  const currentFolderId = req.body.folderId ? req.body.folderId : null;
  const folderExists = await getUserFolderByName(
    req.user.id,
    newFolderName,
    currentFolderId
  );

  if (folderExists) {
    res.send("createFolderForm", {
      currentFolderId,
      error: `This folder ${newFolderName} already exists in current directory`,
    });
  } else {
    const parentStoragePath = currentFolderId
      ? (await getUserFolderById(req.user.id, currentFolderId)).storage_path
      : `storage/${req.user.name}`;

    const newFolderStoragePath = parentStoragePath + "/" + newFolderName;

    const createdFolder = await createUserFolder(
      req.user.id,
      newFolderName,
      newFolderStoragePath,
      currentFolderId
    );

    fsSync.existsSync(parentStoragePath)
      ? null
      : await fs.mkdir(parentStoragePath);
    await fs.mkdir(newFolderStoragePath);

    res.redirect("/myDrive");
  }
});

//routes for deleting files

driveRouter.get("/delete/file", async (req, res) => {
  const currentFolderId = req.query.folderId ? req.query.folderId : null;
  const fileId = req.query.fileId;

  if (!fileId) {
    res.send("file id not sent");
    return;
  }

  try {
    const deletedFile = await deleteUserFileById(
      req.user.id,
      fileId,
      currentFolderId
    );

    const { data, error } = await supabaseClient.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
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

    const filePaths = await getAllFilePathsInAFolder(
      deletedFolder.storage_path
    );
    await supabaseClient.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .remove(filePaths);
    res.send(`folder name - ${deletedFolder.name}, deleted`);
  } catch (err) {
    console.log(err);
  }
});

export default driveRouter;
