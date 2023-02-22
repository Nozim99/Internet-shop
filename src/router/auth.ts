import express from "express"
import { User, validate } from "../models/User";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv"

dotenv.config()
const router = express.Router()
const jwt_secret = process.env.JWT_KEY

interface UserBody {
  name: string,
  password: string
}

// SignUp
router.post("/signup", (req, res) => {
  const { name, password }: UserBody = req.body;
  if (!name) return res.status(401).json({ error: "Must enter a name" })
  if (!password) return res.status(401).json({ error: "Must enter a password" })

  const { error } = validate(req.body)
  if (error) return res.status(401).json({ error: error.details[0].message })

  User.findOne({ name: { $regex: name, $options: "i" } })
    .then(result => {
      if (result) return res.status(401).json({ error: "This username already exists" })

      // password hashing
      bcrypt.hash(password, 10)
        .then(hashPas => {
          const user = new User({
            name,
            password: hashPas
          })
          user.save().then(user => {
            if (jwt_secret) {
              const token = jwt.sign({ _id: user._id }, jwt_secret)
              return res.json({ token, name })
            } else {
              throw new Error("jwt_secret not found")
            }
          })
        })
        .catch(error => {
          throw new Error(error)
        })
    })
})

// SignIn
router.post("/signin", (req, res) => {
  const { name, password }: UserBody = req.body
  const { error } = validate(req.body)
  if (error) return res.status(401).json({ error: error.details[0].message })

  User.findOne({ name: { $regex: name, $options: "i" } })
    .then(user => {
      if (!user) return res.status(401).json({ error: "Foydalanuvchi nomi xato kiritildi!", name: true })
      if (jwt_secret) {
        bcrypt.compare(password, user.password)
          .then(doMatch => {
            if (!doMatch) return res.status(401).json({ error: "Parol xato kiritildi", password: true })
            const token = jwt.sign({ _id: user._id }, jwt_secret)
            res.json({ token, name: user.name })
          })
      } else {
        throw new Error("jwt_secret not found")
      }
    }).catch(err => {
      throw new Error(err)
    })
})

export default router;