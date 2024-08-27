import express from "express";
import { errorHandler } from "../utils/resHandler.js";
import { upload, confirm, listMeasures } from "../controllers/gemini.js";

const router = express.Router();

router.route("/").get(listMeasures);
router.route("/upload").post(upload);
router.route("/confirm/:id").patch(confirm);

router.route("*").all((req, res) => {
  errorHandler({
    req,
    res,
    code: 400,
    error: new Error("Invalid route"),
  });
});

export { router };
