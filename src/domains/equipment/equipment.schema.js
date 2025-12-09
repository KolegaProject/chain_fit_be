import Joi from "joi";

const createEquipment = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama alat tidak boleh kosong',
    'any.required': 'Nama alat harus diisi'
  }),
  healthStatus: Joi.string().valid('BAIK', 'BUTUH_PERAWATAN', 'RUSAK').required().messages({
    'any.only': 'Status harus salah satu dari: BAIK, BUTUH_PERAWATAN, RUSAK'
  }),
  photo: Joi.string().uri().allow(null, '').optional().messages({
    'string.uri': 'Format URL foto tidak valid'
  })
});

const updateEquipment = Joi.object({
  name: Joi.string().optional(),
  healthStatus: Joi.string().valid('BAIK', 'BUTUH_PERAWATAN', 'RUSAK').optional(),
  photo: Joi.string().uri().allow(null, '').optional()
});

const queryEquipment = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional()
});

export {
  createEquipment,
  updateEquipment,
  queryEquipment
};