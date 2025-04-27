import prismaClient from "./prismaClient.js";

async function getAllUserFiles(user) {
  const files = await prismaClient.files.findMany({
    where: { owner_id: user.id },
  });

  return files;
}

async function getUserFolders(userId, parentFolderId) {
  const folders = await prismaClient.folders.findMany({where: {
    owner_id: userId,
    parent_folder_id: parentFolderId,
  }})

  return folders;
}

async function getUserFileByName(userId, filename) {
  const file = await prismaClient.files.findFirst({
    where: {
      owner_id: userId,
      parent_folder_id: null,
      name: {
        contains: filename,
        mode: "insensitive",
      },
    },
  });

  return file;
}

async function createFile(user, file) {
  await prismaClient.files.create({
    data: {
      name: file.filename,
      type: file.mimetype,
      size: file.size,
      owner_id: user.id,
      storage_path: file.path,
    },
  });
}

export { createFile, getAllUserFiles, getUserFileByName, getUserFolders };
