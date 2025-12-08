import Joi from "joi";

const attendanceSchema = Joi.object({
    gymId: Joi.number().min(1).required().messages({
        "number.empty": "Gym id gym is required",
        "number.min": "Gym id must be number at least 1",
        "number.base": "Gym id must be int"
    })
})


const checkInSchema = Joi.object({
    token: Joi.string().required()
        .messages({
            "string.base": `token user should be a type of string`,
            "string.empty": `token user cannot be an empty field`,
            "any.required": `token user is a required field`
    })
})



export {
    attendanceSchema,
    checkInSchema,
}

