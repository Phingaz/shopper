import { errorHandler } from "../utils/resHandler";

const logger = (req: Req, _: Res, next: NextFn) => {
  console.log(
    `Request for base: ${req.baseUrl}, original: ${
      req.originalUrl
    } and method: ${req.method} at ${new Date().toISOString()}`
  );
  next();
};

const expectJsonBody = (err: any, req: Req, res: Res, next: NextFn) => {
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    return errorHandler({
      req: req,
      res: res,
      code: 400,
      error: new Error("Invalid JSON body"),
    });
  }
  next(err);
};

export { logger, expectJsonBody };
