import { Schema, model } from "mongoose"

const schema = new Schema({
  mbid: String, // mbid
  name: String, // track name
  artist: String, // artist name
  album: String, // album name
  date: {
    type: Number, // scrobble timestamp
    required: true
  }
})

export default model("Track", schema)
