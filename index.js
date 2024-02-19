const connectionDb = require("./database/connection")
const express = require("express")
const cors = require("cors")
const { PORT } = require("./config")
const UserRoutes = require("./routes/user")
const PublicationRoutes = require("./routes/publication")
const FollowRoutes = require("./routes/follow")
const { swaggerDocs } = require("./swagger")

connectionDb()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/user", UserRoutes)
app.use("/api/publication", PublicationRoutes)
app.use("/api/follow", FollowRoutes)

app.listen(PORT, () => {
  console.log(`Initialized server on port:: ${PORT}`)
  swaggerDocs(app, PORT)
})