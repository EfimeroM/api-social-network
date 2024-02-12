const { body } = require("express-validator")

const validateRegisterInput = [
  body("name")
    .notEmpty().withMessage("name is required")
    .isLength({ min: 3, max: undefined }).withMessage("name must be a minimum of 3 characters")
    .isAlpha("es-ES").withMessage("name should only contain letters"),
  body("surname")
    .optional()
    .isLength({ min: 3, max: undefined }).withMessage("surname must be a minimum of 3 characters")
    .isAlpha("es-ES").withMessage("surname should only contain letters"),
  body("nick")
    .notEmpty().withMessage("nick is required")
    .isLength({ min: 2, max: undefined }).withMessage("nick must be a minimum of 2 characters"),
  body("bio")
    .optional()
    .isLength({ min: undefined, max: 255 }).withMessage("bio must be a maximum of 255 characters"),
  body("email")
    .notEmpty().withMessage("email is required")
    .isEmail().withMessage("email must be in the correct format"),
  body("password")
    .notEmpty().withMessage("password is required")
]

const validateUpdateInput = [
  body("name")
    .optional()
    .isLength({ min: 3, max: undefined }).withMessage("name must be a minimum of 3 characters")
    .isAlpha("es-ES").withMessage("name should only contain letters"),
  body("surname")
    .optional()
    .isLength({ min: 3, max: undefined }).withMessage("surname must be a minimum of 3 characters")
    .isAlpha("es-ES").withMessage("surname should only contain letters"),
  body("nick")
    .notEmpty().withMessage("nick is required")
    .isLength({ min: 2, max: undefined }).withMessage("nick must be a minimum of 2 characters"),
  body("bio")
    .optional()
    .isLength({ min: undefined, max: 255 }).withMessage("bio must be a maximum of 255 characters"),
  body("email")
    .notEmpty().withMessage("email is required")
    .isEmail().withMessage("email must be in the correct format"),
  body("password")
    .optional()
]

module.exports = {
  validateRegisterInput,
  validateUpdateInput
}