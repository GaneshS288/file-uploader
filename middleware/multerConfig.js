import multer from "multer";
import fs from "node:fs/promises";
import fsSync from "fs";
import { getUserFileByName, getUserFolderById } from "../db/queries.js";

const storage = multer.diskStorage({
  destination: async (req, file, done) => {
    const parentFolderId = req.body.folderId ? req.body.folderId : null;

    if (!fsSync.existsSync("./storage")) {
      try {
        await fs.mkdir("./storage/");
      } catch (err) {
        console.log(err);
      }
    }
    if (!fsSync.existsSync(`./storage/${req.user.name}`)) {
      try {
        await fs.mkdir(`./storage/${req.user.name}`);
      } catch (error) {
        console.log(error);
      }
    }

    if(parentFolderId) {
      const parentFolder = await getUserFolderById(req.user.id, parentFolderId);
      done(null, parentFolder.storage_path)
    }
    else {
      done(null, `./storage/${req.user.name}`);
    }  
  },
  filename: async (req, file, done) => {
    done(null, file.originalname);
  },
});

async function fileFilter(req, file, done) {
  const parentFolderId = req.body.folderId ? req.body.folderId : null;

  try {
    const fileExists = await getUserFileByName(req.user.id, file.originalname, parentFolderId);
    if (fileExists) {
      console.log(`skipped file ${file.originalname}`);
      req.body.skippedFiles
        ? req.body.skippedFiles.push(file)
        : (req.body.skippedFiles = [file]);
      done(null, false);
    } else done(null, true);
  } catch (error) {
    done(error);
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5}, //5MB
  fileFilter: fileFilter,
});

export { upload };
