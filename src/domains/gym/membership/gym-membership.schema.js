import Joi from "joi";

const createMebershipSchema = Joi.object({
    name: Joi.string().required().min(4)
        .messages({
            "string.empty": "name is required.",
            "string.min": "name must be at least 4 characters long.",
            "string.base": "name can only contain letters and spaces."
    }),
    email : Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Email must be a valid email address."
    }),
    paketId: Joi.number().min(1).required().messages({
            "number.empty": "Paket id is required",
            "number.min": "Paket id must be number at least 1",
            "number.base": "Paket id must be int"
    }),
});

const memberhipScehma = Joi.object({
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
})

const updateMembershipSchema = Joi.object({
    paketId: Joi.number().min(1).required().messages({
            "number.empty": "Paket id is required",
            "number.min": "Paket id must be number at least 1",
            "number.base": "Paket id must be int"
    }),
});

const deleteMembershipSchema = Joi.object({
    id: Joi.number().min(1).required().messages({
        "number.empty": "Id gym is required",
        "number.min": "Id gym must be number at least 1",
        "number.base": "Id gym must be int"
    }),
    membershipId: Joi.number().min(1).required().messages({
            "number.empty": "membership id is required",
            "number.min": "membership id must be number at least 1",
            "number.base": "membership id must be int"
    }),
});

const getMembershipSchema = Joi.object({
    id: Joi.number().min(1).required().messages({
        "number.empty": "Id gym is required",
        "number.min": "Id gym must be number at least 1",
        "number.base": "Id gym must be int"
    }),
    membershipId: Joi.number().min(1).required().messages({
            "number.empty": "Member id is required",
            "number.min": "Member id must be number at least 1",
            "number.base": "Member id must be int"
    }),
});

export {
    createMebershipSchema,
    updateMembershipSchema,
    deleteMembershipSchema,
    getMembershipSchema,
    memberhipScehma
}