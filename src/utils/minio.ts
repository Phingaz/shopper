import * as Minio from "minio";
import envValues from "./env.js";

const minioClient = new Minio.Client({
  useSSL: false,
  endPoint: envValues.minioApiEndpoint,
  port: envValues.minioApiPort,
  accessKey: envValues.minioAccessKey,
  secretKey: envValues.minioSecretKey,
});

export const bucketName = "shopper";

export const getBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
    } else {
      console.log("Bucket already exists.");
    }
  } catch (error) {
    throw new Error(`Failed to create bucket: ${error.message}`);
  }
};

export default minioClient;
