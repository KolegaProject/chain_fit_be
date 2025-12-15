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
    maxCapacity: Joi.number().min(1).required().messages({
            "number.empty": "Max capacity gym is required",
            "number.min": "Max capacity gym must be number at least 1",
            "number.base": "Max capacity gym must be int"
    }),
    address: Joi.string().min(4).max(150)
        .messages({
            "string.empty": "Address is required.",
            "string.min": "Address must be at least 4 characters long.",
            "string.base": "Username can only contain letters and spaces."
    }),
    jamOperasional: Joi.string().min(4).max(150).required()
        .messages({
            "string.empty": "Jam Operational is required.",
            "string.min": "jam Operational be at least 4 characters long.",
    }),
    lat: Joi.string()
    .trim()
    .required()
    .pattern(/^-?\d+(\.\d+)?$/)
    .messages({
      "string.base": "Latitude must be a string.",
      "string.empty": "Latitude is required.",
      "any.required": "Latitude is required.",
      "string.pattern.base": "Latitude must be a valid numeric string (e.g. -6.2).",
    }),

  long: Joi.string()
    .trim()
    .required()
    .pattern(/^-?\d+(\.\d+)?$/)
    .messages({
      "string.base": "Longitude must be a string.",
      "string.empty": "Longitude is required.",
      "any.required": "Longitude is required.",
      "string.pattern.base": "Longitude must be a valid numeric string (e.g. 106.816666).",
    }),
    facility : Joi.string().min(3)
        .required()
        .messages({
            "string.empty": "Facility is required",
            "string.base": "Facility label must be a string.",
            "string.min": "Facility label must be string",
    })
});


const updateGymSchema = Joi.object({
    name: Joi.string().optional().min(4)
        .messages({
            "string.min": "Gym name must be at least 2 characters long.",
            "string.base": "Gym name can only contain letters and spaces."
    }),
    maxCp: Joi.number().min(1).optional().messages({
            "number.min": "Max capacity gym must be number at least 1",
            "number.base": "Max capacity gym must be int"
    }),
    address: Joi.string().min(4).max(150).optional()
        .messages({
            "string.min": "Address must be at least 4 characters long.",
            "string.base": "Username can only contain letters and spaces."
    }),
    jamOperasional: Joi.string().min(4).max(150).optional()
        .messages({
            "string.empty": "Jam Operational is required.",
            "string.min": "jam Operational be at least 4 characters long.",
    }),
    lat: Joi.string()
    .trim()
    .optional()
    .pattern(/^-?\d+(\.\d+)?$/)
    .messages({
      "string.base": "Latitude must be a string.",
      "string.pattern.base": "Latitude must be a valid numeric string (e.g. -6.2).",
    }),

  long: Joi.string()
    .trim()
    .optional()
    .pattern(/^-?\d+(\.\d+)?$/)
    .messages({
      "string.base": "Longitude must be a string.",
      "string.pattern.base": "Longitude must be a valid numeric string (e.g. 106.816666).",
    }),
    fac: Joi.string().min(3)
        .optional()
        .messages({
            "string.base": "Facility label must be a string.",
            "string.min": "Facility label must be string",
    })
})

const queryGymSchema = Joi.object({
    search: Joi.string().optional().messages({
        "string.base": "Search must be a string."
    })
});



export {
    gymSchema,
    getGymSchema,
    createGymSchema,
    queryGymSchema,
    updateGymSchema,
}

