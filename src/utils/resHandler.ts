const errorHandler = ({
  error,
  req,
  res,
  code,
}: {
  code: number;
  error: Error;
  req: Req;
  res: Res;
}) => {
  console.log(
    `Error: status: ${code}, from base: ${req.baseUrl}, original: ${
      req.originalUrl
    }, message: ${error.message}, at ${new Date().toISOString()} and stack: ${
      error.stack
    }`
  );

  res.status(code).json({
    success: false,
    error_code: code,
    error_description: error.message,
  });
};

const successHandler = ({
  message,
  req,
  res,
  data,
}: {
  message: string;
  req: Req;
  res: Res;
  data: any;
}) => {
  console.log(
    `Success: ${message}, from base: ${req.baseUrl}, original: ${
      req.originalUrl
    } at ${new Date().toISOString()}`
  );

  res.status(200).json({
    success: true,
    message,
    data,
  });
};

export { errorHandler, successHandler };
