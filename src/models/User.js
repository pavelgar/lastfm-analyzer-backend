import { Schema, model } from "mongoose"

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  tracks: [Map]
})

export default model("User", schema)
