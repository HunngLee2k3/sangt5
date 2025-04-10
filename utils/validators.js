// utils/validators.js
let { body, validationResult } = require('express-validator');
let constants = require('./constants');
let utils = require('util');
const { ERROR_EMAIL, ERROR_ROLE } = require('./constants');
const { CreateErrorRes } = require('./responseHandler');

let options = {
    password: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }
};

module.exports = {
    validate: function (req, res, next) {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            CreateErrorRes(res, errors.array(), 400);
        } else {
            next();
        }
    },
    validatorSignIn: [ // Validator mới cho đăng nhập
        body("username")
            .isAlphanumeric()
            .withMessage(constants.ERROR_USERNAME),
        body("password")
            .isStrongPassword(options.password)
            .withMessage(utils.format(
                constants.ERROR_PASSWORD,
                options.password.minLength,
                options.password.minLowercase,
                options.password.minUppercase,
                options.password.minNumbers,
                options.password.minSymbols
            ))
    ],
    validatorLogin: [ // Giữ nguyên cho các trường hợp khác
        body("username")
            .isAlphanumeric()
            .withMessage(constants.ERROR_USERNAME),
        body("password")
            .isStrongPassword(options.password)
            .withMessage(utils.format(
                constants.ERROR_PASSWORD,
                options.password.minLength,
                options.password.minLowercase,
                options.password.minUppercase,
                options.password.minNumbers,
                options.password.minSymbols
            )),
        body("email")
            .isEmail()
            .withMessage("email phai co dang xxx@domain")
    ],
    validatorForgotPassword: [
        body("email")
            .isEmail()
            .withMessage(ERROR_EMAIL)
    ],
    validatorChangePassword: [
        body("password")
            .isStrongPassword(options.password)
            .withMessage(utils.format(
                constants.ERROR_PASSWORD,
                options.password.minLength,
                options.password.minLowercase,
                options.password.minUppercase,
                options.password.minNumbers,
                options.password.minSymbols
            ))
    ],
    validatorCreateUser: [
        body("username")
            .isAlphanumeric()
            .withMessage(constants.ERROR_USERNAME)
            .isLength({ min: 3 })
            .withMessage("Tên người dùng phải có ít nhất 3 ký tự"),
        body("password")
            .isStrongPassword(options.password)
            .withMessage(utils.format(
                constants.ERROR_PASSWORD,
                options.password.minLength,
                options.password.minLowercase,
                options.password.minUppercase,
                options.password.minNumbers,
                options.password.minSymbols
            )),
        body("email")
            .isEmail()
            .withMessage(ERROR_EMAIL),
        body("role")
            .optional()
            .isIn(['admin', 'user'])
            .withMessage(ERROR_ROLE)
    ]
};