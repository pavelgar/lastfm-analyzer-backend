import { Router } from "express"
import User from "../models/User"
import Track from "../models/Track"
import { loadUserTracks } from "../utils/api"

var router = Router()

router.get("/:id/scrobble/counts", async (req, res) => {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) {
    res.status(403).send({ error: "User not found" })
    return
  }

  const newTracks = user.tracks.length
    ? await loadUserTracks(user.name, user.tracks[0].get("date") + 1)
    : await loadUserTracks(user.name, 1580128907)

  if (newTracks.length) {
    const newTracksMap = newTracks.map(track => new Map(Object.entries(track)))
    user.tracks = newTracksMap.concat(user.tracks)
    user.save()
  }

  res.status(200).send(newTracks)
})

export default router
