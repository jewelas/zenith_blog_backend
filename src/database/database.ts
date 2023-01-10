import mongoose from "mongoose";
export const connectDB = () => {
    try {
        mongoose.connect(process.env.MONGO_URL as string).then(() => {
            console.log('Connected to DB successfully...');
        });
    } catch (error) {
        console.log(error);
    }
};