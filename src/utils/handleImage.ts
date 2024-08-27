import fs from "fs";
import path from "path";
import { uploadPath } from "../app.js";
import minioClient from "./minio.js";

interface SaveBase64ImageParams {
  base64: string;
  filename: string;
}

interface DeleteLocalFileParams {
  filePath: string;
}

interface HandleUploadAndDeleteParams {
  bucketName: string;
  fileName: string;
  localImage: string;
  type: string;
}

export const saveBase64Image = ({
  base64,
  filename,
}: SaveBase64ImageParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(base64, "base64");
    const filePath = path.join(uploadPath, filename);

    console.log("Saving file to:", filePath);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error(`Failed to save file ${filename}: ${err.message}`);
        reject(err);
      } else {
        console.log(`File saved to ${filePath}`);
        resolve(filePath);
      }
    });
  });
};

const deleteLocalFile = ({ filePath }: DeleteLocalFileParams) => {
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
}: HandleUploadAndDeleteParams): Promise<void> => {
  try {
    await minioClient.fPutObject(bucketName, fileName, localImage, {
      "Content-Type": `image/${type}`,
      "Content-Disposition": "inline",
    });

    console.log("Uploaded to MinIO");
    deleteLocalFile({ filePath: localImage });
  } catch (error) {
    console.error(`Error in handleUploadAndDelete: ${error.message}`);
    deleteLocalFile({ filePath: localImage });
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};
