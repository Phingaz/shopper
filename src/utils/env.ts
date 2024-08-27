const envValues = {
  geminiKey: process.env.GEMINI_API_KEY,
  minioAccessKey: process.env.MINIO_ROOT_USER,
  minioSecretKey: process.env.MINIO_ROOT_PASSWORD,
  minioApiEndpoint: process.env.MINIO_ENDPOINT,
  minioApiPort: parseInt(process.env.MINIO_PORT),
};

export default envValues;
