import { Router } from "express"
import User from "../models/User"
import { loadUserTracks, userGetInfo } from "../utils/api"

var router = Router()

router.get("/:id/scrobbles", (req, res) => {
  User.findById(req.params.id, (err, doc) => {
    if (err) res.status(500).json({ error: "Malformatted id" })
    else if (doc) res.json(doc.tracks)
    else res.status(404).json({ error: "User not found" })
  })
})

router.put("/:id/scrobbles", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

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
        user.tracks.push({
          $each: newTracksMap,
          $position: 0
        })
        user.save()
      }
      res.status(200).json(newTracks)
    } catch (error) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data)
      } else {
        console.log(error)
        res.status(500).json({ error: "Something went wrong" })
      }
    }
  } catch (error) {
    res.status(404).json({ error: "User not found" })
  }
})

router.delete("/:id/scrobbles", (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    { $unset: { tracks: "" } },
    { new: true },
    (err, doc) => {
      if (err) res.status(500).json({ error: "Malformatted id" })
      else if (doc) res.json(doc)
      else res.status(404).json({ error: "User not found" })
    }
  )
})

export default router
