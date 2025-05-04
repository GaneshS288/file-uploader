const fileInput = document.getElementById("file-input");
const errorContainer = document.querySelector(".error-container");
const acceptedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "text/plain",
  "video/mp4",
];
const unsupportedMimeTypeMsg = "Unsupported file format";
const fileTooBigError = "File is larger than 5MB";

function validateMimeType(file) {
  return acceptedMimeTypes.includes(file.type);
}

function validateSize(file, maxSize = 5120) {
  let sizeInKB = Number.parseInt(file.size / 1024);
  if (sizeInKB <= maxSize) {
    return true;
  } else {
    return false;
  }
}

fileInput.addEventListener("change", (event) => {
  errorContainer.innerHTML = "";

  fileInput.setCustomValidity("");
  const filesHeading = document.createElement("h2");
  filesHeading.textContent = "Files";
  errorContainer.append(filesHeading);
  const filesArray = Array.from(fileInput.files);

  filesArray.forEach((file) => {
    const isValid = validateMimeType(file) && validateSize(file);
    const fileElement = document.createElement("p");

    if (isValid) {
      fileInput.setCustomValidity("errors with files");
      fileElement.classList.add("file");
      fileElement.textContent = `${file.name}`;
    } else {
      const isMimeTypeValid = validateMimeType(file);
      const isSizeValid = validateSize(file);

      fileElement.classList.add("file", "error");
      fileElement.textContent = `${file.name} - ${isMimeTypeValid ? "" : unsupportedMimeTypeMsg} ${isSizeValid ? "" : fileTooBigError}`;
    }

    errorContainer.append(fileElement);
  });

  if(filesArray.length > 5) {
    const tooManyFilesErrorElement = document.createElement("p");
    tooManyFilesErrorElement.classList.add("file", "error");
    tooManyFilesErrorElement.textContent = "More than 5 files can't be uploaded at once please select less";
    errorContainer.append(tooManyFilesErrorElement);
}
});
