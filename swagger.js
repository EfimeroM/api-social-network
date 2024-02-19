const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs")

const swaggerDocument = YAML.load("./swagger.yaml");

const swaggerDocs = (app, port) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  app.get("/api/docs.json", (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerDocument)
  })

  console.log(`API docs are available at http://localhost:${port}/api/docs`)
}

module.exports = { swaggerDocs }
