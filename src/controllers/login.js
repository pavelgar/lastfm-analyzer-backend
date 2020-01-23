import md5 from "md5"
import qs from "qs"
import axios from "axios"
import { Router } from "express"

var router = Router()

const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_API_SECRET = process.env.LASTFM_API_SECRET
const LASTFM_API_ROOT = process.env.LASTFM_API_ROOT

const getSignature = (params, secret) =>
  md5(
    Object.keys(params)
      .sort()
      .reduce((signature, key) => signature + key + params[key], "") + secret
  )

router.post("/", async (req, res) => {
  const payload = {
    api_key: LASTFM_API_KEY,
    format: "json",
    method: "auth.getSession",
    token: req.body.token
  }

  const api_sig = getSignature(payload, LASTFM_API_SECRET)
  const query = qs.stringify({ ...payload, api_sig })
  axios
    .get(LASTFM_API_ROOT, query)
    .then(response => res.json(response.data))
    .catch(error => {
      console.log(error)
      res.status(404).end()
    })
})

module.exports = router
