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

const remove = async (req, res) => {
  const publicationId = req.params.id

  const publicationDeleted = await Publication.findOneAndDelete({ user: req.user._id, _id: publicationId })
  if (!publicationDeleted) return res.status(404).send({ status: "error", message: "Publication not found" })

  return res.status(200).send({ status: "success", message: "Publication remove success", publication: publicationId })
}

const user = async (req, res) => {
  const userId = req.params.id
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5

  const publicationStored = await Publication
    .find({ user: userId })
    .sort("-created_at")
    .populate("user", "-password -__v -role")
    .paginate(page, itemsPerPage)
  if (!publicationStored) return res.status(404).send({ status: "error", message: "Publications not found" })
  const total = await Publication.find({ user: userId }).countDocuments().exec()

  return res.status(200).send({
    status: "success",
    message: "User publication list",
    publications: publicationStored,
    page,
    pages: Math.ceil(total / itemsPerPage),
    total
  })
}

module.exports = {
  save,
  detail,
  remove,
  user
}