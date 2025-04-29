import prismaClient from "./prismaClient.js";

async function getUserFiles(userId, parentFolderId) {
  const files = await prismaClient.files.findMany({
    where: { owner_id: userId, parent_folder_id: parentFolderId },
  });

  return files;
}

async function getUserFolders(userId, parentFolderId) {
  const folders = await prismaClient.folders.findMany({
    where: {
      owner_id: userId,
      parent_folder_id: parentFolderId,
    },
  });

  return folders;
}

async function getUserFolderByName(userId, folderName, parentFolderId) {
  const folder = await prismaClient.folders.findFirst({
    where: {
      name: folderName,
      owner_id: userId,
      parent_folder_id: parentFolderId,
    },
  });

  return folder;
}

async function getUserFolderById(userId, folderId) {
  const folder = await prismaClient.folders.findFirst({
    where: { id: folderId },
  });
  return folder;
}

async function createUserFolder(
  userId,
  newFolderName,
  storagePath,
  parentFolderId = null
) {
  const createdFolder = await prismaClient.folders.create({
    data: {
      name: newFolderName,
      parent_folder_id: parentFolderId,
      size: 0,
      storage_path: storagePath,
      owner_id: userId,
    },
  });

  return createdFolder;
}

async function getUserFileByName(userId, filename, parentFolderId) {
  const file = await prismaClient.files.findFirst({
    where: {
      owner_id: userId,
      parent_folder_id: parentFolderId,
      name: {
        contains: filename,
        mode: "insensitive",
      },
    },
  });

  return file;
}

async function createFile(user, file, parent_folder_id = null) {
  await prismaClient.files.create({
    data: {
      name: file.filename,
      type: file.mimetype,
      size: file.size,
      owner_id: user.id,
      parent_folder_id: parent_folder_id,
      storage_path: file.path,
    },
  });
}

export {
  createFile,
  createUserFolder,
  getUserFiles,
  getUserFileByName,
  getUserFolders,
  getUserFolderByName,
  getUserFolderById,
};
