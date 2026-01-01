const Joi = require('joi');

/**
 * Middleware factory for validating request data
 * @param {object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, query, params)
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
}

// Common validation schemas

const schemas = {
  // User preferences
  userPreferences: Joi.object({
    studyHoursPerDay: Joi.number().min(1).max(24),
    studyTimePreference: Joi.string().valid('morning', 'afternoon', 'evening', 'night'),
    breakDuration: Joi.number().min(5).max(60),
    sessionDuration: Joi.number().min(15).max(180),
    notificationsEnabled: Joi.boolean(),
    theme: Joi.string().valid('light', 'dark')
  }),

  // Document upload
  documentMetadata: Joi.object({
    title: Joi.string().required().min(1).max(200),
    type: Joi.string().valid('syllabus', 'assignment', 'notice', 'notes').required()
  }),

  // Assignment creation
  assignment: Joi.object({
    title: Joi.string().required().min(1).max(200),
    subject: Joi.string().required(),
    description: Joi.string().allow(''),
    topics: Joi.array().items(Joi.string()),
    dueDate: Joi.date().iso().required(),
    estimatedHours: Joi.number().min(0.5).max(100),
    difficulty: Joi.string().valid('easy', 'medium', 'hard')
  }),

  // Study plan generation
  studyPlanRequest: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    includeAssignments: Joi.array().items(Joi.string()),
    excludeDays: Joi.array().items(Joi.number().min(0).max(6))
  }),

  // Chat message
  chatMessage: Joi.object({
    message: Joi.string().required().min(1).max(2000),
    conversationId: Joi.string().allow(null, '').optional()
  }),

  // Viva generation
  vivaRequest: Joi.object({
    topic: Joi.string().required(),
    documentId: Joi.string().allow('', null).optional(),
    count: Joi.number().min(1).max(20).default(5),
    includeMCQ: Joi.boolean().default(true)
  })
};

module.exports = {
  validate,
  schemas
};
