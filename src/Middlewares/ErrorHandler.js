const ErrorHandler = (error, req, res, next) => {
  res.status(error.status || 500).json(error.message);
};

export default ErrorHandler;
