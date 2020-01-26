import { Schema, model } from "mongoose"

const schema = new Schema({
  artist: {
    type: String,
    required: true,
    unique: true
  },
  total_scrobbles: {
    type: Number,
    default: 0
  }
})

export default model("Track", schema)
