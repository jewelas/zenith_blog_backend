import Joi from 'joi'
import jwt from 'jsonwebtoken'
export const registerSchema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().trim().lowercase().required(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.any().equal(Joi.ref('password')).required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match' })
})

export const loginSchema = Joi.object().keys({
    email: Joi.string().trim().lowercase().required(),
    password: Joi.string().min(6).required(),
})

export const options = {
    abortEarly: false,
    errors: {
        wrap: {
            label:''
        }
    }
}

export const generateToken = (user: { [key: string]: string }):unknown=> {
    const pass = process.env.JWT_SECRET as string
    return jwt.sign(user, pass, {expiresIn:'30d'})
}

