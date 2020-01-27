import md5 from "md5"
import jwt from "jsonwebtoken"
import axios from "axios"
import { Router } from "express"
import User from "../models/User"

const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_API_SECRET = process.env.LASTFM_API_SECRET
const LASTFM_API_ROOT = process.env.LASTFM_API_ROOT
const JWT_SECRET = process.env.JWT_SECRET

var router = Router()

const getSignature = (params, secret) => {
  const signature = Object.entries(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .flat()
    .concat(secret)
    .join("")
  return md5(signature)
}

router.post("/", async (req, res) => {
  const payload = {
    api_key: LASTFM_API_KEY,
    method: "auth.getSession",
    token: req.body.token
  }

  const api_sig = getSignature(payload, LASTFM_API_SECRET)

  try {
    const session = await axios.get(LASTFM_API_ROOT, {
      params: { ...payload, format: "json", api_sig }
    })
    const { key, name } = session.data.session
    const token = jwt.sign(key, JWT_SECRET)

    let user = await User.findOne({ name })
    if (!user) {
      user = await User.create({ name })
    }

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
