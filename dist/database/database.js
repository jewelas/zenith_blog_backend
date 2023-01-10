"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => {
    try {
        mongoose_1.default.connect(process.env.MONGO_URL).then(() => {
            console.log('Connected to DB successfully...');
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.connectDB = connectDB;
