// Catches errors that happen in your controllers
const errorHandler = (err, req, res, next) => {
  // If the status is still 200 but an error occurred, force it to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Show the file line number of the error ONLY in development mode, hide in production for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };