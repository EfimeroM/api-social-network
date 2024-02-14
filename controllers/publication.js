const Publication = require("../models/Publication")
const followService = require("../services/followService")
const fs = require("fs")
const path = require("path")
const { PUBLICATIONS_IMAGE_PATH } = require("../config")

const save = async (req, res) => {
  const params = req.body
  if (!params.text) return res.status(404).json({ status: "error", message: "Post text not found" })

  try {
    const publicationStored = await Publication.create({ ...params, user: req.user._id })
    if (!publicationStored) return res.status(400).json({ status: "error", message: "Unsaved post" })

    return res.status(200).json({ status: "success", message: "Publication saved", publicationStored })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to save post" })
  }
}

const detail = async (req, res) => {
  const publicationId = req.params.id

  try {
    const publicationStored = await Publication
      .findById(publicationId)
      .populate("user", "-password -role -__v -email -created_at -bio")
    if (!publicationStored) return res.status(404).json({ status: "error", message: "Publication not found" })

    return res.status(200).json({ status: "success", message: "Detail of publication ", publication: publicationStored })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to get post" })
  }
}

const remove = async (req, res) => {
  const publicationId = req.params.id

  try {
    const publicationDeleted = await Publication.findOneAndDelete({ user: req.user._id, _id: publicationId })
    if (!publicationDeleted) return res.status(404).json({ status: "error", message: "Publication not found" })

    return res.status(200).json({ status: "success", message: "Publication remove success", publicationId: publicationDeleted._id })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to delete post" })
  }
}

const user = async (req, res) => {
  const userId = req.params.id
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5

  try {
    const publicationStored = await Publication
      .find({ user: userId })
      .sort("-created_at")
      .populate("user", "-password -__v -role -email -created_at")
      .paginate(page, itemsPerPage)
    if (!publicationStored) return res.status(404).json({ status: "error", message: "Publications not found" })

    const total = await Publication.find({ user: userId }).countDocuments()

    return res.status(200).json({
      status: "success",
      message: "User publication list",
      page,
      pages: Math.ceil(total / itemsPerPage),
      itemsPerPage,
      total,
      publications: publicationStored
    })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to get posts" })
  }
}

const uploadImage = async (req, res) => {
  const publicationId = req.params.id
  const { file } = req
  if (!file) return res.status(404).json({ status: "error", message: "Image not found" })
  let fileName = file.originalname
  let splitFile = fileName.split(".")
  let fileExtension = splitFile[1]

  if (!["png", "jpg", "jpeg", "gif"].includes(fileExtension)) {
    fs.unlinkSync(file.path)
    return res.status(400).json({ status: "error", message: "Invalid File" })
  }

  try {
    const publicationUpdated = await Publication.findOneAndUpdate({
      user: req.user._id,
      _id: publicationId
    }, { file: req.file.filename }, { new: true })
    if (!publicationUpdated) return res.status(400).json({ status: "error", message: "Error to update publication image" })

    return res.status(200).json({
      status: "success",
      message: "Image publication uploaded",
      publication: publicationUpdated,
      file
    })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to upload image in post" })
  }
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
      .populate("user", "-password -role -__v -email -created_at")
      .sort("-created_at")
      .paginate(page, itemsPerPage)
    if (!publicationsStored) return res.status(404).json({ status: "error", message: "Publications not found" })

    const total = await Publication.find({ user: { $in: following } }).countDocuments()

    return res.status(200).json({
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
    return res.status(500).json({ status: "error", message: "Error to get follows publications" })
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