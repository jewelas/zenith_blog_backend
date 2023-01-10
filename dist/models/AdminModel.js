"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const adminSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
});
adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        let changedTimestamp = this.passwordChangedAt.getTime() / 1000;
        changedTimestamp = parseInt(changedTimestamp.toString(), 10);
        console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    // falsle means not changed
    return false;
};
adminSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = (Date.now() + 10 * 60 * 1000);
    return resetToken;
};
const Admin = mongoose_1.default.model('Admin', adminSchema);
exports.default = Admin;
