const logger = (req: Req, _: Res, next: NextFn) => {
  console.log(
    `Request for base: ${req.baseUrl}, original: ${
      req.originalUrl
    } and method: ${req.method} at ${new Date().toISOString()}`
  );
  next();
};

export default logger;
