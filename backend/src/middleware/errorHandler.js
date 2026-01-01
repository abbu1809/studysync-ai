/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Firebase errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
    statusCode = 401;
    message = getFirebaseAuthErrorMessage(err.code);
    code = err.code;
  }

  // Firestore errors (code can be number like 9 for index errors)
  if (err.code === 9 || err.code === 'permission-denied') {
    statusCode = 500;
    message = err.details || 'Database query error';
    code = 'FIRESTORE_ERROR';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    code = 'VALIDATION_ERROR';
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = getMulterErrorMessage(err.code);
    code = err.code;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Get user-friendly Firebase auth error messages
 */
function getFirebaseAuthErrorMessage(code) {
  const messages = {
    'auth/email-already-exists': 'Email already in use',
    'auth/email-already-in-use': 'Email already in use',
    'auth/invalid-email': 'Invalid email address',
    'auth/invalid-password': 'Password must be at least 6 characters',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Incorrect password',
    'auth/weak-password': 'Password is too weak',
    'auth/too-many-requests': 'Too many attempts, please try again later',
    'auth/id-token-expired': 'Session expired, please login again',
    'auth/invalid-id-token': 'Invalid authentication token'
  };

  return messages[code] || 'Authentication error';
}

/**
 * Get user-friendly Multer error messages
 */
function getMulterErrorMessage(code) {
  const messages = {
    'LIMIT_FILE_SIZE': 'File is too large',
    'LIMIT_FILE_COUNT': 'Too many files',
    'LIMIT_UNEXPECTED_FILE': 'Unexpected file field'
  };

  return messages[code] || 'File upload error';
}

module.exports = errorHandler;
