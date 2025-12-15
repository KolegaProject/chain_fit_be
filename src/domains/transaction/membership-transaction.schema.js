import Joi from "joi";

const createSnapSchema = Joi.object({
    packageId: Joi.number().integer().required().min(1)
        .messages({
            "number.base": "Package ID must be a number.",
            "number.min": "Package ID must be at least 1.",
            "any.required": "Package ID is required."
    }),
    gymId : Joi.number()
        .required().min(1)
        .messages({
            "number.base": "Gym ID must be a number.",
            "number.min": "Gym ID must be at least 1.",
            "any.required": "Gym ID is required."
        }),
});

export {
    createSnapSchema,
}

