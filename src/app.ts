import "dotenv/config";
import fs from "fs";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { getBucket } from "./utils/minio.js";
import { router as gemini } from "./routes/gemini.js";
import { router as health } from "./routes/healthcheck.js";
import { logger, expectJsonBody } from "./middlewares/helpers.js";
import { errorHandler, successHandler } from "./utils/resHandler.js";

const app = express();

// Define constants
const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
export const uploadPath = path.join(_dirname, "..", "public", "uploads");
const port = process.env.PORT || 3001;

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Middleware setup
app.use(cors());
app.use(express.urlencoded({ extended: false, limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));
app.use(express.static("public"));
app.use(expectJsonBody);

// Routes setup
app.use("/api/v1/health", logger, health);
app.use("/api/v1/gemini", logger, gemini);

// Root route
app.get("/", (req: Req, res: Res) => {
  successHandler({ message: "Server is live", req, res, data: null });
});

// Handle invalid routes
app.all("*", (req: Req, res: Res) =>
  errorHandler({
    req,
    res,
    code: 404,
    error: new Error("Invalid route"),
  })
);

// Start the server
const start = async () => {
  try {
    await Promise.all([mongoose.connect(process.env.MONGO_URL), getBucket()]);
    console.log("Connected to database and storage.");
    app.listen(port, () => console.log(`App started on port ${port}`));
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start();
