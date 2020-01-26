import { Schema, model } from "mongoose"

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  total_scrobbles: {
    type: Number,
    default: 0
  },
  tracks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Track"
    }
  ]
})

export default model("User", schema)
