import { Router } from "express"
import User from "../models/User"
import { authGetSession } from "../utils/api"

var router = Router()

router.post("/", async (req, res) => {
  try {
    const { token, name } = await authGetSession(req.body.token)
    let user = await User.findOne({ name })
    if (!user) user = await User.create({ name })
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

export default router
