"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.options = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.registerSchema = joi_1.default.object().keys({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().trim().lowercase().required(),
    password: joi_1.default.string().min(6).required(),
    confirm_password: joi_1.default.any().equal(joi_1.default.ref('password')).required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match' })
});
exports.loginSchema = joi_1.default.object().keys({
    email: joi_1.default.string().trim().lowercase().required(),
    password: joi_1.default.string().min(6).required(),
});
exports.options = {
    abortEarly: false,
    errors: {
        wrap: {
            label: ''
        }
    }
};
const generateToken = (user) => {
    const pass = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign(user, pass, { expiresIn: '30d' });
};
exports.generateToken = generateToken;
