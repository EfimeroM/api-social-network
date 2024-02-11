const Publication = require("../models/Publication")

const save = async (req, res) => {
  const params = req.body
  if (!params.text) return res.status(404).send({ status: "error", message: "Post text not found" })

  const newPublication = new Publication(params)
  newPublication.user = req.user._id
  const publicationStored = await newPublication.save()
  if (!publicationStored) return res.status(400).send({ status: "error", message: "Unsaved post" })

  return res.status(200).send({ status: "success", message: "Publication saved", publicationStored })
}

const detail = async (req, res) => {
  const publicationId = req.params.id

  const publicationStored = await Publication.findById(publicationId)
  if (!publicationStored) return res.status(404).send({ status: "error", message: "Publication not found" })

  return res.status(200).send({ status: "success", message: "Detail of publication ", publication: publicationStored })
}

module.exports = {
  save,
  detail
}