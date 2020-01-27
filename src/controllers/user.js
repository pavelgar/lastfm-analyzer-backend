import axios from "axios"
import { Router } from "express"
import User from "../models/User"

const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_API_ROOT = process.env.LASTFM_API_ROOT

var router = Router()

const fetchUserTracksPage = async (name, from, page = 1) => {
  const params = {
    api_key: LASTFM_API_KEY,
    method: "user.getrecenttracks",
    format: "json",
    user: name,
    limit: 100,
    page,
    from
  }

  const response = await axios.get(LASTFM_API_ROOT, { params })
  const { recenttracks } = response.data
  const tracks = recenttracks.track
  const attr = recenttracks["@attr"]
  const mappedTracks = tracks.map(track => ({
    mbid: track.mbid,
    name: track.name,
    artist: track.artist["#text"],
    album: track.album["#text"],
    date: parseInt(track.date.uts)
  }))

  return {
    tracks: mappedTracks,
    pages: { current: parseInt(attr.page), last: parseInt(attr.totalPages) }
  }
}

const loadUserTracks = async (name, from = 0) => {
  const firstPage = await fetchUserTracksPage(name, from)
  const promises = Array.from(Array(firstPage.pages.last - 1), (_, index) =>
    fetchUserTracksPage(name, from, index + 2)
  )

  try {
    const data = await Promise.all([firstPage, ...promises])
    return data.map(page => page.tracks).flat()
  } catch (error) {
    console.log(error)
  }
  return null
}

const getSavedTracks = async user => {
  return await loadUserTracks(user.name, 1579769535)

  if (user.tracks) {
    const newTracks = await loadUserTracks(user.name, user.tracks[0].date + 1)
    // If no new tracks, return the currently saved. Keep the reverse order.
    return newTracks ? newTracks.concat(user.tracks) : user.tracks
  }
  return await loadUserTracks(user.name)
}

router.get("/:id/scrobble/counts", async (req, res) => {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) {
    res.status(403).send({ error: "User not found" })
    return
  }

  const tracks = await getSavedTracks(user)
  res.status(200).send({ tracks })
})

export default router
