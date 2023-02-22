import express from "express"
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { WidthUser, login } from "../middleware/login";

const { ObjectId } = mongoose.Types
const router = express.Router()

// Like product
router.put("/like/product", login, async (req: WidthUser, res) => {
    const { id } = req.body
    if (!ObjectId.isValid(id)) return res.status(401).json({ error: "Invalid id value" })

    const product = await Product.findById(id)
    const user = await User.findById(req.user?._id)
    if (!product) return res.status(401).json({ error: "This product was not found" })

    if (user?.like.includes(id)) return res.status(401).json({ error: "This product has been saved" })

    user?.like.push(id)
    await user?.save().then(result => {
        return res.json({ cart: result.cart, like: result.like })
    }).catch(err => {
        throw new Error(err)
    })
})

// Remove product from like
router.delete("/like/remove/:id", login, async (req: WidthUser, res) => {
    const id: any = req.params.id
    if (!isValidObjectId(id)) return res.status(401).json({ error: "Invalid id value" })

    const user = await User.findById(req.user?._id)

    if (!user?.like.includes(id)) return res.status(401).json({ error: "This product is not available" })

    const index = user.like.indexOf(id)
    user.like.splice(index, 1)

    await user.save().then(result => {
        return res.json({ cart: result.cart, like: result.like })
    }).catch(err => {
        throw new Error(err)
    })
})

// Add product to cart
router.put("/cart/product", login, async (req: WidthUser, res) => {
    const { id } = req.body;
    if (!isValidObjectId(id)) return res.status(401).json({ error: "Invalid id value" })

    const product = await Product.findById(id)
    const user = await User.findById(req.user?._id)

    if (!product) return res.status(401).json({ error: "This product was not found" })
    if (user?.cart.includes(id)) return res.status(401).json({ error: "This product has been saved" })

    user?.cart.push(id)
    await user?.save().then(result => {
        return res.json({ cart: result.cart, like: result.like })
    }).catch(err => {
        throw new Error(err)
    })
})

// Remove product from cart
router.delete("/cart/remove/:id", login, async (req: WidthUser, res) => {
    const id: any = req.params.id
    if (!isValidObjectId(id)) return res.status(401).json({ error: "Invalid id value" })

    const product = await Product.findById(id)
    const user = await User.findById(req.user?._id)

    if (!product) return res.status(401).json({ error: "This product was not found" })
    if (!user) return res.status(401).json({ error: "This user was not found" })
    if (!user.cart.includes(id)) return res.status(401).json({ error: "This product is not available" })

    const index = user?.cart.indexOf(id)
    user.cart.splice(index, 1)
    await user.save().then(result => {
        return res.json({ cart: result.cart, like: result.like })
    }).catch(err => {
        throw new Error(err)
    })
})

// Get user
router.get("/info", login, (req: WidthUser, res) => {
    User.findById(req.user?._id)
        .select("cart like")
        .then(result => {
            if (!result) return res.status(401).json({ error: "This user was not found" })
            return res.json({ cart: result.cart, like: result.like })
        })
})

// Get Liked products
router.get("/liked/products", login, async (req: WidthUser, res) => {
    const user = await User.findById(req.user?._id)
    const group = await Product.find({ _id: { $in: user?.like } })
    return res.json(group)
})

// Get products from cart
router.get("/products/from/cart", login, async (req: WidthUser, res) => {
    const user = await User.findById(req.user?._id)
    const product = await Product.find({ _id: { $in: user?.cart } })
    return res.json(product)
})

// Get my products
router.get("/get/my/products", login, (req: WidthUser, res) => {
    Product.find({ createdBy: req.user?._id })
        .then(result => {
            return res.json(result)
        })
})

export default router