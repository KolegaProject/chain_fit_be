import Joi from "joi";

const createTutorialVideo = Joi.object({
  equipmentId: Joi.number().integer().required().messages({
    'any.required': 'ID Equipment harus diisi',
    'number.base': 'ID Equipment harus berupa angka'
  }),
  title: Joi.string().required().messages({
    'string.empty': 'Judul video tidak boleh kosong'
  }),
  url: Joi.string().uri().required().messages({
    'string.uri': 'Format URL tidak valid (harus http/https)'
  }),
  description: Joi.string().allow('', null).optional()
});

const updateTutorialVideo = Joi.object({
  title: Joi.string().optional(),
  url: Joi.string().uri().optional(),
  description: Joi.string().allow('', null).optional(),
  equipmentId: Joi.number().integer().optional() 
});

const queryTutorialVideo = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  equipmentId: Joi.number().integer().optional() // Filter video berdasarkan alat spesifik
});

export {
  createTutorialVideo,
  updateTutorialVideo,
  queryTutorialVideo
};