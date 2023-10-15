const { Contact } = require("../models/Contact.js");
const HttpError = require("../helpers/HttpError.js");
const ctrlWrapper = require("../decorators/ctrlWrapper.js");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite, name, email } = req.query;
  const skip = (page - 1) * limit;
  const query = { owner };

  if (favorite !== undefined) {
    query.favorite = favorite === "true";
  }

  if (name) {
    query.name = { $regex: new RegExp(name, "i") };
  }

  if (email) {
    query.email = { $regex: new RegExp(email, "i") };
  }

  const result = await Contact.find(query, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "username email");
  res.json(result);
};

const getById = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;

  const result = await Contact.findOne({ _id: contactId, owner });
  if (!result) {
    throw HttpError(404, `Contact with ${contactId} not found`);
  }
  res.json(result);
};

const add = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
};

const updateById = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;

  const result = await Contact.findOneAndUpdate(
    { _id: contactId, owner },
    req.body
  );
  if (!result) {
    throw HttpError(404, `Contact with ${contactId} not found`);
  }
  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;

  const result = await Contact.findOneAndUpdate(
    { _id: contactId, owner },
    req.body
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const deleteById = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;

  const result = await Contact.findOneAndDelete({ _id: contactId, owner });
  if (!result) {
    throw HttpError(404, `Contact with ${contactId} not found`);
  }
  res.json({
    message: "contact deleted",
  });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  updateById: ctrlWrapper(updateById),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  deleteById: ctrlWrapper(deleteById),
};
