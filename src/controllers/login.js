import { Router } from "express"
import jwt from "jsonwebtoken"
import User from "../models/User"
import { authGetSession } from "../utils/api"

const JWT_SECRET = process.env.JWT_SECRET

var router = Router()

router.post("/", async (req, res) => {
  try {
    // Get the session
    const { key, name } = await authGetSession(req.body.token)

    // Fetch or create new user
    let user = await User.findOne({ name })
    if (!user) user = await User.create({ name })

    // Sign the token and
    // return token, name and userID to the user
    const token = jwt.sign(key, JWT_SECRET)
    res.status(200).send({ token, name, id: user._id })
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response
      res.status(status).send(data)
    } else {
      res.status(403).end()
    }
  }
})

router.post("/verify", async (req, res) => {
  const { token } = req.body
  if (!token) res.status(400).json({ error: "Token not provided" })
  const decoded = jwt.verify(token, JWT_SECRET)
  console.log(decoded)
  res.status(204).end()
})

export default router
