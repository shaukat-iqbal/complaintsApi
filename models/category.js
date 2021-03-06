const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

const Category = mongoose.model(
  "Category",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    hasChild: {
      type: Boolean
    }
  })
);

function validateCategory(category) {
  const schema = {
    name: Joi.string()
      .min(4)
      .required(),
    parentCategory: Joi.ObjectId(),
    hasChild: Joi.boolean(),
    companyId: Joi.ObjectId().required()
  };

  return Joi.validate(category, schema);
}

exports.Category = Category;
exports.validate = validateCategory;
