const connectionDb = require("./database/connection")
const express = require("express")
const cors = require("cors")
const { PORT } = require("./config")

connectionDb()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(PORT, ()=> console.log("Initialized server on port:", PORT))