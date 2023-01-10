import mongoose, { Schema } from "mongoose";
import crypto from 'crypto'
import { adminAuth } from "../utils/interface";

const adminSchema = new mongoose.Schema({

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
},

    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        },
    }
)
adminSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
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
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = (Date.now() + 10 * 60 * 1000) as unknown as Date;

    return resetToken;
};
const Admin = mongoose.model<adminAuth>('Admin', adminSchema);

export default Admin;