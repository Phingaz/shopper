import express from "express";
import { errorHandler, successHandler } from "../utils/resHandler.js";

const router = express.Router();

router.route("/").get((req, res) => {
  successHandler({ message: "Healthcheck passed", data: null, req, res });
});

router.route("*").all((req, res) => {
  errorHandler({
    code: 400,
    req,
    res,
    error: new Error("Invalid route"),
  });
});

export { router };
