//here we are using npm joi to validate our schema data.It mainly checks whether the data is valid or not.it is a server side validation.
const Joi = require("joi");

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),

    image: Joi.object({
      filename: Joi.string().allow("", null), // allow empty if you want
      url: Joi.string().uri().allow("", null) // allow empty or null when editing
    }).optional() // optional if you sometimes skip image updates
  }).required(),
});

module.exports.listingSchema = listingSchema;


module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
  }).required(),
});