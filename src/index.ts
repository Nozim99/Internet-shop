import express from "express"
import mongoose from "mongoose"
import helmet from "helmet"
import product from "./router/product"
import auth from "./router/auth"
import cors from "cors"
import user from "./router/user"
import dotenv from "dotenv"

dotenv.config()
const mongoKey = process.env.MONGO_KEY

mongoose.set("strictQuery", true)
// mongoose.connect("mongodb://localhost/Online-shop", { family: 4 })
mongoose.connect(`mongodb+srv://wick3758:${mongoKey}@online-shop.lbiibpd.mongodb.net/Online-shop`, { family: 4 })
const app = express()
app.use(cors())
app.use(helmet())
app.use(express.json())
try {
  app.use("/product", product)
  app.use("/auth", auth)
  app.use("/user", user)
} catch (error) {
  console.log(error)
}
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server has been started: ${PORT}...`)
})