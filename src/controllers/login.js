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

const getSignature = (params, secret) =>
  md5(
    Object.keys(params)
      .sort()
      .reduce((signature, key) => signature + key + params[key], "") + secret
  )

router.post("/", async (req, res) => {
  const payload = {
    api_key: LASTFM_API_KEY,
    method: "auth.getSession",
    token: req.body.token
  }

  const api_sig = getSignature(payload, LASTFM_API_SECRET)
  try {
    // Get session
    const session = await axios.get(LASTFM_API_ROOT, {
      params: { ...payload, format: "json", api_sig }
    })
    const { key, name } = session.data.session
    const token = jwt.sign(key, JWT_SECRET)

    // Create user if it doesn't exist yet
    User.create({ username: name }, () => {})

    // Return signed token and username
    res.status(200).send({ token, name })
  } catch (error) {
    console.log(error.response.data)
    res.status(403).end()
  }
})

export default router
