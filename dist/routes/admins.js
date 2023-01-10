"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminAuthController_1 = require("../controllers/adminAuthController");
const router = express_1.default.Router();
/* GET users listing. */
router.post('/register', adminAuthController_1.register);
router.post('/login', adminAuthController_1.login);
router.get('/verify/:secretToken', adminAuthController_1.verifyAdmin);
router.post('/forgotPassword', adminAuthController_1.forgotPassword);
router.patch('/resetPassword/:token', adminAuthController_1.resetPassword);
exports.default = router;
