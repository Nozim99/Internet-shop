import jwt, { JwtPayload } from "jsonwebtoken"
import mongoose from "mongoose"
import { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"
import { User } from "../models/User"

dotenv.config()
const JWT_SECRET = process.env.JWT_KEY;

export interface WidthUser extends Request {
  user?: { _id: mongoose.Types.ObjectId }
}

const login = (req: WidthUser, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ error: "No authorization header provided" })
  if (!JWT_SECRET) return res.status(500).json({ error: "JWT key not found" })

  const token = authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "No token provided" })

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { _id: mongoose.Types.ObjectId }
    User.findById(decoded._id).then(result => {
      if (result) {
        req.user = decoded
        next()
      } else {
        return res.status(404).json({ error: "This user was not found" })
      }
    })
      .catch(err => {
        throw new Error(err)
      })
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" })
  }
}
export { login }