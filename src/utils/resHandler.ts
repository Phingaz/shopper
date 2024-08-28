const errorHandler = ({
  req,
  res,
  code,
  error,
  error_code,
}: {
  code: number;
  error: Error;
  error_code?: string;
  req: Req;
  res: Res;
}) => {
  console.log(
    `Error: status: ${code}, from base: ${req.baseUrl}, original: ${
      req.originalUrl
    }, message: ${error.message}, at ${new Date().toISOString()} and stack: ${
      error.stack
    }\n`
  );

  res.status(code).json({
    success: false,
    status_code: code,
    error_code: error_code || "GENERIC_ERROR",
    error_description: error.message,
  });
};

const successHandler = ({
  message,
  req,
  res,
  data,
}: {
  message?: string;
  req: Req;
  res: Res;
  data: any;
}) => {
  console.log(
    `Success: ${message}, from base: ${req.baseUrl}, original: ${
      req.originalUrl
    } at ${new Date().toISOString()}\n`
  );

  res.status(200).json({
    success: true,
    message: message || "Success",
    ...data,
  });
};

export { errorHandler, successHandler };
