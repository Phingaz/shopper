import { errorHandler, successHandler } from "../utils/resHandler.js";

const listMeasures = async (req: Req, res: Res) => {
  try {
    successHandler({
      message: "Measures listed successfully",
      req,
      res,
      data: null,
    });
  } catch (error) {
    errorHandler({ code: 400, error, req, res });
  }
};

const upload = async (req: Req, res: Res) => {
  try {
    successHandler({
      message: "Upload",
      req,
      res,
      data: null,
    });
  } catch (error) {
    errorHandler({ code: 400, error, req, res });
  }
};

const confirm = async (req: Req, res: Res) => {
  try {
    successHandler({
      message: "Confirm",
      req,
      res,
      data: null,
    });
  } catch (error) {
    errorHandler({ code: 400, error, req, res });
  }
};

export { listMeasures, upload, confirm };
