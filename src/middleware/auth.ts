import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken';
import Admin from '../models/AdminModel';
import { adminAuth } from '../utils/interface';
const secret = process.env.JWT_SECRET as string

export async function auth(req: any, res: Response, next: NextFunction):Promise<unknown> {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({
                Error:"Kindly sign in as an Admin"
            })
        }
        const token = authorization.slice(7, authorization.length);
        let verified = jwt.verify(token, secret)
        if (!verified) {
            return res.status(401).json({
                Error:'Admin not verified you cannot access this route'
            })
        }
        const { _id } = verified as { [key: string]: string };
        const admin = (await Admin.findById(_id) )
        if (!admin) {
            return res.status(401).json({
                Error:"Admin not verified, kindly check your email to verify"
            })
        }
        req.admin = verified
        next()

    } catch (err) {
        res.status(401).json({
            Error:'Admin not logged in'
        })
     }
}

export const signToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

export const createSendToken = (admin: adminAuth, statusCode: number, res: Response) => {
    const token = signToken(admin!._id);

    const date =
        (process.env.JWT_COOKIE_EXPIRES_IN as unknown as number) *
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
    admin.password = undefined as any;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            admin,
        },
    });
};