const Publication = require("../models/Publication")
const fs = require("fs")
const path = require("path")
const followService = require("../services/followService")
const { PUBLICATIONS_IMAGE_PATH } = require("../config")

//delete email populate
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
    .populate("user", "-password -__v -role -email")
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

const uploadImage = async (req, res) => {
  const publicationId = req.params.id
  const { file } = req
  if (!file) return res.status(404).json({ status: "error", message: "Image not found" })
  let fileName = file.originalname
  let split_file = fileName.split(".")
  let file_extension = split_file[1]

  if (!["png", "jpg", "jpeg", "gif"].includes(file_extension)) {
    fs.unlinkSync(file.path)
    return res.status(400).json({ status: "error", message: "Invalid File" })
  }

  const publicationUpdated = await Publication.findOneAndUpdate({ user: req.user._id, _id: publicationId }, { file: req.file.filename }, { new: true })
  if (!publicationUpdated) return res.status(400).json({ status: "error", message: "Error to update publication image" })
  return res.status(200).send({ status: "success", message: "Image publication uploaded", publication: publicationUpdated, file })
}

const getImage = async (req, res) => {
  const fileName = req.params.file
  const filePath = `${PUBLICATIONS_IMAGE_PATH}${fileName}`

  fs.stat(filePath, (error, exists) => {
    if (exists) return res.sendFile(path.resolve(filePath))
    else return res.status(404).json({ status: "error", message: "Image publication not found", fileName, filePath })
  })
}

const feed = async (req, res) => {
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5

  try {
    const { following } = await followService.followUserIds(req.user._id)
    const publicationsStored = await Publication
      .find({ user: { $in: following } })
      .populate("user", "-password -role -__v -email")
      .sort("-created_at")
      .paginate(page, itemsPerPage)
    if (!publicationsStored) return res.status(404).send({ status: "error", message: "Publications not found" })
    const total = await Publication.find({ user: { $in: following } }).countDocuments().exec()

    return res.status(200).send({
      status: "success",
      message: "Feed of my follows",
      page,
      pages: Math.ceil(total / itemsPerPage),
      total,
      itemsPerPage,
      following,
      publications: publicationsStored
    })
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error to get follows publications" })
  }
}

module.exports = {
  save,
  detail,
  remove,
  user,
  uploadImage,
  getImage,
  feed
}