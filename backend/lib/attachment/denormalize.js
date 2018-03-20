module.exports = denormalize;

function denormalize(attachment) {
  return {
    id: attachment.id,
    userId: attachment.userId,
    blobId: attachment.blobId,
    asyncTaskId: attachment.asyncTaskId,
    documentId: attachment.documentId
  };
}
