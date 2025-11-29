import Joi from "joi";

const loginSchema = Joi.object({
    username : Joi.string()
        .required()
        .messages({
            "string.empty": "Username or email is required."
    }),
    password : Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required."
    }),
});

const registerSchema = Joi.object({
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
    

const profileSchema = Joi.object({
    name : Joi.string().optional().min(4)
        .messages({
            "string.empty": "Fullname is required.",
            "string.min": "Fullname must be at least 4 characters long."
    }),
    username : Joi.string().optional().min(4)
        .messages({
            "string.empty": "Username is required.",
            "string.min": "Username must be at least 4 characters long."
    }),
});

const changePasswordSchema = Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().required()
        .min(8)
        .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .messages({
            "string.min": "Password must be at least 8 characters long.",
            "string.pattern.base": "Password must be at least 8 characters long, contain at least 1 uppercase letter, and 1 special character."
        }),
    confirm_password: Joi.string().valid(Joi.ref("new_password")).required()
        .messages({
            "any.only": "Passwords do not match."
        })
});

const refreshTokenSchema = Joi.object({
    refresh_token : Joi.string()
        .required()
        .messages({
            "string.empty": "Refresh token is required."
    }),
})

const resetPasswordSchema = Joi.object({
    new_password: Joi.string().required()
        .min(8)
        .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .messages({
            "string.min": "Password must be at least 8 characters long.",
            "string.pattern.base": "Password must be at least 8 characters long, contain at least 1 uppercase letter, and 1 special character."
        }),
    confirm_password: Joi.string().valid(Joi.ref("new_password")).required()
        .messages({
            "any.only": "Passwords do not match."
        }),
    token: Joi.string().required()
        .messages({
            "string.base": `token user should be a type of string`,
            "string.empty": `token user cannot be an empty field`,
            "any.required": `token user is a required field`
        })
})

const emailResetPasswordSchema = Joi.object({
    email : Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Email must be a valid email address."
        }),
});


export { loginSchema, registerSchema, profileSchema, changePasswordSchema, refreshTokenSchema, resetPasswordSchema, emailResetPasswordSchema };