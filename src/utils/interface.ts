import mongoose from "mongoose";

export interface adminAuth extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
    passWordChangedAt: Date;
    passwordResetToken: string | undefined;
    passwordResetExpires: Date | undefined;
    changedPasswordAfter(JWTTimestamp: Date): boolean;
    createPasswordResetToken(): string;
}
export interface blogSchem extends mongoose.Document {
    title: string;
    image: string;
    description: string
    content: string[]
    slug: string
    createdBy: string

}
export interface contentSchema extends mongoose.Document {
    headers: string;
    description: string;
    createdBy: string
}
export interface CustomReq extends Request {
    admin: adminAuth & { _id: mongoose.Types.ObjectId; };
    requestTime?: string
}