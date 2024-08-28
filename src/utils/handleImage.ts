import fs from "fs";
import path from "path";
import { uploadPath } from "../app.js";
import envValues from "./env.js";

interface HandleImageParams {
  base64: string;
  fileName: string;
  delayMinutes?: number;
}

interface ScheduleDeleteParam {
  filePath: string;
  delayMinutes: number;
}

export const saveBase64Image = ({
  base64,
  fileName,
}: HandleImageParams): Promise<string> => {
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
  delayMinutes = 5,
}: HandleImageParams) => {
  if (!fileName) {
    throw new Error("No filename provided");
  }

  try {
    await saveBase64Image({ base64, fileName });
    const imgUrl = `${envValues.baseUrl}/uploads/${fileName}`;
    scheduleFileDeletion({
      filePath: path.join(uploadPath, fileName),
      delayMinutes,
    });
    return imgUrl;
  } catch (error) {
    console.error(`Failed to handle image: ${error.message}`);
    throw error;
  }
};

const scheduleFileDeletion = ({
  filePath,
  delayMinutes,
}: ScheduleDeleteParam) => {
  const delayMilliseconds = delayMinutes * 60 * 1000;
  console.log(`Scheduling deletion of ${filePath} in ${delayMinutes} minutes`);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(
        `File ${filePath} does not exist. Cannot schedule deletion.`
      );
      return;
    }

    setTimeout(() => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file ${filePath}: ${err.message}`);
        } else {
          console.log(
            `File ${filePath} deleted after ${delayMinutes} minutes.`
          );
        }
      });
    }, delayMilliseconds);
  });
};
