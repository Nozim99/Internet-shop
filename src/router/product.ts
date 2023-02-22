import express from "express"
import mongoose, { isValidObjectId, ObjectId } from "mongoose"
import { login, WidthUser } from "../middleware/login"
import { Product } from "../models/Product"
import { User } from "../models/User"

const router = express.Router()

// Get products
router.get("/products", async (req, res) => {
  const limit = Number(req.query.limit)
  if (!limit || typeof limit !== "number") return res.status(401).json({ error: "invalid pagination value" })
  const count = (await Product.find()).length
  // const products = await Product.find().limit(limit)
  const products = await Product.find({ amount: { $gt: 0 } }).limit(limit)
  return res.json({ count, data: products })
})

// Get products by category
router.get("/get/products/byId", async (req, res) => {
  const { category } = req.query
  const limit = Number(req.query.limit)
  if (!limit || typeof limit !== "number") return res.status(401).json({ error: "invalid limit value" })

  const count = (await Product.find({ category })).length
  const groups = await Product.find({ category }).limit(limit)

  return res.json({ count, data: groups })
})

// Get product by id
router.get("/product/:id", (req, res) => {
  const { id } = req.params
  if (!isValidObjectId(id)) return res.status(401).json({ error: "Invalid group id" })
  Product.findById(id)
    .populate("comments.commentBy", "name")
    .then(result => {
      if (!result) return res.status(401).json({ error: "This group was not found" })
      return res.json(result)
    })
    .catch(error => {
      throw new Error(error)
    })
})

// Create product
router.post("/create/product", login, (req: WidthUser, res) => {
  interface ReqBody {
    name: string;
    price: number;
    image: string;
    category: "Motherboard" | "processor" | "Ram" | "Videocard" | "Memory" | "Power";
    desc: string;
    character: {
      name: string,
      desc: string
    }[];
    amount: number;
  }
  const { name, price, image, category, desc, character, amount } = req.body as ReqBody
  if (!name || !price || !image || !desc || !character || !amount) return res.status(401).json({ error: "Ma'lumotni to'liq kiriting" })
  if (!category || (category !== "Motherboard" && category !== "processor" && category !== "Ram" && category !== "Videocard" && category !== "Memory" && category !== "Power")) return res.status(401).json({ error: "category ma'lumoti yo'q" })

  const product = new Product({
    createdBy: req.user?._id,
    name,
    price,
    images: [image],
    category,
    desc,
    character,
    amount
  })

  product.save()
    .then(result => {
      return res.json(result._id)
    })
    .catch(err => {
      throw new Error(err)
    })
})

// Buy product
router.put("/buy/product", login, async (req: WidthUser, res) => {
  const { id, amount }: { id: string, amount: number } = req.body
  if (!amount || amount <= 0) return res.status(401).json({ error: "Invalid amount value" })
  if (!isValidObjectId(id)) return res.status(401).json({ error: "Invalid group id value" })
  const group = await Product.findById(id)
  if (!group) return res.status(401).json({ error: "This group was not found" })
  if (group.amount <= 0) return res.status(401).json({ error: "The product is out of stock" })
  if (group.amount < amount) return res.status(401).json({ error: "The number of products is insufficient" })

  group.amount = group.amount - amount;
  group.bought = group.bought + amount;
  group.save().then(result => {
    return res.json(result)
  })
})

// Add comment
router.post("/add/comment", login, async (req: WidthUser, res) => {
  const { rate, comment, productId }: { rate: number, comment: string, productId: string } = req.body
  if (!rate) return res.status(401).json({ error: "rate value is not available" })
  if (!productId) return res.status(401).json({ error: "productId value is not available" })
  if (!isValidObjectId(productId)) return res.status(401).json({ error: "Invalid product id" })

  const product = await Product.findByIdAndUpdate(productId, {
    $push: { comments: { commentBy: req.user?._id, rate, comment } }
  }, { new: true }).populate("comments.commentBy", "name")
  if (!product) return res.status(401).json({ error: "This product was not found" })
  return res.json(product)
})

// Delete product
router.delete("/delete/product/:id", login, async (req: WidthUser, res) => {
  const { id } = req.params
  if (!isValidObjectId(id)) return res.status(401).json({ error: "Invalid id value" })
  const data = await Product.findById(id)
  if (!data) return res.status(401).json({ error: "This product was not found" })
  if (String(data.createdBy) !== String(req.user?._id)) {
    return res.status(401).json({ error: "You can not delete this group" })
  } else {
    Product.findByIdAndRemove(id).then(() => {
      Product.find({ createdBy: req.user?._id }).then(group => {
        return res.json(group)
      }).catch(error => { throw new Error(error) })
    }).catch(error => { throw new Error(error) })
  }
})

// Increase the amount of product
router.post("/increase/amount/of/product", login, async (req: WidthUser, res) => {
  const { amount, groupId }: { amount: number, groupId: string } = req.body;
  if (!isValidObjectId(groupId)) return res.status(401).json({ error: "Invalid group id" })
  if (!amount || typeof amount !== "number" || amount <= 0 || !Number.isInteger(amount)) return res.status(401).json({ error: "Invalid amount value" })
  const group = await Product.findById(groupId)
  if (!group) return res.status(401).json({ error: "This group was not found" })
  if (String(group.createdBy) !== String(req.user?._id)) return res.status(401).json({ error: "You can not change this group" })
  if (group.amount) {
    group.amount += amount
  } else {
    group.amount = amount
  }
  group.save().then(() => {
    Product.find({ createdBy: req.user?._id }).then(result => {
      return res.json(result)
    }).catch(error => {
      throw new Error(error)
    })
  })
})

export default router
