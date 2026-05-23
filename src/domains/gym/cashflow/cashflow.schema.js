import Joi from "joi";

const cashflowSchema = Joi.object({
  cashflowId: Joi.number().min(1).required().messages({
    "any.required": "Id cashflow is required",
    "number.min": "Id cashflow must be number at least 1",
    "number.base": "Id cashflow must be int",
  }),

  id: Joi.number().min(1).required().messages({
    "any.required": "gymId is required",
    "number.min": "gymId must be number at least 1",
    "number.base": "gymId must be int",
  }),
});

const getAllCashflowSchema = Joi.object({
  search: Joi.string().optional().messages({
    "string.base": "name must be string",
  }),

  limit: Joi.number().min(1).optional().messages({
    "number.min": "limit must be number at least 1",
    "number.base": "limit must be int",
  }),

  page: Joi.number().min(1).optional().messages({
    "number.min": "page must be number at least 1",
    "number.base": "page must be int",
  }),
});

const createCashflowSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "name is required",
    "string.empty": "name is required",
    "string.base": "name must be string",
  }),

  amount: Joi.number().min(1).required().messages({
    "any.required": "amount is required",
    "number.min": "amount must be number at least 1",
    "number.base": "amount must be int",
  }),

  date: Joi.date().required().messages({
    "any.required": "date is required",
    "date.base": "date must be date time",
  }),

  note: Joi.string().optional().messages({
    "string.base": "note must be string",
  }),

  transactionType: Joi.string()
    .valid("PENDAPATAN", "PENGELUARAN")
    .required()
    .messages({
      "any.only": "transaction type must be either PENDAPATAN or PENGELUARAN",
      "any.required": "transaction type is required",
      "string.base": "transaction type must be a string",
    }),

  cashflowType: Joi.string()
    .valid("CASH", "CASHLESS")
    .required()
    .messages({
      "any.only": "cashflow type must be either CASH or CASHLESS",
      "any.required": "cashflow type is required",
      "string.base": "cashflow type must be a string",
    }),
});

const updateCashflowSchema = Joi.object({
  name: Joi.string().optional().messages({
    "string.base": "name must be string",
  }),

  amount: Joi.number().min(0).optional().messages({
    "number.min": "amount must be number at least 0",
    "number.base": "amount must be int",
  }),

  date: Joi.date().optional().messages({
    "date.base": "date must be date time",
  }),

  note: Joi.string().optional().messages({
    "string.base": "note must be string",
  }),

  transactionType: Joi.string()
    .valid("PENDAPATAN", "PENGELUARAN")
    .optional()
    .messages({
      "any.only": "transaction type must be either PENDAPATAN or PENGELUARAN",
      "string.base": "transaction type must be a string",
    }),

  cashflowType: Joi.string()
    .valid("CASH", "CASHLESS")
    .optional()
    .messages({
      "any.only": "cashflow type must be either CASH or CASHLESS",
      "string.base": "cashflow type must be a string",
    }),
});

const trendOverviewCashflowSchema = Joi.object({
  year: Joi.string()
    .pattern(/^\d{4}$/)
    .optional()
    .messages({
      "string.pattern.base": "year must be a 4 digit number"
    }),
});

export {
  cashflowSchema,
  createCashflowSchema,
  updateCashflowSchema,
  getAllCashflowSchema,
  trendOverviewCashflowSchema
};