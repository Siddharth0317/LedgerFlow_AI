/**
 * Centralized error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  console.error('⚠️  Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({
      success: false,
      message,
      code: 'RESOURCE_NOT_FOUND',
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A record with this ${field} already exists.`;
    return res.status(400).json({
      success: false,
      message,
      code: 'DUPLICATE_KEY_ERROR',
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({
      success: false,
      message,
      code: 'VALIDATION_ERROR',
    });
  }

  // Default server error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    code: error.code || 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Route Not Found middleware
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found - ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
};

export default { errorHandler, notFound };
