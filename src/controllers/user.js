import { Router } from "express"
import User from "../models/User"
import { loadUserTracks, userGetInfo } from "../utils/api"

var router = Router()

router.get("/:id/scrobble/counts", async (req, res) => {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) {
    res.status(403).send({ error: "User not found" })
    return
  }

  try {
    const newTracks = user.tracks.length
      ? await loadUserTracks(user.name, user.tracks[0].get("date") + 1)
      : await loadUserTracks(user.name)

    // TODO: Detect deleted scrobbles and remove those from the database
    // Use userGetInfo(user.name) to get up-to-date scrobble count.

    if (newTracks.length) {
      const newTracksMap = newTracks.map(
        track => new Map(Object.entries(track))
      )
      user.tracks = newTracksMap.concat(user.tracks)
      user.save()
    }
    res.status(200).send(newTracks)
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data)
    } else {
      res.status(403).send({ error: "Something went wrong" })
    }
  }
})

export default router
