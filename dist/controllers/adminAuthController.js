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
exports.resetPassword = exports.forgotPassword = exports.verifyAdmin = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils/utils");
const AdminModel_1 = __importDefault(require("../models/AdminModel"));
const email_verification_1 = __importDefault(require("../sendMail/email-verification"));
const email_1 = __importDefault(require("../sendMail/email"));
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../middleware/auth");
const fromUser = process.env.FROM;
const jwtsecret = process.env.JWT_SECRET;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, confirm_password } = req.body;
        const { error } = utils_1.registerSchema.validate(req.body, utils_1.options);
        if (error) {
            res.status(400).json({
                Error: error.details[0].message
            });
        }
        const usedEmail = yield AdminModel_1.default.findOne({ email });
        if (usedEmail) {
            res.status(409).json({
                Error: 'Email already exist'
            });
            return;
        }
        const passwordHash = yield bcryptjs_1.default.hash(password, 8);
        const newAdmin = new AdminModel_1.default({
            name,
            email,
            password: passwordHash
        });
        const admin = yield newAdmin.save();
        const { _id } = admin;
        const token = jsonwebtoken_1.default.sign({ _id }, jwtsecret, { expiresIn: "30mins" });
        const html = (0, email_verification_1.default)(token);
        //send email
        yield email_1.default.sendEmail(fromUser, admin.email, 'Please verify your email!', html);
        res.status(201).json({
            Success: 'Registration Successful! kindly check your email to verify',
            admin
        });
    }
    catch (err) {
        throw new Error('Internal server error');
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { error } = utils_1.loginSchema.validate(req.body);
        if (error) {
            return next(res.status(400).json({
                Error: error.details[0].message
            }));
        }
        const admin = yield AdminModel_1.default.findOne({ email }).select('+password');
        console.log(admin);
        const { _id } = admin;
        const token = (0, utils_1.generateToken)({ _id, email });
        const validAdmin = yield bcryptjs_1.default.compare(password, admin.password);
        if (!admin || !validAdmin) {
            return next(res.status(400).json({
                Error: "Incorrect email or password"
            }));
        }
        else {
            res.status(200).json({
                Success: "Successfully logged in",
                token,
                admin
            });
        }
    }
    catch (err) {
        throw new Error('Internal server Error');
    }
});
exports.login = login;
const verifyAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { secretToken } = req.params;
        const decode = jsonwebtoken_1.default.verify(secretToken, jwtsecret);
        const admin = yield AdminModel_1.default.findOne({ email: decode.email });
        console.log(admin);
        if (!admin) {
            res.status(400).json({
                Error: "Error  Admin not found!!"
            });
            return;
        }
        const { _id, email } = yield admin.save();
        const token = (0, utils_1.generateToken)({ _id, email });
        res.status(200)
            .json({
            Success: "Successful thank you! Now you can login",
            token
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server error"
        });
    }
});
exports.verifyAdmin = verifyAdmin;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on email
    const admin = yield AdminModel_1.default.findOne({ email: req.body.email });
    if (!admin) {
        return next(res.status(404).json({
            Error: 'There is no user with this email address'
        }));
    }
    const resetToken = admin.createPasswordResetToken();
    yield admin.save({ validateBeforeSave: false });
    // 3) Send it back as email to user
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/admins/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with a your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this message!`;
    try {
        yield email_1.default.sendEmail(fromUser, admin.email, 'Your password reset token (valid for 10 mins)', message);
        // 
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });
    }
    catch (err) {
        admin.passwordResetToken = undefined;
        admin.passwordResetExpires = undefined;
        yield admin.save({ validateBeforeSave: false });
        return next(res.status(500).json({
            Error: 'There was an error sending the email. Try again later!'
        }));
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on the token
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    console.log('hashed', hashedToken);
    const admin = yield AdminModel_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    //2) If token has not expired, and there is user, set the new password.
    if (!admin) {
        return next(res.status(400).json({
            Error: 'Token is invalid or has expired'
        }));
    }
    admin.password = yield bcryptjs_1.default.hash(req.body.password, 8);
    // admin.passwordConfirm = req.body.passwordConfirm;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    yield admin.save();
    // 3) Update chandedPasswordAt property for the user in the user Model
    // 4) Log the user in send JWT.
    (0, auth_1.createSendToken)(admin, 200, res);
});
exports.resetPassword = resetPassword;
function html(fromUser, arg1, arg2, html) {
    throw new Error('Function not implemented.');
}
