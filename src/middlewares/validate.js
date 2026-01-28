export const validate = (schema) => (req, res, next) => {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false,
  };

  const validations = [];

  if (schema.body) {
    validations.push(schema.body.validateAsync(req.body, options));
  }
  if (schema.params) {
    validations.push(schema.params.validateAsync(req.params, options));
  }
  if (schema.query) {
    validations.push(schema.query.validateAsync(req.query, options));
  }

  Promise.all(validations)
    .then(() => next())
    .catch((err) => {
      res.status(400).json({
        message: "Validation error",
        details: err.details?.map((d) => d.message) || err.message,
      });
    });
};
