import "dotenv/config";
import cors from "cors";
import express from "express";
import logger from "./middlewares/logger.js";
import { router as gemini } from "./routes/gemini.js";
import { router as health } from "./routes/healthcheck.js";
import { errorHandler, successHandler } from "./utils/resHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(express.static("public"));

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
    app.listen(port, () => console.log("App started on port " + port));
  } catch (error) {
    console.log(error);
  }
};

start();
