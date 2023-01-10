"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const nodemailer_1 = __importDefault(require("nodemailer"));
const forMailUser = process.env.GMAIL_USER;
const forMailPass = process.env.GMAIL_PASS;
const fromUser = process.env.FROM;
const userSubject = process.env.SUBJECT;
const transport = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: forMailUser,
        pass: forMailPass
    },
    tls: {
        rejectUnauthorized: false
    }
});
module.exports = {
    sendEmail(from, to, subject, html) {
        return new Promise((resolve, reject) => {
            transport.sendMail({ from: fromUser, subject: userSubject, to, html }, (err, info) => {
                if (err)
                    reject(err);
                resolve(info);
            });
        });
    }
};
