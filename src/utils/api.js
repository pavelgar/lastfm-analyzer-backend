import md5 from "md5"
import axios from "axios"

const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_API_SECRET = process.env.LASTFM_API_SECRET
const LASTFM_API_ROOT = process.env.LASTFM_API_ROOT

const getSignature = (params, secret) => {
  const signature = Object.entries(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .flat()
    .concat(secret)
    .join("")
  return md5(signature)
}

export const authGetSession = async token => {
  const params = { api_key: LASTFM_API_KEY, method: "auth.getSession", token }
  const api_sig = getSignature(params, LASTFM_API_SECRET)

  const response = await axios.get(LASTFM_API_ROOT, {
    params: { ...params, format: "json", api_sig }
  })
  const { key, name } = response.data.session
  return { key, name }
}

export const userGetInfo = async name => {
  const params = {
    api_key: LASTFM_API_KEY,
    method: "user.getinfo",
    format: "json",
    user: name
  }
  const response = await axios.get(LASTFM_API_ROOT, { params })
  return response.data.user
}

export const loadUserTracks = async (name, from = 0) => {
  // Fetch first page to know how many pages to load
  const firstPage = await userGetRecentTracks(name, from)
  const { last } = firstPage.pages
  if (last == 0 || last == 1) return firstPage.tracks

  // Create a list of API calls
  const pages = [...Array(last - 1).keys()] // Basically a range-function
  const promises = pages.map(page => userGetRecentTracks(name, from, page + 2))

  // Wait for all API calls to resolve
  const data = await Promise.all([firstPage, ...promises])
  return data.map(page => page.tracks).flat()
}

const userGetRecentTracks = async (name, from, page = 1) => {
  const params = {
    api_key: LASTFM_API_KEY,
    method: "user.getrecenttracks",
    format: "json",
    user: name,
    limit: 200,
    page,
    from
  }

  const response = await axios.get(LASTFM_API_ROOT, { params })
  const { recenttracks } = response.data
  let tracks = recenttracks.track

  // Make sure tracks is an array.
  // Because 0 scrobbles but "nowplaying" results in tracks being an object. >:[
  if (!Array.isArray(tracks)) tracks = []

  // Skip first track if it's now playing
  if (tracks[0] && tracks[0]["@attr"] && tracks[0]["@attr"].nowplaying) {
    tracks = tracks.slice(1)
  }

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
