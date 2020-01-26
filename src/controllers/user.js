import axios from "axios"
import { Router } from "express"
import User from "../models/User"

const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_API_ROOT = process.env.LASTFM_API_ROOT

var router = Router()

const updateScrobbles = async name => {
  const user = await User.findOne({ name })
  if (!user) throw "User not found"

  const params = {
    api_key: LASTFM_API_KEY,
    method: "user.getrecenttracks",
    format: "json",
    limit: 200
  }
  try {
    const response = await axios.get(LASTFM_API_ROOT, { params })
    const { recenttracks } = response.data
  } catch (error) {
    console.log(error.response.data)
  }
}

router.get("/:name/scrobble/counts", async (req, res) => {
  const { name } = req.params

  try {
    // Return signed token and username
    res.status(200).send({ token, name })
  } catch (error) {
    console.log(error.response.data)
    res.status(403).end()
  }
})

export default router
