module.exports = function(dependencies, lib) {
  const logger = dependencies('logger');

  return {
    createAttachment,
    getAttachments,
    updateAttachment
  };

  function createAttachment(req, res) {
    // In case of recreate file that's already removed from Linshare
    if (req.attachment) {
      if (!req.body.documentId) { // Delete the old document id of mapping object
        req.body.documentId = null;
      }

      return updateAttachment(req, res);
    }

    const { blobId, asyncTaskId, documentId } = req.body;

    lib.attachment.create({
        userId: req.user.id,
        blobId,
        asyncTaskId,
        documentId
      })
      .then(attachment => {
        res.status(201).json(lib.attachment.denormalize(attachment));
      })
      .catch(err => {
        const details = 'Error while creating attachment';

        logger.error(details, err);

        res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }

  function getAttachments(req, res) {
    var listOptions = {
      userId: req.user.id,
      blobId: req.query.blobId,
      limit: Number(req.query.limit),
      offset: Number(req.query.offset)
    };

    lib.attachment.list(listOptions)
      .then(attachments => attachments.map(lib.attachment.denormalize))
      .then(denormalizedAttachments => res.status(200).json(denormalizedAttachments))
      .catch(err => {
        const details = 'Error while gettings attachment';

        logger.error(details, err);

        res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }

  function updateAttachment(req, res) {
    var updateFields = {};
    var attachmentId = req.params.attachmentId || req.attachment._id;

    if (typeof req.body.documentId !== 'undefined') {
      updateFields.documentId = req.body.documentId;
    }

    if (req.body.asyncTaskId) {
      updateFields.asyncTaskId = req.body.asyncTaskId;
    }

    lib.attachment.updateById(attachmentId, updateFields)
      .then(attachment => res.status(200).json(lib.attachment.denormalize(attachment)))
      .catch(err => {
        const details = 'Error while updating attachment';

        logger.error(details, err);

        res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }
};
