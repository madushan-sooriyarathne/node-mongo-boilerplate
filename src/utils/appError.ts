class AppError extends Error {
  statusCode: number;
  status: string;
  isOpError: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    status: string = "failed",
    isOpError: boolean = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.isOpError = isOpError;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
