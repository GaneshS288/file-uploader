import supabaseClient from "./supabaseConfig.js";

async function getAllFilePathsInAFolder(folderPath, filePathArray = []) {
  const { data, error } = await supabaseClient.storage
    .from("file-storage")
    .list(folderPath);
  if (error) return error;

  for (let i = 0; i < data.length; i++) {
    if (data[i].metadata === null)
      await getAllFilePathsInAFolder(
        `${folderPath}/${data[i].name}`,
        filePathArray
      );
    else filePathArray.push(`${folderPath}/${data[i].name}`);
  }

  return filePathArray;
}

export { getAllFilePathsInAFolder };
