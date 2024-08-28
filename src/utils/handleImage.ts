import fs from "fs";
import path from "path";
import { uploadPath } from "../app.js";
import envValues from "./env.js";

interface SaveBase64ImageParams {
  base64: string;
  fileName: string;
}

interface DeleteLocalFileParams {
  filePath: string;
}

export const saveBase64Image = ({
  base64,
  fileName,
}: SaveBase64ImageParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(base64, "base64");
    const filePath = path.join(uploadPath, fileName);

    console.log("Saving file to:", filePath);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error(`Failed to save file ${fileName}: ${err.message}`);
        reject(err);
      } else {
        console.log(`File saved to ${filePath}`);
        resolve(filePath);
      }
    });
  });
};

export const handleImage = async ({
  fileName,
  base64,
}: {
  fileName: string;
  base64: string;
}) => {
  return new Promise(async (resolve, reject) => {
    if (!fileName) {
      reject(new Error("No filename provided"));
    }

    await saveBase64Image({ base64, fileName });

    const imgUrl = `${envValues.baseUrl}/uploads/${fileName}`;
    resolve(imgUrl);
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
