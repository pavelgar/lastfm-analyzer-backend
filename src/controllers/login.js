import { Router } from "express"

var router = Router()

router.get("/", async (req, res) => {
  res.status(200).end()
})

router.post("/", async (req, res) => {
  res.status(200).end()
})

module.exports = router
