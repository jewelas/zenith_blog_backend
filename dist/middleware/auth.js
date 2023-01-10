"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSendToken = exports.signToken = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AdminModel_1 = __importDefault(require("../models/AdminModel"));
const secret = process.env.JWT_SECRET;
function auth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authorization = req.headers.authorization;
            if (!authorization) {
                return res.status(401).json({
                    Error: "Kindly sign in as an Admin"
                });
            }
            const token = authorization.slice(7, authorization.length);
            let verified = jsonwebtoken_1.default.verify(token, secret);
            if (!verified) {
                return res.status(401).json({
                    Error: 'Admin not verified you cannot access this route'
                });
            }
            const { _id } = verified;
            const admin = (yield AdminModel_1.default.findById(_id));
            if (!admin) {
                return res.status(401).json({
                    Error: "Admin not verified, kindly check your email to verify"
                });
            }
            req.admin = verified;
            next();
        }
        catch (err) {
            res.status(401).json({
                Error: 'Admin not logged in'
            });
        }
    });
}
exports.auth = auth;
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
exports.signToken = signToken;
const createSendToken = (admin, statusCode, res) => {
    const token = (0, exports.signToken)(admin._id);
    const date = process.env.JWT_COOKIE_EXPIRES_IN *
        24 *
        60 *
        60 *
        1000;
    const cookieOptions = {
        expires: new Date(Date.now() + date),
        secure: false,
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt', token, cookieOptions);
    //set password to undefined to hide it.
    admin.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            admin,
        },
    });
};
exports.createSendToken = createSendToken;
