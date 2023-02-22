import mongoose from "mongoose"
import Joi from "joi"
const { ObjectId } = mongoose.Types

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  password: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 120,
  },
  cart: [
    {
      type: ObjectId,
      ref: "Product"
    }
  ],
  like: [{
    type: ObjectId,
    ref: "Product"
  }]
})

const validate = (user: any) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50),
    password: Joi.string().required().min(3).max(120)
  })

  return schema.validate(user)
}

const User = mongoose.model("User", userSchema)
export { User, validate }