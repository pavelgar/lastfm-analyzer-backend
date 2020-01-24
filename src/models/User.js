import { Schema, model } from "mongoose"

const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
})

export default model("User", schema)
