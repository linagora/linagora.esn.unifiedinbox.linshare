const { DEFAULT_OFFSET, DEFAULT_LIMIT } = require('../constants');
const denormalize = require('./denormalize');

module.exports = function(dependencies) {
  const mongoose = dependencies('db').mongo.mongoose;

  const InboxLinshareAttachment = mongoose.model('InboxLinshareAttachment');

  return {
    create,
    denormalize,
    getById,
    list,
    updateById
  };

  function create(attachment) {
    return InboxLinshareAttachment.create(attachment);
  }

  function getById(id) {
    return InboxLinshareAttachment.findOne({ _id: id });
  }

  function list(options = {}) {
    const query = {};

    if (options.userId) {
      query.userId = options.userId;
    }

    if (options.blobId) {
      query.blobId = options.blobId;
    }

    return InboxLinshareAttachment
      .find(query)
      .skip(+options.offset || DEFAULT_OFFSET)
      .limit(+options.limit || DEFAULT_LIMIT)
      .sort({ _id: -1 })
      .exec();
  }

  function updateById(attachmentId, modified) {
    return InboxLinshareAttachment.findOneAndUpdate(
      { _id: attachmentId },
      { $set: modified },
      { new: true } // to return updated document
    ).exec();
  }
};
