import express from "express";
import { errorHandler } from "../utils/resHandler.js";
import { upload, confirm, listMeasures } from "../controllers/gemini.js";

const router = express.Router();

router.route("/:id/list").get(listMeasures);
router.route("/upload").post(upload);
router.route("/confirm").patch(confirm);

router.route("*").all((req, res) => {
  errorHandler({
    req,
    res,
    code: 404,
    error: new Error("Invalid route"),
  });
});

export { router };
