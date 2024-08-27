import fs from "fs";
import path from "path";
import { uploadPath } from "../app.js";
import minioClient from "./minio.js";

export const saveBase64Image = ({
  base64,
  filename,
}: {
  base64: string;
  filename: string;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(base64, "base64");
    const filePath = path.join(uploadPath, filename);

    console.log("Saving file to: ", filePath);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(filePath);
      }
    });
  });
};

const deleteLocalFile = ({ filePath }: { filePath: string }) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete file ${filePath}: ${err.message}`);
    } else {
      console.log(`File ${filePath} deleted.`);
    }
  });
};

export const handleUploadAndDelete = async ({
  bucketName,
  fileName,
  localImage,
  type,
}: {
  bucketName: string;
  fileName: string;
  localImage: string;
  type: string;
}) => {
  try {
    await minioClient
      .fPutObject(bucketName, fileName, localImage, {
        "Content-Type": `image/${type}`,
        "Content-Disposition": "inline",
      })
      .then(async() => {
        console.log("Uploaded to Minio");
        deleteLocalFile({ filePath: localImage });
      });
  } catch (error) {
    deleteLocalFile({ filePath: localImage });
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};
