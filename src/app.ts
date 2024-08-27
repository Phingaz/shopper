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

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

export const uploadPath = path.join(_dirname, "..", "public", "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

app.use(cors());
app.use(express.urlencoded({ extended: false, limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));
app.use(express.static("public"));
app.use(expectJsonBody);

app.use("/api/v1/health", logger, health);
app.use("/api/v1/gemini", logger, gemini);

app.get("/", (req, res) => {
  successHandler({ message: "Server is live", req, res, data: null });
});

app.all("*", (req: Req, res: Res) =>
  errorHandler({
    req,
    res,
    code: 400,
    error: new Error("Invalid route"),
  })
);

const port = process.env.PORT || 3001;

const start = async () => {
  try {
    const mongo = mongoose.connect(process.env.MONGO_URL);
    const minio = getBucket();

    await Promise.all([mongo, minio]);
    console.log("Connected to database and storage.");
    app.listen(port, () => console.log("App started on port " + port));
  } catch (error) {
    console.error(error);
  }
};

start();
