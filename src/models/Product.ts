import mongoose from "mongoose";
import Joi from "joi"

const { ObjectId } = mongoose.Types

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 200
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String],
  category: {
    type: String,
    enum: ["Motherboard", "processor", "Ram", "Videocard", "Memory", "Power"]
  },
  like: [{
    type: ObjectId,
    ref: "User"
  }],
  createdBy: {
    type: ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  desc: String,
  character: [{
    name: String,
    desc: String
  }],
  comments: [
    {
      commentBy: {
        type: ObjectId,
        ref: "User"
      },
      comment: String,
      rate: Number,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  bought: {
    type: Number,
    default: 0,
    min: 0
  },
  amount: {
    type: Number,
    default: 0,
    min: 0
  }
})

const validate = (group: any) => {
  const schema = Joi.object({
    name: Joi.string().required().min(5).max(200),
    price: Joi.number().min(0).required(),
    image: Joi.string().required(),
    category: Joi.string().required(),
    character: Joi.array(),
    desc: Joi.string(),
    amount: Joi.number().min(0).required()
  })

  return schema.validate(group)
}

const Product = mongoose.model("Product", ProductSchema)
export { Product }