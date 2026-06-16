export const errorHandler = (err, req, res, next) => {
  console.error('// Operational Pipeline Intercept Exception:', err.stack);

  const status = err.statusCode || 500;
  const message = err.message || 'An unhandled exception collapsed the execution routine.';
  
  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      code: err.code || 'INTERNAL_SERVER_ERROR'
    }
  });
};