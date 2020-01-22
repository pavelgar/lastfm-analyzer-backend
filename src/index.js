import "dotenv/config"
import express from "express"
import bodyParser from "body-parser"
import morgan from "morgan"

const app = express()

morgan.token("body", req => JSON.stringify(req.body))

app.use(bodyParser.json())
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
)

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.use((req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
})

app.use((error, req, res, next) => {
  console.error(error.message)
  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message })
  }
  next(error)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => console.log(`Server running on port ${PORT}!`))
