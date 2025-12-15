import Joi from "joi";

const updatePenjagaSchema = Joi.object({
    name: Joi.string().optional().min(4)
        .messages({
            "string.empty": "Fullname is required.",
            "string.min": "Fullname must be at least 2 characters long.",
            "string.base": "Fullname can only contain letters and spaces."
    }),
    email : Joi.string()
        .email()
        .optional()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Email must be a valid email address."
        }),
});


const createPenjagaSchema = Joi.object({
    name: Joi.string().required().min(4)
    .messages({
        "string.empty": "Fullname is required.",
        "string.min": "Fullname must be at least 2 characters long.",
        "string.base": "Fullname can only contain letters and spaces."
    }),
    username: Joi.string().required().min(4)
    .messages({
        "string.empty": "Username is required.",
        "string.min": "Username must be at least 4 characters long.",
        "string.base": "Username can only contain letters and spaces."
    }),
    email : Joi.string()
    .email()
    .required()
    .messages({
            "string.empty": "Email is required.",
            "string.email": "Email must be a valid email address."
        }),
    password : Joi.string()
        .required()
        .min(8)
        .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .messages({
            "string.empty": "Password is required.",
            "string.min": "Password must be at least 8 characters long.",
            "string.pattern.base": "Password must be at least 8 characters long, contain at least 1 uppercase letter, and 1 special character."
        })
});
    
const getPenjagaSchema = Joi.object({
    id: Joi.number().min(1).required().messages({
        "number.empty": "Id gym is required",
        "number.min": "Id gym must be number at least 1",
        "number.base": "Id gym must be int"
    }),
    userId: Joi.number().min(1).required().messages({
        "number.empty": "User id is required",
        "number.min": "User id gym must be number at least 1",
        "string.base": "User id gym must be int"
    }),
});



export {
    updatePenjagaSchema,
    createPenjagaSchema,
    getPenjagaSchema
}
    