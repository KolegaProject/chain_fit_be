import Joi from "joi";

const gymSchema = Joi.object({
    id: Joi.number().min(1).required().messages({
        "number.empty": "Id gym is required",
        "number.min": "Id gym must be number at least 1",
        "number.base": "Id gym must be int"
    })
})

// const penjagaGymSchema = Joi.object({
//     userId: Joi.number().min(1).required().messages({
//         "number.empty": "User id is required",
//         "number.min": "User id gym must be number at least 1",
//         "string.base": "User id gym must be int"
//     }),
//     id: Joi.number().min(1).required().messages({
//         "number.empty": "Id gym is required",
//         "number.min": "Id gym must be number at least 1",
//         "string.base": "Id gym must be int"
//     })
// })

const getGymSchema = Joi.object({
    userId: Joi.number().min(1).required().messages({
        "number.empty": "User id is required",
        "number.min": "User id gym must be number at least 1",
        "string.base": "User id gym must be int"
    }),
})

const createGymSchema = Joi.object({
    namaGym: Joi.string().required().min(4)
        .messages({
            "string.empty": "Gym name is required.",
            "string.min": "Gym name must be at least 2 characters long.",
            "string.base": "Gym name can only contain letters and spaces."
    }),
    maxCapacity: Joi.string().min(1).required().messages({
            "string.empty": "Max capacity gym is required",
            "string.min": "Max capacity gym must be number at least 1",
            "string.base": "Max capacity gym must be int"
    }),
    address: Joi.string().min(4).max(150)
        .messages({
            "string.empty": "Address is required.",
            "string.min": "Address must be at least 4 characters long.",
            "string.base": "Username can only contain letters and spaces."
    }),
    // jamOperasional
});



export {
    gymSchema,
    getGymSchema,
    createGymSchema
}

