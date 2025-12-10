import Joi from "joi";

const equipmentSchema = Joi.object({
    equipId: Joi.number().min(1).required().messages({
        "number.empty": "Id equipment is required",
        "number.min": "Id equipment must be number at least 1",
        "number.base": "Id equipment must be int"
    }),
});

// name, videoURL,
const createEquipmentSchema = Joi.object({
    name: Joi.string().required().min(3).max(50).messages({
        "string.empty": "Equipment name is required.",
        "string.min": "Equipment name must be at least 3 characters long.",
        "string.max": "Equipment name must be at most 50 characters long.",
        "string.base": "Equipment name must be a string."
    }),
    videoURL: Joi.string().uri().optional().messages({
        "string.uri": "Video URL must be a valid URI.",
        "string.base": "Video URL must be a string."
    })
})

const updateEquipmentSchema = Joi.object({
    name: Joi.string().optional().min(3).max(50).messages({
        "string.empty": "Equipment name cannot be empty.",
        "string.min": "Equipment name must be at least 3 characters long.",
        "string.max": "Equipment name must be at most 50 characters long.",
        "string.base": "Equipment name must be a string."
    }),
    healthStatus: Joi.string().valid('BAIK', 'BUTUH_PERAWATAN', 'RUSAK').optional().messages({
        "any.only": "Health status must be one of 'BAIK', 'BUTUH_PERAWATAN', or 'RUSAK'.",
        "string.base": "Health status must be a string."
    }),
    videoURL: Joi.string().uri().optional().messages({
        "string.uri": "Video URL must be a valid URI.",
        "string.base": "Video URL must be a string."
    })
});


const showEquipmentSchema = Joi.object({
    search: Joi.string().optional().messages({
        "string.base": "Search must be a string."
    }),
    healthStatus: Joi.string().valid('BAIK', 'BUTUH_PERAWATAN', 'RUSAK').required().messages({
        "any.only": "Health status must be one of 'BAIK', 'BUTUH_PERAWATAN', or 'RUSAK'.",
        "string.base": "Health status must be a string."
    })
});

const deleteEquipmentSchema = Joi.object({
    equipId: Joi.number().min(1).required().messages({
        "number.empty": "Id equipment is required",
        "number.min": "Id equipment must be number at least 1",
        "number.base": "Id equipment must be int"
    }),
    id: Joi.number().min(1).required().messages({
        "number.empty": "Id gym is required",
        "number.min": "Id gym must be number at least 1",
        "number.base": "Id gym must be int"
    }),
});

const getHistoryEquipmentByIdSchema = Joi.object({
    equipId: Joi.number().min(1).required().messages({
        "number.empty": "Id equipment is required",
        "number.min": "Id equipment must be number at least 1",
        "number.base": "Id equipment must be int"
    }),
    historyId: Joi.number().min(1).required().messages({
        "number.empty": "Id history is required",
        "number.min": "Id history must be number at least 1",
        "number.base": "Id history must be int"
    }),
    id: Joi.number().min(1).required().messages({
        "number.empty": "Id gym is required",
        "number.min": "Id gym must be number at least 1",
        "number.base": "Id gym must be int"
    }),
});



const getUserEquipmentSchema = Joi.object({
    search: Joi.string().optional().messages({
        "string.base": "Search must be a string."
    }),
    filter: Joi.string().valid('BAIK', 'BUTUH_PERAWATAN', 'RUSAK').optional().messages({
        "any.only": "Filter must be one of 'BAIK', 'BUTUH_PERAWATAN', or 'RUSAK'.",
        "string.base": "Filter must be a string."
    })
});

export {
    equipmentSchema,
    createEquipmentSchema,
    updateEquipmentSchema,
    showEquipmentSchema,
    deleteEquipmentSchema,
    getHistoryEquipmentByIdSchema,
    getUserEquipmentSchema
}
