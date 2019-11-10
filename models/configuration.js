const Joi = require("joi");
const mongoose = require("mongoose");

const configurationSchema = new mongoose.Schema({
  isAccountCreation: {
    type: Boolean,
    required: true
  },
  isMessaging: {
    type: Boolean,
    required: true
  },
  isSeverity: {
    type: Boolean,
    required: true
  }
});

const Configuration = mongoose.model("Configuration", configurationSchema);

function validateConfigurationObject(configuration) {
  const schema = {
    isAccountCreation: Joi.boolean().required(),
    isMessaging: Joi.boolean().required(),
    isSeverity: Joi.boolean().required()
  };

  return Joi.validate(configuration, schema);
}

exports.Configuration = Configuration;
exports.validate = validateConfigurationObject;
