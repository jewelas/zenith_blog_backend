import express, { Request, Response } from 'express';
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextFunction } from "express";
import { registerSchema, generateToken, options, loginSchema } from "../utils/utils";
import Admin from '../models/AdminModel'
import emailVerificationView from '../sendMail/email-verification'
import mailer from "../sendMail/email"
import crypto from 'crypto';
import { createSendToken } from '../middleware/auth';

const fromUser = process.env.FROM as string
const jwtsecret = process.env.JWT_SECRET as string

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, confirm_password } = req.body

        const { error } = registerSchema.validate(req.body, options)
        if (error) {
            res.status(400).json({
                Error: error.details[0].message
            })
        }

        const usedEmail = await Admin.findOne({ email });
        if (usedEmail) {
            res.status(409).json({
                Error: 'Email already exist'
            })
            return
        }
        const passwordHash = await bcrypt.hash(password, 8);

        const newAdmin = new Admin({
            name,
            email,
            password: passwordHash
        })

        const admin = await newAdmin.save();
        const { _id } = admin;
        const token = jwt.sign({ _id }, jwtsecret, { expiresIn: "30mins" })
        const html = emailVerificationView(token)

        //send email
        await mailer.sendEmail(fromUser, admin.email as string, 'Please verify your email!', html)

        res.status(201).json({
            Success: 'Registration Successful! kindly check your email to verify',
            admin
        })

    } catch (err) {
        throw new Error('Internal server error')
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const { error } = loginSchema.validate(req.body)
        if (error) {
            return next(res.status(400).json({
                Error: error.details[0].message
            }))
        }

        const admin = await Admin.findOne({ email }).select('+password') as unknown as { [key: string]: string }
        console.log(admin)


        const { _id } = admin

        const token = generateToken({ _id, email })


        const validAdmin = await bcrypt.compare(password, admin.password)

        if (!admin || !validAdmin) {
            return next(res.status(400).json({
                Error: "Incorrect email or password"
            }))
        } else {
            res.status(200).json({
                Success: "Successfully logged in",
                token,
                admin
            })
        }

    } catch (err) {
        throw new Error('Internal server Error')
    }
}

export const verifyAdmin = async (req: Request, res: Response) => {
    try {
        const { secretToken } = req.params
        const decode = jwt.verify(secretToken, jwtsecret) as JwtPayload
        const admin = await Admin.findOne({ email: decode.email })
        console.log(admin)
        if (!admin) {
            res.status(400).json({
                Error: "Error  Admin not found!!"
            })
            return
        }
        const { _id, email } = await admin.save();
        const token = generateToken({ _id, email })
        res.status(200)
            .json({
                Success: "Successful thank you! Now you can login",
                token
            })
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server error"
        })
    }
}



export const forgotPassword =
    async (req: Request, res: Response, next: NextFunction) => {
        // 1) Get user based on email
        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin) {
            return next(
                res.status(404).json({
                    Error: 'There is no user with this email address'
                })
            );
        }
        const resetToken = admin.createPasswordResetToken();
        await admin.save({ validateBeforeSave: false });

        // 3) Send it back as email to user
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/admins/resetPassword/${resetToken}`;

        const message = `Forgot your password? Submit a PATCH request with a your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this message!`;

        try {
            await mailer.sendEmail(
                fromUser,
                admin.email,
                'Your password reset token (valid for 10 mins)',
                message,
            );
            // 
            res.status(200).json({
                status: 'success',
                message: 'Token sent to email',
            });
        } catch (err) {
            admin.passwordResetToken = undefined;
            admin.passwordResetExpires = undefined;
            await admin.save({ validateBeforeSave: false });

            return next(
                res.status(500).json({
                    Error: 'There was an error sending the email. Try again later!'
                })

            );
        }

    }
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    console.log('hashed', hashedToken)
    const admin = await Admin.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    //2) If token has not expired, and there is user, set the new password.
    if (!admin) {
        return next(
            res.status(400).json({
                Error: 'Token is invalid or has expired'
            })
        );
    }
    admin.password = await bcrypt.hash(req.body.password, 8);
    // admin.passwordConfirm = req.body.passwordConfirm;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();

    // 3) Update chandedPasswordAt property for the user in the user Model

    // 4) Log the user in send JWT.
    createSendToken(admin, 200, res);
}



function html(fromUser: string, arg1: string, arg2: string, html: any) {
    throw new Error('Function not implemented.');
}
