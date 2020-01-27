import { Schema, model } from "mongoose"
import Track from "./Track"

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  tracks: [Track.schema]
})

export default model("User", schema)
