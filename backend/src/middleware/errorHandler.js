export const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error.';

  if (status >= 500) {
    console.error(`[ExpenseFlow] ${req.method} ${req.path} → ${status}:`, err.stack || err.message);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
