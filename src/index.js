import "dotenv/config"
import express from "express"
import bodyParser from "body-parser"
import morgan from "morgan"
import mongoose from "mongoose"

import middleware from "./utils/middleware"

import loginRouter from "./controllers/login"
import userRouter from "./controllers/user"

const app = express()

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch(error => {
    console.log("Error connection to MongoDB:", error.message)
  })

app.use(bodyParser.json())
morgan.token("body", req => JSON.stringify(req.body))
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
)
app.use(middleware.tokenExtractor)

app.use("/api/login", loginRouter)
app.use("/api/users", userRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}!`))
