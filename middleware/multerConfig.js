import multer from "multer";
import fs from "node:fs/promises";
import fsSync from "fs";


const storage = multer.diskStorage({
  destination: async (req, file, done) => {
    if (!fsSync.existsSync("./storage")) {
      await fs.mkdir("./storage/");
    }
    if (!fsSync.existsSync(`./storage/${req.user.name}`)) {
      await fs.mkdir(`./storage/${req.user.name}`);
    }
    done(null, `./storage/${req.user.name}`);
  },
  filename: async (req, file, done) => {
    done(null, file.originalname);
  },
});



const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, //10MB
});


export { upload };