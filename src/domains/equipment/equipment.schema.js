import Joi from "joi";

const createEquipmentSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama alat tidak boleh kosong',
    'any.required': 'Nama alat wajib diisi'
  }),
  healthStatus: Joi.string()
    .valid('BAIK', 'BUTUH_PERAWATAN', 'RUSAK')
    .required()
    .messages({
      'any.only': 'Status kesehatan harus salah satu dari: BAIK, BUTUH_PERAWATAN, RUSAK',
      'any.required': 'Status kesehatan wajib diisi'
    }),
  photo: Joi.string().optional()
});

const updateEquipmentSchema = Joi.object({
  name: Joi.string().optional(),
  healthStatus: Joi.string()
    .valid('BAIK', 'BUTUH_PERAWATAN', 'RUSAK')
    .optional(),
  photo: Joi.string().optional()
});

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema
};