import Joi from "joi";

const createPaketGymSchema = Joi.object({
    name: Joi.string().required().min(4)
        .messages({
            "string.empty": "paket name is required.",
            "string.min": "Paket name must be at least 2 characters long.",
            "string.base": "Paket name can only contain letters and spaces."
    }),
    price: Joi.number().min(0).required().messages({
            "number.empty": "Price is required",
            "number.min": "Price must be number at least 1",
            "number.base": "Price must be int"
    }),
    durationDays: Joi.number().min(1).required().messages({
            "number.empty": "DurationDays is required",
            "number.min": "DurationDays must be number at least 1",
            "number.base": "DurationDays must be int"
    }),
});

const updatePaketGymSchema = Joi.object({
    name: Joi.string().optional().min(4)
        .messages({
            "string.min": "Paket name must be at least 2 characters long.",
            "string.base": "Paket name can only contain letters and spaces."
    }),
    price: Joi.number().min(0).optional().messages({
            "number.min": "Price must be number at least 1",
            "number.base": "Price must be int"
    }),
    durationDays: Joi.number().min(1).optional().messages({
            "number.min": "DurationDays must be number at least 1",
            "number.base": "DurationDays must be int"
    }),
});

const paketGymSchema = Joi.object({
    paketId: Joi.number().min(1).required().messages({
            "number.empty": "Paket id is required",
            "number.min": "Paket id must be number at least 1",
            "number.base": "Paket id must be int"
    }),
    id: Joi.number().min(1).required().messages({
        "number.empty": "Id gym is required",
        "number.min": "Id gym must be number at least 1",
        "number.base": "Id gym must be int"
    })
});

export {
    createPaketGymSchema,
    updatePaketGymSchema,
    paketGymSchema,
}